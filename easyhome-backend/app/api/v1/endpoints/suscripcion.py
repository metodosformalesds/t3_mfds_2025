# api/v1/endpoints/suscripcion.py
# ────────────────────────────────────────────────
# Endpoints: Gestión de Suscripciones
# Referencia: RF-21 al RF-23, RF-34
# Descripción:
#   Define las rutas para listar, crear, cancelar y consultar
#   suscripciones de proveedores. Se conecta con el servicio
#   stripe_service.py para manejar pagos, webhooks y actualizaciones.
# ────────────────────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.models import Plan_Suscripcion, Historial_Suscripcion, Proveedor_Servicio
from app.services.stripe_service import (
    crear_checkout_session,
    manejar_webhook_stripe,
    cancelar_suscripcion,
)
from app.schemas.schemas_suscripcion import CheckoutRequest
from app.core.database import get_db  # Ruta correcta confirmada

router = APIRouter(
    prefix="/suscripciones",
    tags=["Suscripciones"]
)

# ────────────────────────────────────────────────
# GET /api/v1/suscripciones/planes
# ────────────────────────────────────────────────
@router.get("/planes")
def listar_planes(db: Session = Depends(get_db)):
    """
    Devuelve la lista de planes de suscripción activos.
    """
    planes = db.query(Plan_Suscripcion).filter(Plan_Suscripcion.estado == "activo").all()
    if not planes:
        raise HTTPException(status_code=404, detail="No hay planes disponibles.")
    return planes

# ────────────────────────────────────────────────
# POST /api/v1/suscripciones/checkout
# ────────────────────────────────────────────────
@router.post("/checkout")
def crear_sesion_checkout(data: CheckoutRequest, db: Session = Depends(get_db)):
    """
    Crea una sesión de pago en Stripe para el proveedor que selecciona un plan.
    """
    return crear_checkout_session(
        db,
        id_proveedor=data.id_proveedor,
        id_plan=data.id_plan,
        success_url=data.success_url,
        cancel_url=data.cancel_url,
    )

# ────────────────────────────────────────────────
# POST /api/v1/suscripciones/webhook
# ────────────────────────────────────────────────
@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Webhook que recibe los eventos automáticos enviados por Stripe
    (por ejemplo, cuando un pago es completado o cancelado).
    """
    endpoint_secret = "whsec_TU_SECRET_DE_WEBHOOK"
    return manejar_webhook_stripe(db, request, endpoint_secret)

# ────────────────────────────────────────────────
# GET /api/v1/suscripciones/actual/{id_proveedor}
# ────────────────────────────────────────────────
@router.get("/actual/{id_proveedor}")
def obtener_plan_actual(id_proveedor: int, db: Session = Depends(get_db)):
    """
    Devuelve la información del plan actual de un proveedor.
    """
    proveedor = db.query(Proveedor_Servicio).filter(
        Proveedor_Servicio.id_proveedor == id_proveedor
    ).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado.")

    if not proveedor.id_plan_suscripcion:
        return {"plan_actual": "Gratis"}

    plan = db.query(Plan_Suscripcion).filter(
        Plan_Suscripcion.id_plan == proveedor.id_plan_suscripcion
    ).first()
    return {"plan_actual": plan.nombre_plan, "precio": plan.precio_mensual}

