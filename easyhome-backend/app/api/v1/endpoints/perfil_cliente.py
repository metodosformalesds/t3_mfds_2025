from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models import Usuario, Servicio_Contratado, Reseña_Servicio 

router = APIRouter(prefix="/Perfil_Cliente", tags=["Perfil Cliente"])

class ClienteUpdate(BaseModel):
    nombre: str | None = None
    numero_telefono: str | None = None
    fecha_nacimiento: str | None = None  # Formato YYYY-MM-DD
    contraseña: str | None = None

class ClienteResponse(BaseModel):
    id_usuario: int
    nombre: str
    correo_electronico: str
    numero_telefono: str | None
    fecha_nacimiento: str | None

    class Config:
        from_attributes = True

class ServicioResponse(BaseModel):
    id_servicio_contratado: int
    id_cliente: int
    id_proveedor: int
    id_publicacion: int | None
    fecha_confirmacion_acuerdo: str | None
    estado_servicio: str
    confirmacion_cliente_finalizado: bool

    class Config:
        from_attributes = True

class ReseñaResponse(BaseModel):
    id_reseña: int
    id_servicio_contratado: int
    id_usuario: int
    calificacion: int
    comentario: str | None
    fecha_reseña: str

    class Config:
        from_attributes = True

# Actualizar el perfil del cliente
@router.put("/{id_cliente}", response_model=ClienteResponse)
def actualizar_perfil_cliente(
    id_cliente: int,
    cliente_update: ClienteUpdate,
    db: Session = Depends(get_db)
):
    cliente = db.query(Usuario).filter(Usuario.id_usuario == id_cliente, Usuario.rol == 'cliente').first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    for var, value in vars(cliente_update).items():
        if value is not None:
            setattr(cliente, var, value)

    db.commit()
    db.refresh(cliente)
    return cliente
