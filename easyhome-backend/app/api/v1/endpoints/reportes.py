# Autor: ENRIQUE ALEJANDRO PEREDA MERAZ

# Fecha: 16/11/2025

# Descripción: Endpoint para que un usuario pueda reportar a un proveedor de servicios.
# app/api/v1/endpoints/reportes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional

# --- Imports de Modelos ---
from app.models.reporte_usuario import Reporte_Usuario
from app.models.user import Usuario, Proveedor_Servicio
from app.api.v1.deps import get_current_user

# --- Import de DB ---
from app.core.database import get_db 

router = APIRouter(
    prefix="/reportes",
    tags=["Reportes"]
)

# -----------------------------------------------------------------
# --- Schemas ---
# -----------------------------------------------------------------

class ReporteCreateSchema(BaseModel):
    proveedor_id: int
    detalles: Optional[str] = None
    
    class Config:
        from_attributes = True


class ReporteResponseSchema(BaseModel):
    id_reporte: int
    id_usuario_reportador: int
    id_proveedor_reportado: int
    motivo: str
    descripcion: str
    estado: str
    fecha_reporte: datetime
    
    class Config:
        from_attributes = True


# -----------------------------------------------------------------
# --- Endpoint: Crear reporte ---
# -----------------------------------------------------------------

@router.post("", response_model=ReporteResponseSchema)
def crear_reporte(
    payload: ReporteCreateSchema,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Autor: Enrique Alejandro Pereda Meraz
    Descripción: Crea un nuevo registro de reporte de un usuario (cliente) contra un proveedor.
    
    Parámetros:
        payload (ReporteCreateSchema): Contiene el ID del proveedor reportado y los detalles.
        db (Session): Sesión de la base de datos.
        current_user (Usuario): Usuario autenticado que realiza el reporte (automáticamente extraído).

    Retorna:
        ReporteResponseSchema: El objeto del reporte recién creado en la base de datos.

    Genera:
        HTTPException 400: Si el usuario intenta reportarse a sí mismo.
        HTTPException 404: Si el proveedor reportado no existe.
        HTTPException 500: Si ocurre un error al guardar en la base de datos.
    """
    
    cliente_id = current_user.id_usuario
    proveedor_id = payload.proveedor_id
    detalles = payload.detalles or ""
    
    # Validación: cliente no puede reportarse a sí mismo
    if cliente_id == proveedor_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes reportar tu propia cuenta"
        )
    
    # Validar que el proveedor existe
    proveedor = db.query(Proveedor_Servicio).filter(
        Proveedor_Servicio.id_proveedor == proveedor_id
    ).first()
    
    if not proveedor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proveedor con id {proveedor_id} no encontrado"
        )
    
    try:
        # Crear el reporte
        nuevo_reporte = Reporte_Usuario(
            id_usuario_reportador=cliente_id,
            id_proveedor_reportado=proveedor_id,
            motivo="Reporte del cliente",
            descripcion=detalles,
            estado="pendiente",
            fecha_reporte=datetime.now(timezone.utc)
        )
        
        db.add(nuevo_reporte)
        db.commit()
        db.refresh(nuevo_reporte)
        
        return nuevo_reporte
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear reporte: {str(e)}"
        )
