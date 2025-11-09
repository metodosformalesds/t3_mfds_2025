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

# Clave secreta de Stripe (falta por completar)
stripe.api_key = "sk_test_TU_CLAVE_DE_STRIPE"

# Crear sesión de pago (Stripe Checkout)
def crear_checkout_session(db: Session, id_proveedor: int, id_plan: int, success_url: str, cancel_url: str):
    """
    Crea una sesión de pago en Stripe para un proveedor que desea
    contratar un plan de suscripción.
    """

    # Buscar el plan seleccionado
    plan = db.query(Plan_Suscripcion).filter(
        Plan_Suscripcion.id_plan == id_plan,
        Plan_Suscripcion.estado == "activo"
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan no encontrado o inactivo")

    # Crear sesión en Stripe
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "mxn",
                    "product_data": {"name": plan.nombre_plan},
                    "unit_amount": int(float(plan.precio_mensual) * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear sesión Stripe: {str(e)}")

    # Registrar la suscripción pendiente en la base de datos
    nuevo_historial = Historial_Suscripcion(
        id_proveedor=id_proveedor,
        id_plan=id_plan,
        id_pago_stripe=session.id,
        monto_pagado=plan.precio_mensual,
        estado="pendiente"
    )
    db.add(nuevo_historial)
    db.commit()
    db.refresh(nuevo_historial)

    return {"checkout_url": session.url, "session_id": session.id}

