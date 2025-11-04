# app/api/v1/endpoints/perfil_proveedor.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime, timezone

# --- Imports de Modelos y Esquemas ---
# Asegúrate que estas rutas coincidan con tu proyecto
from app.schemas.proveedor import ProveedorPerfilAboutSchema
from app.models.user import Proveedor_Servicio, Usuario
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

