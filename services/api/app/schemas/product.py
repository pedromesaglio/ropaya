from datetime import datetime

from pydantic import BaseModel


class SizeStockRead(BaseModel):
    id: int
    size: str
    stock: int

    model_config = {"from_attributes": True}


class ProductRead(BaseModel):
    id: int
    store_id: int
    name: str
    description: str | None = None
    price: float
    category: str
    color: str | None = None
    image_url: str | None = None
    is_active: bool
    created_at: datetime
    sizes: list[SizeStockRead] = []

    model_config = {"from_attributes": True}
