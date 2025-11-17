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

# Estados que continuan activos y pueden finalizarse desde el panel.
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


class FinalizarServicioResponse(BaseModel):
    message: str
    id_servicio_contratado: int
    estado_servicio: str
    fecha_finalizacion: datetime


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


@router.put(
    "/servicios/{id_servicio_contratado}/finalizar",
    response_model=FinalizarServicioResponse
)
def finalizar_servicio(
    id_servicio_contratado: int,
    db: Session = Depends(get_db)
):
    """
    Cambia el estado de un servicio contratado activo a ``finalizado``.
    Solo permite finalizar servicios que actualmente estan confirmados o en proceso.
    """

    servicio = (
        db.query(Servicio_Contratado)
        .filter(Servicio_Contratado.id_servicio_contratado == id_servicio_contratado)
        .first()
    )

    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio contratado no encontrado."
        )

    if servicio.estado_servicio == "finalizado":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El servicio ya se encuentra finalizado."
        )

    if servicio.estado_servicio not in ESTADOS_ACTIVOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se puede finalizar un servicio en estado '{servicio.estado_servicio}'."
        )

    servicio.estado_servicio = "finalizado"
    servicio.fecha_finalizacion = datetime.now(timezone.utc)

    db.commit()
    db.refresh(servicio)

    return FinalizarServicioResponse(
        message="Servicio finalizado con exito.",
        id_servicio_contratado=servicio.id_servicio_contratado,
        estado_servicio=servicio.estado_servicio,
        fecha_finalizacion=servicio.fecha_finalizacion,
    )


@router.get(
    "/proveedores/{id_proveedor}/servicios",
    summary="Devuelve servicios activos y finalizados del proveedor"
)
def listar_servicios_completos(
    id_proveedor: int,
    db: Session = Depends(get_db)
):
    """
    Devuelve la lista de los servicios activos y finalizados
    """
    # --- Servicios Activos ---
    servicios_activos = (
        db.query(Servicio_Contratado)
        .options(joinedload(Servicio_Contratado.usuario))
        .filter(Servicio_Contratado.id_proveedor == id_proveedor)
        .filter(Servicio_Contratado.estado_servicio.in_(ESTADOS_ACTIVOS))
        .order_by(Servicio_Contratado.fecha_contacto.desc())
        .all()
    )

    # --- Servicios Finalizados ---
    servicios_finalizados = (
        db.query(Servicio_Contratado)
        .options(joinedload(Servicio_Contratado.usuario))
        .filter(Servicio_Contratado.id_proveedor == id_proveedor)
        .filter(Servicio_Contratado.estado_servicio == "finalizado")
        .order_by(Servicio_Contratado.fecha_finalizacion.desc())
        .all()
    )

    def map_servicio(servicio):
        usuario = getattr(servicio, "usuario", None)
        foto_key = getattr(usuario, "foto_perfil", None)

        # Generar URL de foto (si existe)
        foto_url = None
        if usuario and foto_key:
            try:
                foto_url = s3_service.get_presigned_url(foto_key)
            except Exception:
                foto_url = foto_key

        return {
            "id_servicio_contratado": servicio.id_servicio_contratado,
            "fecha_contacto": servicio.fecha_contacto,
            "fecha_confirmacion_acuerdo": servicio.fecha_confirmacion_acuerdo,
            "estado_servicio": servicio.estado_servicio,
            "confirmacion_cliente_finalizado": servicio.confirmacion_cliente_finalizado,
            "acuerdo_confirmado": servicio.acuerdo_confirmado,
            "fecha_finalizacion": getattr(servicio, "fecha_finalizacion", None),
            "usuario": {
                "id_usuario": usuario.id_usuario if usuario else None,
                "nombre": usuario.nombre if usuario else "Cliente sin nombre",
                "numero_telefono": usuario.numero_telefono if usuario else None,
                "foto_perfil": foto_url,
            }
        }

    return {
        "activos": [map_servicio(s) for s in servicios_activos],
        "finalizados": [map_servicio(s) for s in servicios_finalizados]
    }
