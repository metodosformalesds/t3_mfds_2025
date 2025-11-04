# app/api/v1/endpoints/perfil_proveedor.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload, aliased
from sqlalchemy import func, cast, DECIMAL
from datetime import datetime, timezone
from typing import List

# --- Imports de Modelos y Esquemas ---
# Asegúrate que estas rutas coincidan con tu proyecto
from app.schemas.proveedor import ProveedorPerfilAboutSchema, PublicacionServicioSchema
from app.models.reseña_servicio import Reseña_Servicio
from app.models.user import Proveedor_Servicio, Usuario
from app.models.property import Publicacion_Servicio, Imagen_Publicacion
from app.models.servicio_contratado import Servicio_Contratado
from app.core.database import get_db  # Asumo que esta es la ruta a tu 'get_db'

router = APIRouter(
    prefix="/proveedores",
    tags=["Perfil Proveedor"]  # Etiqueta para la documentación de Swagger
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
    # Añadimos los campos calculados directamente al objeto SQLAlchemy
    proveedor.total_reseñas = total_reseñas
    proveedor.años_activo = años_activo

    # Retornamos el objeto 'proveedor' directamente.
    # Pydantic (con from_attributes=True) se encargará de mapear
    # tanto 'proveedor' como su relación 'proveedor.usuario'.
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

    # 1. Subconsulta... (Esta parte está perfecta)
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

    # 2. Consulta Principal... (Esta parte está perfecta)
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

    # 3. Construir la Respuesta (¡CORREGIDO!)
    lista_publicaciones = []
    for publicacion, avg_rating, count_reviews in query_results:
        
        # --- ESTA ES LA FORMA CORRECTA ---
        # Añade los campos calculados directamente al objeto SQLAlchemy
        publicacion.calificacion_promedio_publicacion = avg_rating
        publicacion.total_reseñas_publicacion = count_reviews or 0 # Si es None, pone 0
        
        # Añade el objeto completo. Pydantic lo mapeará.
        # Esto SÍ incluirá 'imagen_publicacion'
        lista_publicaciones.append(publicacion)

    return lista_publicaciones