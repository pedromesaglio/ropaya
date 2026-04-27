from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderRead

router = APIRouter()


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    total = sum(item.unit_price * item.quantity for item in payload.items)
    order = Order(
        user_id=payload.user_id,
        delivery_address=payload.delivery_address,
        total_amount=total,
    )
    db.add(order)
    db.flush()

    for item in payload.items:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                size=item.size,
                quantity=item.quantity,
                unit_price=item.unit_price,
            )
        )
    db.commit()
    # Re-query with eager loading to avoid lazy loading issues
    order = db.query(Order).options(selectinload(Order.items)).filter(Order.id == order.id).first()
    return order


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).options(selectinload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
