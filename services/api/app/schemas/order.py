from datetime import datetime

from pydantic import BaseModel

from app.models.order import OrderStatus


class OrderItemCreate(BaseModel):
    product_id: int
    size: str
    quantity: int
    unit_price: float


class OrderCreate(BaseModel):
    user_id: int
    delivery_address: str
    items: list[OrderItemCreate]


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    size: str
    quantity: int
    unit_price: float

    model_config = {"from_attributes": True}


class OrderRead(BaseModel):
    id: int
    user_id: int
    status: OrderStatus
    total_amount: float
    delivery_address: str
    stripe_payment_intent_id: str | None = None
    created_at: datetime
    items: list[OrderItemRead] = []

    model_config = {"from_attributes": True}
