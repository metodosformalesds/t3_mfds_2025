# app/services/stripe_service.py
# ────────────────────────────────────────────────
# Servicio: Integración con Stripe
# Referencia: RF-34 (Pagos y Suscripciones)
# Descripción: Gestiona la comunicación con la API de Stripe
# para crear sesiones de pago, manejar webhooks y cancelar
# suscripciones. Se integra con las tablas:
#   - plan_suscripcion
#   - historial_suscripcion
#   - proveedor_servicio
# ────────────────────────────────────────────────

import stripe
from fastapi import HTTPException, Request
from app.models import Historial_Suscripcion, Plan_Suscripcion, Proveedor_Servicio
from sqlalchemy.orm import Session
from datetime import datetime