# app/api/v1/endpoints/perfil_proveedor.py

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload, aliased
from sqlalchemy import func, cast, DECIMAL
from datetime import datetime, timezone
from typing import List

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
# --- Endpoint 2: Pestaña "Mis servicios" ---
# -----------------------------------------------------------------
@router.get(
    "/{id_proveedor}/servicios",
    response_model=List[PublicacionServicioSchema]
)
def get_perfil_servicios(id_proveedor: int, db: Session = Depends(get_db)):
    """
    Devuelve las publicaciones del proveedor, incluyendo todas sus imágenes,
    y genera URLs firmadas de S3.
    """
    publicaciones = (
        db.query(Publicacion_Servicio)
        .filter(Publicacion_Servicio.id_proveedor == id_proveedor)
        .filter(Publicacion_Servicio.estado == "activo")
        .options(joinedload(Publicacion_Servicio.imagen_publicacion))
        .order_by(Publicacion_Servicio.fecha_publicacion.desc())
        .all()
    )

    from app.services.s3_service import s3_service

    for pub in publicaciones:
        for img in pub.imagen_publicacion:
            img.url_imagen = s3_service.get_presigned_url(img.url_imagen)

    return publicaciones

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
    "/{id_proveedor}/reseñas",
    response_model=List[ReseñaPublicaSchema]
)
def get_perfil_reseñas(id_proveedor: int, db: Session = Depends(get_db)):
    """
    Obtiene la lista de todas las reseñas que ha recibido
    un proveedor, incluyendo las imágenes adjuntas y el
    nombre del cliente.
    """
    reseñas = (
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
    return reseñas

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