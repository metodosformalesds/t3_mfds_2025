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
