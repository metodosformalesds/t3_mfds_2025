# app/schemas/schemas_suscripcion.py
# ────────────────────────────────────────────────
# Esquemas: Suscripciones
# Referencia: RF-21 al RF-23, RF-34
# Descripción:
#   Define los modelos Pydantic utilizados para validar los datos
#   de entrada y salida relacionados con las suscripciones y pagos.
# ────────────────────────────────────────────────

from pydantic import BaseModel

# ────────────────────────────────────────────────
# Solicitud para crear una sesión de pago en Stripe
# ────────────────────────────────────────────────
class CheckoutRequest(BaseModel):
    id_proveedor: int
    id_plan: int
    success_url: str
    cancel_url: str


# ────────────────────────────────────────────────
# Respuesta al crear la sesión de pago
# ────────────────────────────────────────────────
class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


# ────────────────────────────────────────────────
# Esquema de respuesta para historial de suscripciones
# ────────────────────────────────────────────────
class HistorialSuscripcionResponse(BaseModel):
    id_historial_suscripcion: int
    id_plan: int
    estado: str
    monto_pagado: float
    fecha_inicio: str | None
    fecha_fin: str | None

    class Config:
        orm_mode = True

