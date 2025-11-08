from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models import Usuario, Servicio_Contratado, Reseña_Servicio 
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Perfil Cliente"])

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
    nombre_completo: str
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
@router.patch("/{id_cliente}", response_model=ClienteResponse)
async def actualizar_perfil_cliente(id_cliente: int, cliente_update: ClienteUpdate, db: Session = Depends(get_db)):
    try:
        cliente_db = db.query(Usuario).filter(Usuario.id_usuario == id_cliente).first()
        if not cliente_db:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
        update_cliente = cliente_update.model_dump(exclude_unset=True)

        if not update_cliente:
            raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar")

        for key, value in update_cliente.items():
            setattr(cliente_db, key, value)

        db.commit()
        db.refresh(cliente_db)
        return cliente_db   
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar el perfil: {str(e)}")
   

# Obtener los servicios contratados por el cliente
@router.get("/{id_cliente}/servicios", response_model=List[ServicioResponse])
async def obtener_servicios_contratados(id_cliente: int, db: Session = Depends(get_db), skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100)):
    try:
        servicios = db.query(Servicio_Contratado).filter(Servicio_Contratado.id_cliente == id_cliente).all()
        return servicios    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener los servicios: {str(e)}")

# Obtener las reseñas realizadas por el cliente
@router.get("/{id_cliente}/reseñas", response_model=List[ReseñaResponse])
def obtener_reseñas_cliente(id_cliente: int, db: Session = Depends(get_db)):
    try:
        reseñas = db.query(Reseña_Servicio).filter(Reseña_Servicio.id_cliente == id_cliente).all()
        return reseñas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener reseñas: {str(e)}")