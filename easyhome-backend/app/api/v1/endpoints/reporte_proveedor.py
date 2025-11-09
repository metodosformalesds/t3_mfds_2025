# ────────────────────────────────────────────────────────────────
# Archivo: reporte_proveedor.py
# Descripción:
#   Endpoint para generar reportes hacia proveedores de servicio.
#   Se asegura que el servicio haya finalizado y que el cliente
#   sea quien lo contrató antes de permitir el registro del reporte.
#
# Basado en:
#   - Entidad: Reporte_Usuario (SRS 3.4.2.16, RF-31)
#   - Entidad: Servicio_Contratado (SRS 3.4.2.9, RF-19, RF-20)
#   - Entidad: Alerta_Sistema (SRS 3.4.2.8)
#
# Requerimientos funcionales:
#   RF-19, RF-20, RF-31
#
# Relación con procesos:
#   1. El proveedor finaliza el servicio.
#   2. El cliente confirma la finalización.
#   3. El cliente puede generar un reporte sobre el proveedor.
# ────────────────────────────────────────────────────────────────

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import Reporte_Usuario, Servicio_Contratado, Alerta_Sistema
from app.db import get_db
from app.schemas.reporte_schemas import ReporteCreate, ReporteResponse

router = APIRouter(prefix="/reportes", tags=["Reportes"])


@router.post("/", response_model=ReporteResponse)
def crear_reporte(reporte: ReporteCreate, db: Session = Depends(get_db)):
    """
    Crea un reporte hacia un proveedor de servicios.
    El reporte se genera solo si el servicio contratado ya está finalizado.
    """

    # 1. Verificar que el servicio contratado existe
    servicio = db.query(Servicio_Contratado).filter(
        Servicio_Contratado.id_servicio_contratado == reporte.id_servicio_contratado
    ).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="El servicio contratado no existe")

    # 2. Validar que el servicio haya sido finalizado
    if servicio.estado_servicio != "finalizado":
        raise HTTPException(status_code=400, detail="Solo se pueden reportar servicios finalizados")

    # 3. Validar que el cliente sea quien contrató el servicio
    if servicio.id_cliente != reporte.id_usuario_reportador:
        raise HTTPException(status_code=403, detail="No autorizado para reportar este servicio")

    # 4. Crear el nuevo registro del reporte
    nuevo_reporte = Reporte_Usuario(
        id_usuario_reportador=reporte.id_usuario_reportador,
        id_proveedor_reportado=servicio.id_proveedor,
        motivo=reporte.motivo,
        descripcion=reporte.descripcion
    )
    db.add(nuevo_reporte)
    db.commit()
    db.refresh(nuevo_reporte)

    # 5. Generar una alerta para el administrador
    alerta = Alerta_Sistema(
        id_usuario=servicio.id_cliente,  # usuario que generó el reporte
        tipo_alerta="nuevo_reporte",
        mensaje=f"Se ha generado un nuevo reporte contra el proveedor ID {servicio.id_proveedor}.",
    )
    db.add(alerta)
    db.commit()

    # 6. Devolver el reporte creado
    return nuevo_reporte
