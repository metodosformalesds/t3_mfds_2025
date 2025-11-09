# Endpoint: Generar reporte de proveedor
# Basado en: Entidades Reporte_Usuario, Servicio_Contratado, Alerta_Sistema
# Referencias: RF-19, RF-20, RF-31 (SRS EasyHome)
# No modifica ninguna tabla ni relación existente.

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import Reporte_Usuario, Servicio_Contratado, Alerta_Sistema
from app.db import get_db
from app.schemas.reporte_schemas import ReporteCreate, ReporteResponse

router = APIRouter(prefix="/reportes", tags=["Reportes"])

@router.post("/", response_model=ReporteResponse)
def crear_reporte(reporte: ReporteCreate, db: Session = Depends(get_db)):
    """
    Crea un reporte sobre un proveedor, verificando que el servicio
    esté finalizado y que el usuario sea quien contrató el servicio.
    """

    # Verificar que el servicio contratado existe
    servicio = db.query(Servicio_Contratado).filter(
        Servicio_Contratado.id_servicio_contratado == reporte.id_servicio_contratado
    ).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="El servicio contratado no existe")

    # Validar que el servicio haya sido finalizado
    if servicio.estado_servicio != "finalizado":
        raise HTTPException(status_code=400, detail="Solo se pueden reportar servicios finalizados")

    # Validar que el cliente sea quien contrató el servicio
    if servicio.id_cliente != reporte.id_usuario_reportador:
        raise HTTPException(status_code=403, detail="No autorizado para reportar este servicio")

    # Crear el registro del reporte
    nuevo_reporte = Reporte_Usuario(
        id_usuario_reportador=reporte.id_usuario_reportador,
        id_proveedor_reportado=servicio.id_proveedor,
        motivo=reporte.motivo,
        descripcion=reporte.descripcion
    )
    db.add(nuevo_reporte)
    db.commit()
    db.refresh(nuevo_reporte)

    # Generar alerta para administrador
    alerta = Alerta_Sistema(
        id_usuario=servicio.id_cliente,
        tipo_alerta="nuevo_reporte",
        mensaje=f"Se ha generado un nuevo reporte contra el proveedor ID {servicio.id_proveedor}.",
    )
    db.add(alerta)
    db.commit()

    return nuevo_reporte