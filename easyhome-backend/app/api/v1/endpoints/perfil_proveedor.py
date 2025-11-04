# app/api/v1/endpoints/perfil_proveedor.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload, aliased
from sqlalchemy import func, cast, DECIMAL
from sqlalchemy import func
from datetime import datetime, timezone
from typing import List

# --- Imports de Modelos y Esquemas ---
# Asegúrate que estas rutas coincidan con tu proyecto
from app.schemas.proveedor import ProveedorPerfilAboutSchema, PublicacionServicioSchema
from app.models.reseña_servicio import Reseña_Servicio
from app.models.user import Proveedor_Servicio, Usuario
from app.models.property import Publicacion_Servicio, Imagen_Publicacion
from app.models.servicio_contratado import Servicio_Contratado
from app.models.reseña_servicio import Reseña_Servicio
from app.core.database import get_db  # Asumo que esta es la ruta a tu 'get_db'

router = APIRouter(
    prefix="/proveedores",
    tags=["Perfil Proveedor"]  # Etiqueta para la documentación de Swagger
)

# --- Endpoint 1: Pestaña "Acerca de" ---
@router.get("/{id_proveedor}/perfil-about", response_model=ProveedorPerfilAboutSchema)
def get_perfil_about(id_proveedor: int, db: Session = Depends(get_db)):
    """
    Obtiene la información principal del perfil de un proveedor
    para la pestaña "Acerca de".
    """
    
    # 1. Consulta principal: Proveedor + Usuario
    # Carga el proveedor y su información de usuario relacionada
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
    # Cuenta las reseñas donde el id_proveedor coincida
    total_reseñas = db.query(func.count(Reseña_Servicio.id_reseña))\
                       .filter(Reseña_Servicio.id_proveedor == id_proveedor)\
                       .scalar() or 0
    
    # 3. Cálculo: Años activo
    años_activo = 0
    if proveedor.tiempo_activo_desde:
        # Asume que 'tiempo_activo_desde' tiene zona horaria (UTC)
        delta = datetime.now(timezone.utc) - proveedor.tiempo_activo_desde
        años_activo = int(delta.days / 365.25)

    # 4. Construir la respuesta
    # Pydantic (response_model) filtra automáticamente estos datos
    # para que coincidan con ProveedorPerfilAboutSchema
    response_data = {
        **proveedor.__dict__,
        "usuario": proveedor.usuario,
        "total_reseñas": total_reseñas,
        "años_activo": años_activo
    }

    return response_data

# -----------------------------------------------------------------
# --- Endpoint 2: Pestaña "Mis servicios" (REFORMULADO) ---
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

    # 1. Subconsulta para calcular agregados (Promedio y Conteo)
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

    # Alias para la subconsulta
    agregados = aliased(subquery_agregados, name="agregados")

    # 2. Consulta Principal (¡SINTAXIS CORREGIDA!)
    # Envolvemos toda la consulta en paréntesis (...)
    query_results = (
        db.query(
            Publicacion_Servicio,
            agregados.c.calificacion_promedio_publicacion,
            agregados.c.total_reseñas_publicacion
        )
        .outerjoin(agregados, Publicacion_Servicio.id_publicacion == agregados.c.id_publicacion)
        .options(joinedload(Publicacion_Servicio.imagen_publicacion)) # Cargar imágenes
        .filter(Publicacion_Servicio.id_proveedor == id_proveedor) # Filtro por proveedor
        .filter(Publicacion_Servicio.estado == "activo") # Solo publicaciones activas
        .order_by(Publicacion_Servicio.fecha_publicacion.desc()) # Ordenar por más nuevas
        .all()
    )

    # 3. Construir la Respuesta Manualmente
    lista_publicaciones = []
    for publicacion, avg_rating, count_reviews in query_results:
        
        pub_data = publicacion.__dict__
        
        # Añadimos los campos calculados de la consulta
        pub_data["calificacion_promedio_publicacion"] = avg_rating
        pub_data["total_reseñas_publicacion"] = count_reviews or 0 # Si es None, pone 0
        
        lista_publicaciones.append(pub_data)

    return lista_publicaciones