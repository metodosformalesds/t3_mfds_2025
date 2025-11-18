from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.alerta_sistema import Alerta_Sistema
from app.models.servicio_contratado import Servicio_Contratado
from app.models.user import Proveedor_Servicio
from app.models.reseña_servicio import Reseña_Servicio
from app.services.s3_service import s3_service

router = APIRouter(
    prefix="/alertas",
    tags=["Alertas del sistema"]
)

@router.get(
    "/usuario/{id_usuario}",
    summary="Devuelve las alertas del cliente"
)
def obtener_alertas(
    id_usuario: int,
    db: Session = Depends(get_db)
):
    """
    Autor: Equipo EasyHome

    Descripción: Retorna todas las alertas del sistema dirigidas a un usuario
    determinado. Incluye información adicional del proveedor cuando la alerta
    está asociada a un servicio contratado.

    Parámetros:
        id_usuario (int): ID del usuario destinatario de las alertas.
        db (Session): Sesión de la base de datos.

    Retorna:
        List[dict]: Lista de alertas con metadatos y datos opcionales del proveedor.
    """

    resenas_count = {
        row.id_proveedor: row.total_resenas
        for row in (
            db.query(
                Reseña_Servicio.id_proveedor.label("id_proveedor"),
                func.count(Reseña_Servicio.id_reseña).label("total_resenas")
            )
            .group_by(Reseña_Servicio.id_proveedor)
            .all()
        )
    }

    alertas = (
    db.query(Alerta_Sistema)
    .join(
        Servicio_Contratado,
        Alerta_Sistema.id_servicio_contratado == Servicio_Contratado.id_servicio_contratado,
        isouter=True
        )
        .filter(Alerta_Sistema.id_usuario == id_usuario)
        .filter(Servicio_Contratado.id_servicio_contratado.isnot(None))
        .order_by(Alerta_Sistema.fecha_envio.desc())
        .all()
    )

    respuesta = []

    for alerta in alertas:
        proveedor_info = None

        if alerta.id_servicio_contratado:
            servicio = alerta.servicio_contratado

            if servicio:
                proveedor = getattr(servicio, "proveedor_servicio", None)

                if proveedor:
                    foto_url = None
                    if proveedor.foto_perfil:
                        try:
                            foto_url = s3_service.get_presigned_url(proveedor.foto_perfil)
                        except Exception:
                            foto_url = proveedor.foto_perfil
                    elif getattr(proveedor, "usuario", None) and proveedor.usuario.foto_perfil:
                        foto_url = proveedor.usuario.foto_perfil

                    nombre_proveedor = proveedor.nombre_completo
                    if not nombre_proveedor and getattr(proveedor, "usuario", None):
                        nombre_proveedor = proveedor.usuario.nombre

                    proveedor_info = {
                        "idProveedor": proveedor.id_proveedor,
                        "nombreCompleto": nombre_proveedor or "Proveedor",
                        "fotoPerfil": foto_url,
                        "calificacionPromedio": float(proveedor.calificacion_promedio)
                        if proveedor.calificacion_promedio is not None else None,
                        "totalResenas": int(resenas_count.get(proveedor.id_proveedor, 0)),
                    }

        respuesta.append({
            "id_alerta": alerta.id_alerta,
            "tipo_alerta": alerta.tipo_alerta,
            "mensaje": alerta.mensaje,
            "fecha_envio": alerta.fecha_envio,
            "leida": alerta.leida,
            "id_servicio_contratado": alerta.id_servicio_contratado,
            "proveedor": proveedor_info
        })

    return respuesta

@router.put("/{id_alerta}/marcar-leida")
def marcar_alerta_leida(
    id_alerta: int,
    db: Session = Depends(get_db)
):
    """
    Autor: Equipo EasyHome

    Descripción: Marca una alerta específica como leída.

    Parámetros:
        id_alerta (int): ID de la alerta a marcar como leída.
        db (Session): Sesión de la base de datos.

    Retorna:
        dict: Mensaje indicando que la alerta fue marcada.
    """

    alerta = db.query(Alerta_Sistema).filter(Alerta_Sistema.id_alerta == id_alerta).first()

    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada.")

    alerta.leida = True
    db.commit()

    return {"message": "Alerta marcada como leída"}
