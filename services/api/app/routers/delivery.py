from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order, OrderStatus
from app.services.delivery_mock import get_delivery_status

router = APIRouter()

_ALL_STEPS = [
    OrderStatus.PENDING,
    OrderStatus.PAID,
    OrderStatus.PREPARING,
    OrderStatus.ON_THE_WAY,
    OrderStatus.DELIVERED,
]


@router.get("/{order_id}/track")
def track_delivery(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    status_info = get_delivery_status(order.status)
    current_index = _ALL_STEPS.index(order.status)

    steps = [
        {
            "status": s.value,
            "label": get_delivery_status(s)["message"],
            "completed": i <= current_index,
        }
        for i, s in enumerate(_ALL_STEPS)
    ]

    return {
        "order_id": order.id,
        "status": status_info["status"],
        "message": status_info["message"],
        "steps": steps,
    }
