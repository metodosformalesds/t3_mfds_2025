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

# Webhook para confirmar pago
def manejar_webhook_stripe(db: Session, request: Request, endpoint_secret: str):
    """
    Maneja los eventos enviados por Stripe (pago completado o fallido).
    """

    payload = request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Firma Stripe inválida")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        # Buscar la suscripción correspondiente en la base
        historial = db.query(Historial_Suscripcion).filter(
            Historial_Suscripcion.id_pago_stripe == session["id"]
        ).first()

        if historial:
            historial.estado = "activa"
            historial.fecha_inicio = datetime.utcnow()

            # Actualizar el plan actual del proveedor
            proveedor = db.query(Proveedor_Servicio).filter(
                Proveedor_Servicio.id_proveedor == historial.id_proveedor
            ).first()

            if proveedor:
                proveedor.id_plan_suscripcion = historial.id_plan

            db.commit()

    return {"status": "success"}

# Cancelar suscripción manualmente
def cancelar_suscripcion(db: Session, id_proveedor: int):
    """
    Cancela la suscripción activa del proveedor en la base de datos
    y lo regresa al plan gratuito.
    """
    historial = db.query(Historial_Suscripcion).filter(
        Historial_Suscripcion.id_proveedor == id_proveedor,
        Historial_Suscripcion.estado == "activa"
    ).first()

    if not historial:
        raise HTTPException(status_code=404, detail="No hay suscripción activa para cancelar")

    historial.estado = "cancelada"
    historial.fecha_fin = datetime.utcnow()

    proveedor = db.query(Proveedor_Servicio).filter(
        Proveedor_Servicio.id_proveedor == id_proveedor
    ).first()

    if proveedor:
        proveedor.id_plan_suscripcion = None  # Regresa al plan gratuito por defecto

    db.commit()

    return {"message": "Suscripción cancelada correctamente"}

