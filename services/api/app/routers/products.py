from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product, SizeStock
from app.schemas.product import ProductRead

router = APIRouter()


@router.get("", response_model=list[ProductRead])
def list_products(
    category: str | None = Query(None),
    max_price: float | None = Query(None),
    size: str | None = Query(None),
    color: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.is_active == True)

    if category:
        query = query.filter(Product.category == category)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if color:
        query = query.filter(Product.color == color)
    if size:
        query = query.join(SizeStock).filter(
            SizeStock.size == size, SizeStock.stock > 0
        )

    return query.all()


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(
        Product.id == product_id, Product.is_active == True
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
