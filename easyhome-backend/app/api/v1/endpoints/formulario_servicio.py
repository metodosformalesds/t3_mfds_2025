from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models import Publicacion_Servicio

router = APIRouter(tags=["Formulario Servicio"])

class ServiceFormCreate(BaseModel):
    id_proveedor: int
    id_categoria: int
    titulo : str
    descripcion: str 
    rango_precio_min: float
    rango_precio_max: float

class ServiceFormResponse(BaseModel):
    id_formulario: int
    id_usuario: int
    id_categoria: int
    descripcion_servicio: str
    direccion_servicio: str
    fecha_solicitud: str

    class Config:
        from_attributes = True

@router.post("/" , response_model=ServiceFormCreate, status_code=201)
async def formulario_crear_servicio(form: ServiceFormCreate, db: Session = Depends(get_db)):


    try:
        new_form = Publicacion_Servicio(
            id_proveedor=form.id_proveedor,
            id_categoria=form.id_categoria,
            titulo =form.titulo,
            descripcion=form.descripcion,
            rango_precio_min=form.rango_precio_min,
            rango_precio_max=form.rango_precio_max
        )
        db.add(new_form)
        db.commit()
        db.refresh(new_form)
        return new_form
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear el formulario de servicio: {str(e)}")