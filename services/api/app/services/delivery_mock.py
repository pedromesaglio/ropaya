from app.models.order import OrderStatus

_STATUS_MESSAGES = {
    OrderStatus.PENDING: "Esperando confirmación de pago",
    OrderStatus.PAID: "El local está preparando tu pedido",
    OrderStatus.PREPARING: "Rider en camino al local",
    OrderStatus.ON_THE_WAY: "Tu pedido está en camino",
    OrderStatus.DELIVERED: "¡Pedido entregado!",
}

_NEXT_STATUS = {
    OrderStatus.PAID: OrderStatus.PREPARING,
    OrderStatus.PREPARING: OrderStatus.ON_THE_WAY,
    OrderStatus.ON_THE_WAY: OrderStatus.DELIVERED,
    OrderStatus.DELIVERED: OrderStatus.DELIVERED,
}


def get_delivery_status(status: OrderStatus) -> dict:
    return {
        "status": status.value,
        "message": _STATUS_MESSAGES[status],
    }


def advance_delivery_status(status: OrderStatus) -> OrderStatus:
    return _NEXT_STATUS.get(status, status)
