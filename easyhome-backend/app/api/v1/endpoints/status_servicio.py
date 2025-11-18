from datetime import datetime, timezone

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.alerta_sistema import Alerta_Sistema
from app.models.servicio_contratado import Servicio_Contratado
from app.models.user import Proveedor_Servicio
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
        .options(
            joinedload(Servicio_Contratado.proveedor_servicio)
            .joinedload(Proveedor_Servicio.usuario)
        )
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

    proveedor = getattr(servicio, "proveedor_servicio", None)
    proveedor_nombre = None
    if proveedor:
        proveedor_nombre = proveedor.nombre_completo or getattr(getattr(proveedor, "usuario", None), "nombre", None)
    if not proveedor_nombre:
        proveedor_nombre = "Tu proveedor"

    alerta = Alerta_Sistema(
        id_usuario=servicio.id_cliente,
        id_servicio_contratado=servicio.id_servicio_contratado,
        tipo_alerta="servicio_finalizado",
        mensaje=f"{proveedor_nombre} ha finalizado el servicio."
    )

    db.add(alerta)
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


class ProveedorServicioSchema(BaseModel):
    id_proveedor: int
    id_usuario: int
    nombre: str
    numero_telefono: str | None = None
    foto_perfil: str | None = None
    calificacion_promedio: float | None = None

    class Config:
        from_attributes = True


class ServicioClienteSchema(BaseModel):
    id_servicio_contratado: int
    fecha_contacto: datetime
    fecha_confirmacion_acuerdo: datetime | None = None
    estado_servicio: str
    confirmacion_cliente_finalizado: bool
    acuerdo_confirmado: bool
    fecha_finalizacion: datetime | None = None
    proveedor: ProveedorServicioSchema
    tiene_reseña: bool = False
    calificacion_cliente: float | None = None

    class Config:
        from_attributes = True


@router.get(
    "/clientes/{id_cliente}/servicios",
    response_model=List[ServicioClienteSchema],
    summary="Devuelve los servicios contratados por un cliente"
)
def listar_servicios_cliente(
    id_cliente: int,
    db: Session = Depends(get_db)
):
    """
    Devuelve la lista de servicios contratados por un cliente,
    incluyendo información del proveedor y si tiene reseña.
    """
    from app.models.user import Proveedor_Servicio
    from app.models.reseña_servicio import Reseña_Servicio
    
    servicios = (
        db.query(Servicio_Contratado)
        .options(
            joinedload(Servicio_Contratado.proveedor_servicio)
            .joinedload(Proveedor_Servicio.usuario)
        )
        .options(joinedload(Servicio_Contratado.reseña_servicio))
        .filter(Servicio_Contratado.id_cliente == id_cliente)
        .filter(Servicio_Contratado.acuerdo_confirmado == True)
        .order_by(Servicio_Contratado.fecha_contacto.desc())
        .all()
    )

    respuesta: List[ServicioClienteSchema] = []

    for servicio in servicios:
        proveedor_obj = getattr(servicio, "proveedor_servicio", None)
        usuario_proveedor = getattr(proveedor_obj, "usuario", None) if proveedor_obj else None
        
        foto_key = getattr(usuario_proveedor, "foto_perfil", None)
        foto_url = None

        if usuario_proveedor and foto_key:
            try:
                foto_url = s3_service.get_presigned_url(foto_key)
            except Exception:
                foto_url = foto_key

        # Verificar si tiene reseña (soporta relación uno-a-uno o lista)
        # bool(None) -> False, bool([]) -> False, bool(objeto o lista no vacía) -> True
        reseña_obj = getattr(servicio, "reseña_servicio", None)
        tiene_reseña = bool(reseña_obj)
        
        # Obtener calificación del cliente si existe reseña
        calificacion_cliente = None
        if reseña_obj:
            calificacion_cliente = getattr(reseña_obj, "calificacion_general", None)
        
        # DEBUG: Imprimir en consola del backend
        print(f"🔍 DEBUG Backend - Servicio {servicio.id_servicio_contratado}:")
        print(f"   - Estado: {servicio.estado_servicio}")
        print(f"   - reseña_servicio object: {reseña_obj}")
        print(f"   - tiene_reseña calculado: {tiene_reseña}")
        print(f"   - calificacion_cliente: {calificacion_cliente}")

        servicio_payload = {
            "id_servicio_contratado": servicio.id_servicio_contratado,
            "fecha_contacto": servicio.fecha_contacto,
            "fecha_confirmacion_acuerdo": servicio.fecha_confirmacion_acuerdo,
            "estado_servicio": servicio.estado_servicio,
            "confirmacion_cliente_finalizado": servicio.confirmacion_cliente_finalizado,
            "acuerdo_confirmado": servicio.acuerdo_confirmado,
            "fecha_finalizacion": servicio.fecha_finalizacion,
            "tiene_reseña": tiene_reseña,
            "calificacion_cliente": calificacion_cliente,
            "proveedor": {
                "id_proveedor": proveedor_obj.id_proveedor if proveedor_obj else None,
                "id_usuario": usuario_proveedor.id_usuario if usuario_proveedor else None,
                "nombre": usuario_proveedor.nombre if usuario_proveedor else "Proveedor sin nombre",
                "numero_telefono": usuario_proveedor.numero_telefono if usuario_proveedor else None,
                "foto_perfil": foto_url,
                "calificacion_promedio": proveedor_obj.calificacion_promedio if proveedor_obj else None,
            },
        }

        respuesta.append(ServicioClienteSchema(**servicio_payload))

    return respuesta


class ServicioInfoReseñaSchema(BaseModel):
    nombre_proveedor: str
    nombre_servicio: str
    fecha_contratacion: str
    foto_perfil: str | None = None

    class Config:
        from_attributes = True


@router.get(
    "/servicios/{id_servicio_contratado}/info-resena",
    response_model=ServicioInfoReseñaSchema,
    summary="Obtiene información del servicio para el formulario de reseña"
)
def obtener_info_servicio_resena(
    id_servicio_contratado: int,
    db: Session = Depends(get_db)
):
    """
    Devuelve la información del proveedor y servicio necesaria
    para mostrar en el formulario de reseña.
    """
    from app.models.user import Proveedor_Servicio
    from app.models.property import Publicacion_Servicio
    
    servicio = (
        db.query(Servicio_Contratado)
        .options(
            joinedload(Servicio_Contratado.proveedor_servicio)
            .joinedload(Proveedor_Servicio.usuario)
        )
        .options(joinedload(Servicio_Contratado.publicacion_servicio))
        .filter(Servicio_Contratado.id_servicio_contratado == id_servicio_contratado)
        .first()
    )

    if not servicio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio contratado no encontrado."
        )

    proveedor_obj = getattr(servicio, "proveedor_servicio", None)
    usuario_proveedor = getattr(proveedor_obj, "usuario", None) if proveedor_obj else None
    publicacion = getattr(servicio, "publicacion_servicio", None)
    
    foto_key = getattr(usuario_proveedor, "foto_perfil", None)
    foto_url = None

    if usuario_proveedor and foto_key:
        try:
            foto_url = s3_service.get_presigned_url(foto_key)
        except Exception:
            foto_url = foto_key

    # Formatear fecha
    fecha_contratacion = servicio.fecha_confirmacion_acuerdo or servicio.fecha_contacto
    fecha_formateada = fecha_contratacion.strftime("%d/%B/%Y") if fecha_contratacion else "Fecha no disponible"

    # Obtener nombre del servicio de la publicación o usar un valor por defecto
    nombre_servicio = "Servicio"
    if publicacion:
        nombre_servicio = getattr(publicacion, "titulo", "Servicio")

    return ServicioInfoReseñaSchema(
        nombre_proveedor=usuario_proveedor.nombre if usuario_proveedor else "Proveedor",
        nombre_servicio=nombre_servicio,
        fecha_contratacion=fecha_formateada,
        foto_perfil=foto_url
    )
