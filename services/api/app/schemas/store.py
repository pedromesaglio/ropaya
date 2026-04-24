from datetime import datetime

from pydantic import BaseModel


class StoreBase(BaseModel):
    name: str
    address: str
    description: str | None = None
    phone: str | None = None
    accepts_returns: bool = False
    return_contact: str | None = None


class StoreRead(StoreBase):
    id: int
    is_verified: bool
    is_featured: bool
    created_at: datetime

    model_config = {"from_attributes": True}
