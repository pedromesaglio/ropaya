from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.store import Store


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id"), index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Float)
    category: Mapped[str] = mapped_column(String(100), index=True)
    color: Mapped[str | None] = mapped_column(String(100), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    store: Mapped["Store"] = relationship("Store", back_populates="products")
    sizes: Mapped[list["SizeStock"]] = relationship("SizeStock", back_populates="product")


class SizeStock(Base):
    __tablename__ = "size_stocks"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    size: Mapped[str] = mapped_column(String(20))
    stock: Mapped[int] = mapped_column(Integer, default=0)

    product: Mapped["Product"] = relationship("Product", back_populates="sizes")
