import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.order import Order, OrderStatus

stripe.api_key = settings.stripe_secret_key
router = APIRouter()


@router.post("/create-intent/{order_id}")
def create_payment_intent(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Idempotency: if intent already created, return existing
    if order.stripe_payment_intent_id:
        intent = stripe.PaymentIntent.retrieve(order.stripe_payment_intent_id)
        return {"client_secret": intent.client_secret, "payment_intent_id": intent.id}

    intent = stripe.PaymentIntent.create(
        amount=round(order.total_amount * 100),  # Stripe uses cents
        currency="ars",
        metadata={"order_id": order.id},
    )
    order.stripe_payment_intent_id = intent.id
    db.commit()

    return {"client_secret": intent.client_secret, "payment_intent_id": intent.id}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except (stripe.error.SignatureVerificationError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "payment_intent.succeeded":
        payment_intent_id = event["data"]["object"]["id"]
        order = db.query(Order).filter(
            Order.stripe_payment_intent_id == payment_intent_id
        ).first()
        if order:
            order.status = OrderStatus.PAID
            db.commit()

    return {"status": "ok"}
