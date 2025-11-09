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

