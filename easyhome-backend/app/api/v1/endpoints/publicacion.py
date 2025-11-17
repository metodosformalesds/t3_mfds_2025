from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import uuid
import logging

# --- Importaciones de tu proyecto ---
from app.core.database import get_db
from app.models.user import Usuario, Proveedor_Servicio
# Ajusta esta importación si tus modelos están en archivos separados
from app.models.property import Publicacion_Servicio, Categoria_Servicio, Imagen_Publicacion
# from app.models.etiqueta import Etiqueta 

# --- Importaciones de Servicios ---
from app.services.s3_service import s3_service # Usamos el mismo servicio S3
from app.services.cognito_service import cognito_service # Servicio de Cognito

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/publicaciones", tags=["Publicaciones de Servicios"])


# =========================================================
# 1️⃣ CREAR PUBLICACIÓN DE SERVICIO (Proveedor)
# (Coincide con el formulario "Publica tu servicio")
# =========================================================
@router.post("/", status_code=status.HTTP_201_CREATED)
async def crear_publicacion(
    # --- Datos del Formulario ---
    titulo: str = Form(...),
    id_categoria: int = Form(..., description="El ID de la categoría seleccionada"),
    descripcion: str = Form(...),
    rango_precio_min: float = Form(...),
    rango_precio_max: float = Form(...),
    fotos: List[UploadFile] = File(..., description="Máximo 10 fotos"),
    user_email: str = Form(..., description="Email del usuario autenticado"),
    
    # --- Datos de autenticación y BD ---
    db: Session = Depends(get_db)
):
    """
    Permite a un PROVEEDOR autenticado crear una nueva publicación de servicio.
    Sube las fotos de referencia a S3 y guarda la S3 Key.
    """
    
    # 🔹 1. Obtener el usuario desde la BD por email
    current_user = db.query(Usuario).filter(Usuario.correo_electronico == user_email).first()
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado."
        )
    
    # 🔹 2. Verificar que el usuario sea un Proveedor
    if not current_user.tipo_usuario == "proveedor" or not current_user.proveedor_servicio:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los proveedores de servicio pueden crear publicaciones."
        )
    
    # 🔹 3. Verificar límite de fotos (Máximo 10)
    if len(fotos) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se permite un máximo de 10 fotos por publicación."
        )

    # 🔹 3. Verificar que la categoría exista
    categoria = db.query(Categoria_Servicio).filter(Categoria_Servicio.id_categoria == id_categoria).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="La categoría seleccionada no existe.")

    try:
        proveedor = current_user.proveedor_servicio

        if not proveedor:
            raise HTTPException(
                status_code=403,
                detail="Tu cuenta debe estar registrada como proveedor para crear publicaciones."
            )
        # 🔹 4. Crear la publicación en la BD
        nueva_publicacion = Publicacion_Servicio(
            id_proveedor=proveedor.id_proveedor,
            id_categoria=id_categoria,
            titulo=titulo,
            descripcion=descripcion,
            rango_precio_min=rango_precio_min,
            rango_precio_max=rango_precio_max,
            estado="activo",
            fecha_publicacion=datetime.utcnow()
        )
        
        db.add(nueva_publicacion)
        db.commit()
        db.refresh(nueva_publicacion) # Para obtener el 'id_publicacion' generado

        # 🔹 5. Subir fotos a S3 (MISMA LÓGICA DE SOLICITUD.PY)
        urls_fotos_guardadas = []
        for index, file in enumerate(fotos):
            try:
                # Generar S3 key (ruta en S3)
                file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
                # Carpeta 'publicaciones/' -> 'id_publicacion' -> 'uuid.jpg'
                s3_key = f"publicaciones/{nueva_publicacion.id_publicacion}/{uuid.uuid4()}.{file_extension}"
                content_type = file.content_type
                
                # Subir a S3
                s3_service.upload_file(
                    file_obj=file.file,
                    object_name=s3_key,
                    content_type=content_type
                )
                
                # Guardar S3 KEY en la tabla Imagen_Publicacion
                nueva_foto = Imagen_Publicacion(
                    id_publicacion=nueva_publicacion.id_publicacion,
                    url_imagen=s3_key, # <-- Guardamos la S3 key, NO la URL
                    orden=index + 1
                )
                db.add(nueva_foto)
                urls_fotos_guardadas.append(s3_key)
                
            except Exception as e:
                logger.error(f"Error al subir foto {file.filename} para pub {nueva_publicacion.id_publicacion}: {e}")
                continue 
        
        db.commit()
        
        return {
            "message": "Publicación creada exitosamente",
            "id_publicacion": nueva_publicacion.id_publicacion,
            "titulo": nueva_publicacion.titulo,
            "fotos_guardadas_keys": urls_fotos_guardadas
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear publicación para proveedor {current_user.id_usuario}: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno al crear la publicación: {e}")


# =========================================================
# 2️⃣ MOSTRAR TODAS LAS PUBLICACIONES (Feed / Tarjetas)
# (Esta es la "Feed Page" para Clientes CON FILTROS)
# =========================================================
# =========================================================
# 2️⃣ MOSTRAR TODAS LAS PUBLICACIONES (Feed / Tarjetas)
# =========================================================
@router.get("/", response_model=None) 
def listar_publicaciones(
    db: Session = Depends(get_db),
    categorias: Optional[List[int]] = Query(None),
    suscriptores: Optional[bool] = Query(False),
    ordenar_por: Optional[str] = Query(None)
):
    """
    Devuelve publicaciones con:
    - Nombre del proveedor
    - Fotografía del proveedor (URL prefirmada)
    - Imagen de portada (URL prefirmada)
    """

    try:
        publicaciones = (
            db.query(Publicacion_Servicio)
            # Cargamos el proveedor y su usuario asociado para acceder a campos
            # como `foto_perfil` que pueden estar en `Proveedor_Servicio` o en `Usuario`.
            .options(joinedload(Publicacion_Servicio.proveedor_servicio).joinedload(Proveedor_Servicio.usuario))
            .options(joinedload(Publicacion_Servicio.imagen_publicacion))
            .filter(Publicacion_Servicio.estado == "activo")
            .limit(20)
            .all()
        )

        resultado = []

        for pub in publicaciones:

            prov = pub.proveedor_servicio

            # ===========================
            # FOTO DE PERFIL DEL PROVEEDOR
            # ===========================
            foto_perfil_url = None
            # El campo foto de perfil puede almacenarse en Proveedor_Servicio.foto_perfil
            # o en Usuario.foto_perfil. Usamos el primero disponible como key a S3.
            foto_key = None
            if prov:
                foto_key = prov.foto_perfil or (prov.usuario.foto_perfil if getattr(prov, 'usuario', None) else None)
            if foto_key:
                try:
                    foto_perfil_url = s3_service.get_presigned_url(foto_key)
                except Exception as e:
                    logger.error(f"Error URL foto perfil proveedor {prov.id_proveedor if prov else 'unknown'}: {e}")
                    foto_perfil_url = None

            # ===========================
            # IMAGEN DE PORTADA
            # ===========================
            url_imagen_portada = None
            if pub.imagen_publicacion:
                portada = sorted(pub.imagen_publicacion, key=lambda x: x.orden)[0]
                try:
                    url_imagen_portada = s3_service.get_presigned_url(portada.url_imagen)
                except Exception as e:
                    logger.error(f"Error URL imagen portada pub {pub.id_publicacion}: {e}")
                    url_imagen_portada = None

            # ===========================
            # CALCULAR CALIFICACIÓN PROMEDIO DEL PROVEEDOR
            # ===========================
            calificacion_promedio = 0.0
            if prov:
                # Calcular promedio de reseñas activas del proveedor
                from app.models.reseña_servicio import Reseña_Servicio
                avg_result = db.query(func.avg(Reseña_Servicio.calificacion_general))\
                    .filter(Reseña_Servicio.id_proveedor == prov.id_proveedor)\
                    .filter(Reseña_Servicio.estado == "activa")\
                    .scalar()
                
                if avg_result is not None:
                    calificacion_promedio = round(float(avg_result), 1)
            
            # ===========================
            # AGREGAR PUBLICACIÓN AL RESULTADO
            # ===========================
            resultado.append({
                "id_publicacion": pub.id_publicacion,
                "titulo": pub.titulo,
                "descripcion_corta": pub.descripcion[:100] if pub.descripcion else "Sin descripción",

                "id_proveedor": pub.id_proveedor,
                "nombre_proveedor": (
                    # Preferimos el nombre almacenado en Proveedor_Servicio (nombre_completo).
                    # Si no existe, intentamos usar el nombre en la entidad Usuario (campo `nombre`).
                    prov.nombre_completo if prov and getattr(prov, "nombre_completo", None)
                    else (prov.usuario.nombre if prov and prov.usuario and getattr(prov.usuario, "nombre", None) else "Sin nombre")
                ),
                "foto_perfil_proveedor": foto_perfil_url,
                "calificacion_proveedor": calificacion_promedio,

                "rango_precio_min": pub.rango_precio_min,
                "rango_precio_max": pub.rango_precio_max,
                "url_imagen_portada": url_imagen_portada,
                "fecha_publicacion": pub.fecha_publicacion.isoformat() if pub.fecha_publicacion else None,
            })

        return resultado

    except Exception as e:
        logger.error(f"Error al listar publicaciones: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# 3️⃣ (NUEVO) OBTENER MIEMBROS PREMIUM
# (Para la barra lateral)
# =========================================================
@router.get("/miembros-premium", response_model=None)
def listar_miembros_premium(
    limit: int = Query(3, description="Número de miembros a mostrar (default: 3)"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de los proveedores suscritos ("Premium"),
    ordenados por la calificación más alta (RF-15)[cite: 402], 
    para mostrar en la barra lateral[cite: 96].
    """
    try:
        # 🔹 1. Query para buscar Proveedores Premium
        # Hacemos 'join' con Usuario para verificar que la cuenta esté activa
        query = db.query(Proveedor_Servicio)\
            .join(Proveedor_Servicio.usuario)\
            .filter(
                # Tienen que tener un plan de suscripción (RF-15) 
                Proveedor_Servicio.id_plan_suscripcion != None, 
                # Tienen que estar 'aprobados'
                Proveedor_Servicio.estado_solicitud == 'aprobado',
                # Y su cuenta de 'usuario' debe estar 'activa' [cite: 451]
                Usuario.estado_cuenta == 'activo'
            )\
            .order_by(
                # Ordenar por mejor calificación (RF-15) 
                Proveedor_Servicio.calificacion_promedio.desc().nullslast()
            )\
            .limit(limit) # Limitar a los 3 (o N) primeros

        proveedores_premium = query.all()

        # 🔹 2. Construir respuesta con URLs pre-firmadas
        resultado = []
        for prov in proveedores_premium:
            url_foto = None
            # Generar URL pre-firmada para la foto de perfil (fallback a Usuario.foto_perfil)
            foto_key = prov.foto_perfil or (prov.usuario.foto_perfil if getattr(prov, 'usuario', None) else None)
            if foto_key:
                try:
                    url_foto = s3_service.get_presigned_url(foto_key)
                except Exception as e:
                    logger.error(f"Error S3 URL para foto de perfil {foto_key}: {e}")
            
            resultado.append({
                "id_proveedor": prov.id_proveedor,
                "nombre_completo": prov.nombre_completo,
                "calificacion_promedio": prov.calificacion_promedio,
                "foto_perfil_url": url_foto # URL Temporal
            })
            
        return resultado

    except Exception as e:
        logger.error(f"Error al obtener miembros premium: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener miembros premium.")
