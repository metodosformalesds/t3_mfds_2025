# app/api/v1/endpoints/solicitud.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.user import Proveedor_Servicio, Usuario
# Asegúrate de que esta importación sea correcta según tu estructura
# Si 'foto_trabajo.py' está en 'app/models/', esta importación es correcta.
from app.models.foto_trabajo import Foto_Trabajo_Anterior 
from app.services.cognito_service import cognito_service  # Importas tu servicio de Cognito
import uuid
import logging # Es buena práctica añadir logging

# Configurar logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/solicitudes", tags=["Solicitudes de Proveedor"])


# =========================================================
# 1️⃣ CREAR SOLICITUD DE PROVEEDOR (CLIENTE)
# RF-06 / CU-07
# Endpoint AJUSTADO (sin 'telefono_contacto')
# =========================================================

@router.post("/")
async def crear_solicitud_proveedor(
    # --- Campos del formulario de Figma (corregido) ---
    # 'telefono_contacto' se elimina, se usará el del perfil de Usuario
    curp: str = Form(...),
    direccion: str = Form(...),
    años_experiencia: int = Form(..., description="El frontend debe enviar un valor numérico (ej: 1, 3, 5, 10)"),
    descripcion_servicios: Optional[str] = Form(None),
    servicios_ofrece: List[str] = Form(..., description="Lista de servicios seleccionados, ej: ['Electricidad', 'Pintura']"),
    fotos: List[UploadFile] = File(..., description="Evidencia fotográfica"),
    
    # --- Datos adicionales del frontend ---
    nombre_completo: str = Form(...), # Nombre completo del usuario
    user_email: str = Form(...), # Email del usuario logueado
    db: Session = Depends(get_db) # Inyectar la sesión de DB
):
    """
    Crea una solicitud de proveedor (postulación) asociada a un usuario (cliente) existente.
    Guarda todos los datos del formulario de Figma y sube las fotos de evidencia.
    El teléfono se hereda del perfil de usuario base.
    """
    
    try:
        # 🔹 1. Buscar usuario por correo
        usuario = db.query(Usuario).filter(Usuario.correo_electronico == user_email).first()
        if not usuario:
            logger.warning(f"Intento de solicitud para usuario no existente: {user_email}")
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")
            
        # (Opcional) Verificar si el usuario tiene un número de teléfono registrado
        if not usuario.numero_telefono:
             logger.warning(f"Usuario {user_email} intenta postularse sin número de teléfono.")
             # Depende de tus reglas de negocio si esto es un error o no
             # raise HTTPException(status_code=400, detail="Por favor, añade un número de teléfono a tu perfil antes de postularte.")


        # 🔹 2. Verificar si ya tiene una solicitud o es proveedor activo
        if usuario.proveedor_servicio:
            logger.warning(f"Usuario {user_email} ya tiene una solicitud o es proveedor.")
            raise HTTPException(status_code=400, detail="Ya existe una solicitud o eres proveedor activo.")

        # 🔹 3. Convertir la lista de servicios en un string (ej: "Electricidad, Pintura, Plomería")
        especializaciones_str = ", ".join(servicios_ofrece)

        # 🔹 4. Crear la solicitud en la tabla Proveedor_Servicio
        solicitud = Proveedor_Servicio(
            id_proveedor=usuario.id_usuario, # Se usa el ID del usuario como FK
            nombre_completo=nombre_completo,
            # 'telefono_contacto' se omite aquí
            direccion=direccion,
            curp=curp,
            años_experiencia=años_experiencia,
            experiencia_profesional=descripcion_servicios, # Mapeado a "Descripcion de tus servicios"
            especializaciones=especializaciones_str, # Mapeado a "Servicios que ofreces"
            estado_solicitud="pendiente", # Estado inicial
            fecha_solicitud=datetime.utcnow()
        )

        db.add(solicitud)
        db.commit()
        db.refresh(solicitud)

        # 🔹 5. Guardar fotos (Simulación de subida a S3)
        urls_fotos_guardadas = []
        for file in fotos:
            nombre_archivo = f"evidencia/{uuid.uuid4()}_{file.filename}"
            url_simulada_s3 = f"https://s3.amazonaws.com/easyhome-service-images/{nombre_archivo}"
            
            nueva_foto = Foto_Trabajo_Anterior(
                id_proveedor=solicitud.id_proveedor,
                url_imagen=url_simulada_s3,
                descripcion="Evidencia de trabajo (postulación)"
            )
            db.add(nueva_foto)
            urls_fotos_guardadas.append(url_simulada_s3)
        
        db.commit()
        logger.info(f"Nueva solicitud creada para {user_email}, ID: {solicitud.id_proveedor}")

        return {
            "message": "Solicitud enviada correctamente.",
            "estado": solicitud.estado_solicitud,
            "id_solicitud": solicitud.id_proveedor,
            "fotos_subidas": urls_fotos_guardadas,
            "telefono_registrado": usuario.numero_telefono # Devuelve el teléfono que ya estaba
        }
    except Exception as e:
        db.rollback() # Revertir cambios en caso de error
        logger.error(f"Error al crear solicitud para {user_email}: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {e}")


# =========================================================
# 2️⃣ MOSTRAR SOLICITUDES (ADMINISTRADOR)
# RF-07 / CU-08
# =========================================================

@router.get("/admin")
def listar_solicitudes_admin(db: Session = Depends(get_db)):
    """
    Muestra todas las solicitudes de proveedores (pendientes, aprobadas, rechazadas).
    Solo debe ser consumido por un usuario Administrador.
    """
    try:
        # Query para traer todas las solicitudes y la información del usuario asociado
        solicitudes = db.query(Proveedor_Servicio, Usuario.correo_electronico, Usuario.nombre, Usuario.numero_telefono)\
            .join(Usuario, Proveedor_Servicio.id_proveedor == Usuario.id_usuario)\
            .order_by(Proveedor_Servicio.fecha_solicitud.desc())\
            .all()

        resultado = []
        for s, email, nombre, telefono in solicitudes:
            resultado.append({
                "id_proveedor": s.id_proveedor,
                "nombre_completo": s.nombre_completo,
                "email_usuario": email,
                "nombre_usuario": nombre,
                "telefono_usuario": telefono, # Se añade el teléfono del usuario base
                "direccion": s.direccion,
                "curp": s.curp,
                "años_experiencia": s.años_experiencia,
                "estado_solicitud": s.estado_solicitud,
                "fecha_solicitud": s.fecha_solicitud,
                "fecha_aprobacion": s.fecha_aprobacion,
                "especializaciones": s.especializaciones
            })
        return resultado
    except Exception as e:
        logger.error(f"Error al listar solicitudes de admin: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener las solicitudes.")


# =========================================================
# 3️⃣ APROBAR O RECHAZAR SOLICITUD (ADMINISTRADOR)
# RF-07 / CU-08
# =========================================================

@router.put("/admin/{id_proveedor}")
def actualizar_estado_solicitud(
    id_proveedor: int,
    estado: str = Form(..., description="Debe ser 'aprobado' o 'rechazado'"),
    db: Session = Depends(get_db)
):
    """
    Permite al administrador aprobar o rechazar una solicitud.
    Si se APRUEBA:
    1. Cambia el estado en la BD.
    2. Cambia el 'tipo_usuario' a 'proveedor' en la tabla 'usuario'.
    3. Mueve al usuario al grupo 'Trabajadores' en Cognito.
    Si se RECHAZA:
    1. Solo cambia el estado en la BD.
    """
    solicitud = db.query(Proveedor_Servicio).filter(Proveedor_Servicio.id_proveedor == id_proveedor).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada.")

    if estado not in ["aprobado", "rechazado"]:
        raise HTTPException(status_code=400, detail="Estado inválido. Use 'aprobado' o 'rechazado'.")

    # 🔹 1. Actualizar el estado en BD
    solicitud.estado_solicitud = estado
    
    usuario = db.query(Usuario).filter(Usuario.id_usuario == solicitud.id_proveedor).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario asociado a la solicitud no encontrado.")

    # 🔹 2. Lógica de APROBACIÓN
    if estado == "aprobado":
        solicitud.fecha_aprobacion = datetime.utcnow()
        solicitud.tiempo_activo_desde = datetime.utcnow() # Inicia tiempo como proveedor
        
        try:
            # Actualizamos tipo_usuario local
            usuario.tipo_usuario = "proveedor"
            
            # -----------------------------------------------------------------
            # AQUI ESTÁ LA LÓGICA DE CAMBIO DE GRUPO QUE PEDISTE
            # Se llama a tu servicio de cognito para mover al usuario
            # -----------------------------------------------------------------
            cognito_service.add_user_to_group(
                username=usuario.correo_electronico, 
                group_name="Trabajadores" # El grupo de proveedores
            )
            
            logger.info(f"Solicitud {id_proveedor} APROBADA. Usuario {usuario.correo_electronico} movido a 'Trabajadores'.")
        
        except Exception as e:
            db.rollback()
            logger.error(f"Error en Cognito al aprobar {id_proveedor}: {e}")
            raise HTTPException(status_code=500, detail=f"Error al actualizar grupo en Cognito: {e}")
            
    else: # Lógica de RECHAZO
        solicitud.fecha_aprobacion = None
        logger.info(f"Solicitud {id_proveedor} RECHAZADA.")
    
    db.commit()

    return {
        "message": f"Solicitud {estado} correctamente.", 
        "id_proveedor": id_proveedor,
        "nuevo_estado": estado
    }