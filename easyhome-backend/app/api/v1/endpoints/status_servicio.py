from datetime import datetime, timezone

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.servicio_contratado import Servicio_Contratado
from app.services.s3_service import s3_service

router = APIRouter(
    prefix="/status-servicio",
    tags=["Estado de servicios"]
)

# Estados activos
ESTADOS_ACTIVOS = {"confirmado", "en_proceso"}


class ClienteServicioSchema(BaseModel):
    id_usuario: int
    nombre: str
    numero_telefono: str | None = None
    foto_perfil: str | None = None

    class Config:
        from_attributes = True


class ServicioActivoSchema(BaseModel):
    id_servicio_contratado: int
    fecha_contacto: datetime
    fecha_confirmacion_acuerdo: datetime | None = None
    estado_servicio: str
    confirmacion_cliente_finalizado: bool
    acuerdo_confirmado: bool
    usuario: ClienteServicioSchema

    class Config:
        from_attributes = True


@router.get(
    "/proveedores/{id_proveedor}/servicios-activos",
    response_model=List[ServicioActivoSchema]
)
def listar_servicios_activos(
    id_proveedor: int,
    db: Session = Depends(get_db)
):
    """
    Devuelve el listado de servicios contratados en curso para un proveedor.
    """
    servicios = (
        db.query(Servicio_Contratado)
        .options(joinedload(Servicio_Contratado.usuario))
        .filter(Servicio_Contratado.id_proveedor == id_proveedor)
        .filter(Servicio_Contratado.estado_servicio.in_(ESTADOS_ACTIVOS))
        .order_by(Servicio_Contratado.fecha_contacto.desc())
        .all()
    )

    respuesta: List[ServicioActivoSchema] = []

    for servicio in servicios:
        usuario = getattr(servicio, "usuario", None)
        foto_key = getattr(usuario, "foto_perfil", None)

        # Obtener URL de la foto
        foto_url = None
        if usuario and foto_key:
            try:
                foto_url = s3_service.get_presigned_url(foto_key)
            except Exception:
                foto_url = foto_key

        servicio_payload = {
            "id_servicio_contratado": servicio.id_servicio_contratado,
            "fecha_contacto": servicio.fecha_contacto,
            "fecha_confirmacion_acuerdo": servicio.fecha_confirmacion_acuerdo,
            "estado_servicio": servicio.estado_servicio,
            "confirmacion_cliente_finalizado": servicio.confirmacion_cliente_finalizado,
            "acuerdo_confirmado": servicio.acuerdo_confirmado,
            "usuario": {
                "id_usuario": usuario.id_usuario if usuario else None,
                "nombre": usuario.nombre if usuario else "Cliente sin nombre",
                "numero_telefono": usuario.numero_telefono if usuario else None,
                "foto_perfil": foto_url,
            },
        }

        respuesta.append(ServicioActivoSchema(**servicio_payload))

    return respuesta
