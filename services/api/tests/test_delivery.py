import pytest

from app.models.order import OrderStatus
from app.services.delivery_mock import get_delivery_status, advance_delivery_status


def test_pending_order_delivery_status():
    status = get_delivery_status(OrderStatus.PENDING)
    assert status["status"] == "pending"
    assert status["message"] == "Esperando confirmación de pago"


def test_paid_order_delivery_status():
    status = get_delivery_status(OrderStatus.PAID)
    assert status["status"] == "paid"
    assert status["message"] == "El local está preparando tu pedido"


def test_preparing_delivery_status():
    status = get_delivery_status(OrderStatus.PREPARING)
    assert status["status"] == "preparing"
    assert status["message"] == "Rider en camino al local"


def test_on_the_way_delivery_status():
    status = get_delivery_status(OrderStatus.ON_THE_WAY)
    assert status["status"] == "on_the_way"
    assert status["message"] == "Tu pedido está en camino"


def test_delivered_delivery_status():
    status = get_delivery_status(OrderStatus.DELIVERED)
    assert status["status"] == "delivered"
    assert status["message"] == "¡Pedido entregado!"


def test_advance_from_paid_to_preparing():
    next_status = advance_delivery_status(OrderStatus.PAID)
    assert next_status == OrderStatus.PREPARING


def test_advance_from_preparing_to_on_the_way():
    next_status = advance_delivery_status(OrderStatus.PREPARING)
    assert next_status == OrderStatus.ON_THE_WAY


def test_advance_from_on_the_way_to_delivered():
    next_status = advance_delivery_status(OrderStatus.ON_THE_WAY)
    assert next_status == OrderStatus.DELIVERED


def test_advance_from_delivered_stays_delivered():
    next_status = advance_delivery_status(OrderStatus.DELIVERED)
    assert next_status == OrderStatus.DELIVERED
