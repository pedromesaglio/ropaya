from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.store import Store
from app.models.product import Product
from app.schemas.store import StoreRead
from app.schemas.product import ProductRead

router = APIRouter()


@router.get("", response_model=list[StoreRead])
def list_stores(db: Session = Depends(get_db)):
    return db.query(Store).filter(Store.is_verified == True).all()


@router.get("/{store_id}", response_model=StoreRead)
def get_store(store_id: int, db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store


@router.get("/{store_id}/products", response_model=list[ProductRead])
def get_store_products(store_id: int, db: Session = Depends(get_db)):
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return db.query(Product).filter(
        Product.store_id == store_id,
        Product.is_active == True
    ).all()
