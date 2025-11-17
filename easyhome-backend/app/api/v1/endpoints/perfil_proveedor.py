# app/api/v1/endpoints/perfil_proveedor.py
from app.services.s3_service import s3_service

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload, aliased
from sqlalchemy import func, cast, DECIMAL
from datetime import datetime, timezone
from typing import List
from pydantic import BaseModel
from app.api.v1.deps import get_current_user

# --- Imports de Esquemas ---
from app.schemas.proveedor import (
    ProveedorPerfilAboutSchema, 
    PublicacionServicioSchema, 
    ImagenPublicacionSchema,
    ReseñaPublicaSchema
)

# --- Imports de Modelos ---
from app.models.user import Proveedor_Servicio, Usuario
from app.models.property import Publicacion_Servicio, Imagen_Publicacion
from app.models.servicio_contratado import Servicio_Contratado
from app.models.reseña_servicio import Reseña_Servicio
from app.models.imagen_reseña import Imagen_Reseña
from app.models.alerta_sistema import Alerta_Sistema
from app.models.user import Usuario

# --- Import de DB ---
from app.core.database import get_db 

router = APIRouter(
    prefix="/proveedores",
    tags=["Perfil Proveedor"]
)

# -----------------------------------------------------------------
# --- Endpoint 1: Pestaña "Acerca de" ---
# -----------------------------------------------------------------
@router.get("/{id_proveedor}/perfil-about", response_model=ProveedorPerfilAboutSchema)
def get_perfil_about(id_proveedor: int, db: Session = Depends(get_db)):
    """
    Obtiene la información principal del perfil de un proveedor
    para la pestaña "Acerca de".
    """
    
    proveedor = db.query(Proveedor_Servicio)\
                  .options(joinedload(Proveedor_Servicio.usuario))\
                  .filter(Proveedor_Servicio.id_proveedor == id_proveedor)\
                  .first()

    if not proveedor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proveedor con id {id_proveedor} no encontrado"
        )

    total_reseñas = db.query(func.count(Reseña_Servicio.id_reseña))\
                       .filter(Reseña_Servicio.id_proveedor == id_proveedor)\
                       .scalar() or 0
    
    años_activo = 0
    if proveedor.tiempo_activo_desde:
        delta = datetime.now(timezone.utc) - proveedor.tiempo_activo_desde
        años_activo = int(delta.days / 365.25)

    proveedor.total_reseñas = total_reseñas
    proveedor.años_activo = años_activo

    return proveedor


# -----------------------------------------------------------------
# --- Endpoint adicional: Datos para la alerta de contratación -----
# -----------------------------------------------------------------
@router.get("/{id_proveedor}/alerta", response_model=None)
def get_proveedor_alerta(id_proveedor: int, db: Session = Depends(get_db)):
    """
    Devuelve un resumen ligero del proveedor para la ventana de
    "alerta de contratación" usada en el frontend. Retorna la URL
    pre-firmada de la foto de perfil (si existe), nombre, calificación
    y total de reseñas.
    """
    proveedor = db.query(Proveedor_Servicio)\
                  .options(joinedload(Proveedor_Servicio.usuario))\
                  .filter(Proveedor_Servicio.id_proveedor == id_proveedor)\
                  .first()

    if not proveedor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proveedor con id {id_proveedor} no encontrado"
        )

    # Contar reseñas asociadas
    total_reseñas = db.query(func.count(Reseña_Servicio.id_reseña))\
                       .filter(Reseña_Servicio.id_proveedor == id_proveedor)\
                       .scalar() or 0

    # Generar URL pre-firmada para la foto de perfil (si existe)
    from app.services.s3_service import s3_service

    foto_key = proveedor.foto_perfil or (proveedor.usuario.foto_perfil if getattr(proveedor, 'usuario', None) else None)
    foto_url = None
    if foto_key:
        try:
            foto_url = s3_service.get_presigned_url(foto_key)
        except Exception:
            foto_url = None

    nombre = proveedor.nombre_completo or (proveedor.usuario.nombre if getattr(proveedor, 'usuario', None) else "Proveedor")

    return {
        "id": proveedor.id_proveedor,
        "nombreCompleto": nombre,
        "fotoPerfil": foto_url,
        "calificacionPromedio": proveedor.calificacion_promedio or 0,
        "totalResenas": total_reseñas
    }

class AlertaResultadoSchema(BaseModel):
    logro: bool
    id_publicacion: int | None = None

class AlertaResultadoBodySchema(BaseModel):
    proveedor_id: int
    logro: bool
    id_publicacion: int | None = None

# -----------------------------------------------------------------
# --- Endpoint 2: Pestaña "Mis servicios" ---
# -----------------------------------------------------------------
@router.get(
    "/{id_proveedor}/servicios",
    response_model=None
)
def get_perfil_servicios(id_proveedor: int, db: Session = Depends(get_db)):
    """
    Devuelve todas las publicaciones del proveedor con:
    - Nombre correcto del proveedor
    - Foto de perfil firmada desde S3
    - Todas las imágenes de la publicación con URL firmada
    """
    proveedor = db.query(Proveedor_Servicio).filter(
        Proveedor_Servicio.id_proveedor == id_proveedor
    ).first()

    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    usuario = proveedor.usuario

    # ===========================
    # OBTENER FOTO DE PERFIL
    # ===========================
    foto_perfil_url = None
    foto_key = proveedor.foto_perfil or (usuario.foto_perfil if usuario else None)

    if foto_key:
        try:
            foto_perfil_url = s3_service.get_presigned_url(foto_key)
        except:
            foto_perfil_url = None

    # ===========================
    # PUBLICACIONES DEL PROVEEDOR
    # ===========================
    publicaciones = (
        db.query(Publicacion_Servicio)
        .filter(Publicacion_Servicio.id_proveedor == id_proveedor)
        .filter(Publicacion_Servicio.estado == "activo")
        .options(joinedload(Publicacion_Servicio.imagen_publicacion))
        .order_by(Publicacion_Servicio.fecha_publicacion.desc())
        .all()
    )

    resultado = []

    for pub in publicaciones:
        # Galería completa
        imagenes = []
        for img in sorted(pub.imagen_publicacion, key=lambda x: x.orden):
            try:
                img_url = s3_service.get_presigned_url(img.url_imagen)
            except:
                img_url = None

            imagenes.append({
                "id_imagen": img.id_imagen,
                "url_imagen": img_url
            })

        # Agregar al resultado final
        resultado.append({
            "id_publicacion": pub.id_publicacion,
            "titulo": pub.titulo,
            "descripcion": pub.descripcion,
            "rango_precio_min": pub.rango_precio_min,
            "rango_precio_max": pub.rango_precio_max,

            # 🟢  NOMBRE REAL
            "nombre_proveedor": proveedor.nombre_completo or usuario.nombre or "Proveedor",

            # 🟢  FOTO DE PERFIL REAL
            "foto_perfil_url": foto_perfil_url,

            # 🟢  TODAS LAS IMÁGENES
            "imagen_publicacion": imagenes
        })

    return resultado


# -----------------------------------------------------------------
# --- Endpoint 3: Pestaña "Portafolio" ---
# -----------------------------------------------------------------

@router.get(
    "/{id_proveedor}/portafolio",
    response_model=List[ImagenPublicacionSchema]
)
def get_perfil_portafolio(id_proveedor: int, db: Session = Depends(get_db)):
    """
    Obtiene una galería de todas las imágenes de todas las
    publicaciones activas de un proveedor, devolviendo URL firmadas.
    """
    
    fotos = (
        db.query(Imagen_Publicacion)
        .join(Publicacion_Servicio, Publicacion_Servicio.id_publicacion == Imagen_Publicacion.id_publicacion)
        .filter(Publicacion_Servicio.id_proveedor == id_proveedor)
        .filter(Publicacion_Servicio.estado == "activo")
        .order_by(Imagen_Publicacion.fecha_subida.desc())
        .all()
    )

    # 🚀 Convertir key → presigned URL
    from app.services.s3_service import s3_service
    fotos_con_url = []

    for foto in fotos:
        presigned_url = s3_service.get_presigned_url(foto.url_imagen)
        
        fotos_con_url.append({
            "id_imagen": foto.id_imagen,
            "url_imagen": presigned_url,   # ⬅️ YA ES URL REAL
            "orden": foto.orden
        })

    return fotos_con_url

# -----------------------------------------------------------------
# --- Endpoint 4: Pestaña "Reseñas" ---
# -----------------------------------------------------------------
@router.get(
    "/{id_proveedor}/resenas",
    response_model=List[ReseñaPublicaSchema]
)
def get_perfil_resenas(id_proveedor: int, db: Session = Depends(get_db)):
    """
    Obtiene la lista de todas las reseñas que ha recibido
    un proveedor, incluyendo las imágenes adjuntas y el
    nombre del cliente.
    """
    resenas = (
        db.query(Reseña_Servicio)
        .options(
            joinedload(Reseña_Servicio.usuario),
            joinedload(Reseña_Servicio.servicio_contratado),
            joinedload(Reseña_Servicio.imagen_reseña)
        )
        .filter(Reseña_Servicio.id_proveedor == id_proveedor)
        .filter(Reseña_Servicio.estado == "activa")
        .order_by(Reseña_Servicio.fecha_reseña.desc())
        .all()
    )
    return resenas

# -----------------------------------------------------------------
# --- Endpoint 5 y 6: COMENTADOS - Requieren ServicioHistorialSchema ---
# -----------------------------------------------------------------
# TODO: Implementar ServicioHistorialSchema en app/schemas/proveedor.py
# y descomentar estos endpoints

# @router.get(
#     "/{id_proveedor}/historial-servicios-activos",
#     response_model=List[ServicioHistorialSchema]
# )
# def get_perfil_historial_servicios_activos(id_proveedor: int, db: Session = Depends(get_db)):
#     """
#     Obtiene el panel de trabajos ACTIVOS de un proveedor 
#     (confirmados o en proceso) para su panel de gestión.
#     """
#     
#     # Estados que representan un trabajo "activo" (pendiente de finalizar)
#     ESTADOS_ACTIVOS = ['confirmado', 'en_proceso']
#     
#     servicios = (
#         db.query(Servicio_Contratado)
#         .options(
#             joinedload(Servicio_Contratado.usuario) # Cargar el 'usuario' (cliente)
#         )
#         .filter(Servicio_Contratado.id_proveedor == id_proveedor)
#         .filter(Servicio_Contratado.estado_servicio.in_(ESTADOS_ACTIVOS))
#         .order_by(Servicio_Contratado.fecha_contacto.desc())
#         .all()
#     )
#     
#     return servicios


# -----------------------------------------------------------------
# --- Endpoint: Registrar resultado de la alerta de contratación -----
# -----------------------------------------------------------------
@router.post("/{id_proveedor}/alerta/resultado", response_model=None)
def registrar_resultado_alerta(
    id_proveedor: int,
    payload: AlertaResultadoSchema,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Registra en la base de datos el resultado de la alerta que se muestra
    al cliente cuando visita un perfil de proveedor.

    Espera un JSON con:
    - `cliente_id` (int): id del usuario cliente que responde
    - `logro` (bool): si logró el acuerdo (true) o no (false)
    - `id_publicacion` (int, opcional): id de la publicación asociada

    Si `logro` es true se crea un registro en `servicio_contratado` con
    acuerdo_confirmado=True y se generan `Alerta_Sistema` para el proveedor
    y para el cliente. Si es false sólo se registra una alerta de feedback.
    """

    # Obtener cliente desde el usuario autenticado
    cliente_id = current_user.id_usuario
    logro = payload.logro
    id_publicacion = payload.id_publicacion

    # Validación: cliente no puede ser el mismo proveedor
    if cliente_id == id_proveedor:
        raise HTTPException(status_code=400, detail="El cliente y proveedor no pueden ser la misma cuenta")

    proveedor = db.query(Proveedor_Servicio).options(joinedload(Proveedor_Servicio.usuario)).filter(Proveedor_Servicio.id_proveedor == id_proveedor).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail=f"Proveedor con id {id_proveedor} no encontrado")

    try:
        if logro:
            # Crear servicio contratado (acuerdo confirmado)
            nuevo_servicio = Servicio_Contratado(
                id_cliente=cliente_id,
                id_proveedor=id_proveedor,
                id_publicacion=id_publicacion,
                acuerdo_confirmado=True,
                fecha_confirmacion_acuerdo=datetime.now(timezone.utc),
                estado_servicio="confirmado"
            )
            db.add(nuevo_servicio)
            db.commit()
            db.refresh(nuevo_servicio)

            # Crear alerta para el proveedor (su usuario es el mismo id que id_proveedor)
            alerta_proveedor = Alerta_Sistema(
                id_usuario=proveedor.id_proveedor,
                id_servicio_contratado=nuevo_servicio.id_servicio_contratado,
                tipo_alerta="contratacion_exitosa",
                mensaje=f"Cliente {cliente_id} confirmó un acuerdo contigo.",
                leida=False
            )
            db.add(alerta_proveedor)

            # Crear alerta para el cliente confirmando registro
            alerta_cliente = Alerta_Sistema(
                id_usuario=cliente_id,
                id_servicio_contratado=nuevo_servicio.id_servicio_contratado,
                tipo_alerta="contratacion_registrada",
                mensaje=f"Tu acuerdo con el proveedor {id_proveedor} ha sido registrado.",
                leida=False
            )
            db.add(alerta_cliente)

            db.commit()

            return {"message": "Registro guardado", "id_servicio_contratado": nuevo_servicio.id_servicio_contratado}

        else:
            # Registrar feedback de no acuerdo
            alerta = Alerta_Sistema(
                id_usuario=cliente_id,
                tipo_alerta="contratacion_no_lograda",
                mensaje=f"El cliente {cliente_id} indicó que no logró un acuerdo con el proveedor {id_proveedor}.",
                leida=False
            )
            db.add(alerta)
            db.commit()
            return {"message": "Feedback de no acuerdo guardado"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al guardar resultado: {e}")


# -----------------------------------------------------------------
# --- Endpoint alternativo: recibir proveedor en el body -----------
# -----------------------------------------------------------------
@router.post("/alerta/resultado", response_model=None)
def registrar_resultado_alerta_body(
    payload: AlertaResultadoBodySchema,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Misma funcionalidad que `/{id_proveedor}/alerta/resultado` pero acepta
    `proveedor_id` dentro del body. Útil para llamadas directas desde UI
    donde no es conveniente construir la URL con path param.
    Body esperado: { proveedor_id, cliente_id, logro, id_publicacion }
    """
    id_proveedor = payload.proveedor_id
    cliente_id = current_user.id_usuario
    logro = payload.logro
    id_publicacion = payload.id_publicacion

    if id_proveedor is None:
        raise HTTPException(status_code=400, detail="Se requiere 'proveedor_id' en el payload")

    if cliente_id == id_proveedor:
        raise HTTPException(status_code=400, detail="El cliente y proveedor no pueden ser la misma cuenta")

    proveedor = db.query(Proveedor_Servicio).options(joinedload(Proveedor_Servicio.usuario)).filter(Proveedor_Servicio.id_proveedor == id_proveedor).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail=f"Proveedor con id {id_proveedor} no encontrado")

    try:
        if logro:
            nuevo_servicio = Servicio_Contratado(
                id_cliente=cliente_id,
                id_proveedor=id_proveedor,
                id_publicacion=id_publicacion,
                acuerdo_confirmado=True,
                fecha_confirmacion_acuerdo=datetime.now(timezone.utc),
                estado_servicio="confirmado"
            )
            db.add(nuevo_servicio)
            db.commit()
            db.refresh(nuevo_servicio)

            alerta_proveedor = Alerta_Sistema(
                id_usuario=proveedor.id_proveedor,
                id_servicio_contratado=nuevo_servicio.id_servicio_contratado,
                tipo_alerta="contratacion_exitosa",
                mensaje=f"Cliente {cliente_id} confirmó un acuerdo contigo.",
                leida=False
            )
            db.add(alerta_proveedor)

            alerta_cliente = Alerta_Sistema(
                id_usuario=cliente_id,
                id_servicio_contratado=nuevo_servicio.id_servicio_contratado,
                tipo_alerta="contratacion_registrada",
                mensaje=f"Tu acuerdo con el proveedor {id_proveedor} ha sido registrado.",
                leida=False
            )
            db.add(alerta_cliente)

            db.commit()
            return {"message": "Registro guardado", "id_servicio_contratado": nuevo_servicio.id_servicio_contratado}

        else:
            alerta = Alerta_Sistema(
                id_usuario=cliente_id,
                tipo_alerta="contratacion_no_lograda",
                mensaje=f"El cliente {cliente_id} indicó que no logró un acuerdo con el proveedor {id_proveedor}.",
                leida=False
            )
            db.add(alerta)
            db.commit()
            return {"message": "Feedback de no acuerdo guardado"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al guardar resultado: {e}")

# @router.patch(
#     "/servicios/{id_servicio_contratado}/finalizar",
#     response_model=ServicioHistorialSchema
# )
# def finalizar_servicio(
#     id_servicio_contratado: int, 
#     db: Session = Depends(get_db)
#     # current_user: Usuario = Depends(get_current_user) # <-- Añadir seguridad después
# ):
#     """
#     Permite a un proveedor marcar un servicio como 'finalizado'.
#     (Cumple RF-19)
#     """
#     
#     # 1. Buscar el servicio
#     servicio = db.query(Servicio_Contratado)\
#                  .options(joinedload(Servicio_Contratado.usuario))\
#                  .filter(Servicio_Contratado.id_servicio_contratado == id_servicio_contratado)\
#                  .first()
# 
#     if not servicio:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Servicio contratado no encontrado"
#         )
#     
#     # 2. (Aquí iría la lógica de seguridad)
#     # if servicio.id_proveedor != current_user.id_usuario:
#     #    raise HTTPException(status_code=403, detail="No autorizado")
# 
#     # 3. Validar estado (Solo se puede finalizar algo 'confirmado' o 'en_proceso')
#     if servicio.estado_servicio not in ['confirmado', 'en_proceso']:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"No se puede finalizar un servicio que está '{servicio.estado_servicio}'"
#         )
#         
#     # 4. Actualizar el estado
#     servicio.estado_servicio = "finalizado"
#     servicio.fecha_finalizacion = datetime.now(timezone.utc)
#     
#     db.commit()
#     db.refresh(servicio)
#     
#     # 5. (Aquí iría la lógica para enviar la alerta al cliente, RF-20)
#     
#     return servicio