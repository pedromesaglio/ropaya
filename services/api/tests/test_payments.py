from unittest.mock import MagicMock, patch


def test_create_payment_intent(client, sample_product, sample_user):
    order_payload = {
        "user_id": sample_user.id,
        "delivery_address": "Corrientes 1234, CABA",
        "items": [{"product_id": sample_product.id, "size": "M", "quantity": 1, "unit_price": 3500.0}],
    }
    order = client.post("/orders", json=order_payload).json()

    mock_intent = MagicMock()
    mock_intent.id = "pi_test_123"
    mock_intent.client_secret = "pi_test_123_secret_xxx"

    with patch("app.routers.payments.stripe.PaymentIntent.create", return_value=mock_intent):
        response = client.post(f"/payments/create-intent/{order['id']}")

    assert response.status_code == 200
    data = response.json()
    assert data["client_secret"] == "pi_test_123_secret_xxx"
    assert data["payment_intent_id"] == "pi_test_123"


def test_stripe_webhook_payment_succeeded(client, sample_product, sample_user, db):
    order_payload = {
        "user_id": sample_user.id,
        "delivery_address": "Corrientes 1234, CABA",
        "items": [{"product_id": sample_product.id, "size": "M", "quantity": 1, "unit_price": 3500.0}],
    }
    order = client.post("/orders", json=order_payload).json()

    from app.models.order import Order
    db_order = db.query(Order).filter(Order.id == order["id"]).first()
    db_order.stripe_payment_intent_id = "pi_test_abc"
    db.commit()

    event_payload = {
        "type": "payment_intent.succeeded",
        "data": {"object": {"id": "pi_test_abc"}},
    }

    with patch("app.routers.payments.stripe.Webhook.construct_event", return_value=event_payload):
        response = client.post(
            "/payments/webhook",
            json=event_payload,
            headers={"stripe-signature": "test_sig"},
        )

    assert response.status_code == 200
    db.refresh(db_order)
    assert db_order.status.value == "paid"
