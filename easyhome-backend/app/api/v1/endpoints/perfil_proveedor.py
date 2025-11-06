# app/api/v1/endpoints/perfil_proveedor.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload, aliased
from sqlalchemy import func, cast, DECIMAL
from datetime import datetime, timezone
from typing import List

# --- Imports de Modelos y Esquemas ---
# Asegúrate que estas rutas coincidan con tu proyecto
from app.schemas.proveedor import (
    ProveedorPerfilAboutSchema, 
    PublicacionServicioSchema, 
    ImagenPublicacionSchema,
    ReseñaPublicaSchema  # <-- Import para Endpoint 4
)
from app.models.user import Proveedor_Servicio, Usuario
from app.models.property import Publicacion_Servicio, Imagen_Publicacion
from app.models.servicio_contratado import Servicio_Contratado
from app.models.reseña_servicio import Reseña_Servicio
from app.models.imagen_reseña import Imagen_Reseña  # <-- Import para Endpoint 4
from app.core.database import get_db 

router = APIRouter(
    prefix="/proveedores",
    tags=["Perfil Proveedor"]  
)

# -----------------------------------------------------------------
# --- Endpoint 1: Pestaña "Acerca de" (Versión mejorada) ---
# -----------------------------------------------------------------
@router.get("/{id_proveedor}/perfil-about", response_model=ProveedorPerfilAboutSchema)
def get_perfil_about(id_proveedor: int, db: Session = Depends(get_db)):
    """
    Obtiene la información principal del perfil de un proveedor
    para la pestaña "Acerca de".
    """
    
    # 1. Consulta principal: Proveedor + Usuario
    proveedor = db.query(Proveedor_Servicio)\
                  .options(joinedload(Proveedor_Servicio.usuario))\
                  .filter(Proveedor_Servicio.id_proveedor == id_proveedor)\
                  .first()

    # Si no se encuentra, devuelve un error 404
    if not proveedor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proveedor con id {id_proveedor} no encontrado"
        )

    # 2. Consulta secundaria: Contar reseñas
    total_reseñas = db.query(func.count(Reseña_Servicio.id_reseña))\
                       .filter(Reseña_Servicio.id_proveedor == id_proveedor)\
                       .scalar() or 0
    
    # 3. Cálculo: Años activo
    años_activo = 0
    if proveedor.tiempo_activo_desde:
        delta = datetime.now(timezone.utc) - proveedor.tiempo_activo_desde
        años_activo = int(delta.days / 365.25)

    # 4. Construir la respuesta (Forma limpia)
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
    Obtiene la lista de servicios publicados por un proveedor,
    calculando la calificación promedio y el total de reseñas
    para CADA publicación.
    """

    # 1. Subconsulta...
    subquery_agregados = db.query(
        Servicio_Contratado.id_publicacion,
        cast(
            func.avg(Reseña_Servicio.calificacion_general), 
            DECIMAL(3, 2)
        ).label("calificacion_promedio_publicacion"),
        func.count(Reseña_Servicio.id_reseña).label("total_reseñas_publicacion")
    )\
    .join(Reseña_Servicio, Reseña_Servicio.id_servicio_contratado == Servicio_Contratado.id_servicio_contratado)\
    .filter(Servicio_Contratado.id_publicacion.isnot(None))\
    .group_by(Servicio_Contratado.id_publicacion)\
    .subquery()

    agregados = aliased(subquery_agregados, name="agregados")

    # 2. Consulta Principal...
    query_results = (
        db.query(
            Publicacion_Servicio,
            agregados.c.calificacion_promedio_publicacion,
            agregados.c.total_reseñas_publicacion
        )
        .outerjoin(agregados, Publicacion_Servicio.id_publicacion == agregados.c.id_publicacion)
        .options(joinedload(Publicacion_Servicio.imagen_publicacion)) # Cargar imágenes
        .filter(Publicacion_Servicio.id_proveedor == id_proveedor)
        .filter(Publicacion_Servicio.estado == "activo")
        .order_by(Publicacion_Servicio.fecha_publicacion.desc())
        .all()
    )

    # 3. Construir la Respuesta
    lista_publicaciones = []
    for publicacion, avg_rating, count_reviews in query_results:
        
        publicacion.calificacion_promedio_publicacion = avg_rating
        publicacion.total_reseñas_publicacion = count_reviews or 0
        
        lista_publicaciones.append(publicacion)

    return lista_publicaciones

# -----------------------------------------------------------------
# --- Endpoint 3: Pestaña "Portafolio" ---
# -----------------------------------------------------------------
@router.get(
    "/{id_proveedor}/portafolio",
    response_model=List[ImagenPublicacionSchema] # Devuelve una lista de imágenes
)
def get_perfil_portafolio(id_proveedor: int, db: Session = Depends(get_db)):
    """
    Obtiene una galería de todas las imágenes de todas las
    publicaciones activas de un proveedor.
    """
    
    fotos = (
        db.query(Imagen_Publicacion)
        .join(Publicacion_Servicio, Publicacion_Servicio.id_publicacion == Imagen_Publicacion.id_publicacion)
        .filter(Publicacion_Servicio.id_proveedor == id_proveedor)
        .filter(Publicacion_Servicio.estado == "activo")
        .order_by(Imagen_Publicacion.fecha_subida.desc())
        .all()
    )
    
    return fotos

# -----------------------------------------------------------------
# --- Endpoint 4: Pestaña "Reseñas" (AÑADIDO) ---
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
            joinedload(Reseña_Servicio.usuario), # Para el nombre del cliente
            joinedload(Reseña_Servicio.servicio_contratado), # Para la fecha
            joinedload(Reseña_Servicio.imagen_reseña) # Para las fotos
        )
        .filter(Reseña_Servicio.id_proveedor == id_proveedor)
        .filter(Reseña_Servicio.estado == "activa") # Solo reseñas activas
        .order_by(Reseña_Servicio.fecha_reseña.desc()) # Más nuevas primero
        .all()
    )
    return reseñas