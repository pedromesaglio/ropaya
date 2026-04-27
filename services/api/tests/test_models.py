import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.store import Store
from app.models.product import Product, SizeStock
from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import User


@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()
    Base.metadata.drop_all(engine)


def test_store_creation(db):
    store = Store(
        name="Moda Center",
        address="Av. Mitre 123, Avellaneda",
        description="Ropa de moda a buen precio",
        phone="1112345678",
        accepts_returns=True,
        return_contact="WhatsApp: 1112345678",
        is_verified=True,
        is_featured=False,
    )
    db.add(store)
    db.commit()
    db.refresh(store)
    assert store.id is not None
    assert store.name == "Moda Center"
    assert store.accepts_returns is True


def test_product_with_sizes(db):
    store = Store(name="Test Store", address="Calle 1, Avellaneda")
    db.add(store)
    db.commit()

    product = Product(
        store_id=store.id,
        name="Remera básica",
        description="100% algodón",
        price=3500.00,
        category="remeras",
        color="negro",
    )
    db.add(product)
    db.commit()

    size = SizeStock(product_id=product.id, size="M", stock=10)
    db.add(size)
    db.commit()

    db.refresh(product)
    assert len(product.sizes) == 1
    assert product.sizes[0].size == "M"
    assert product.sizes[0].stock == 10


def test_order_status_default(db):
    user = User(email="test@test.com", hashed_password="hash", full_name="Test User")
    db.add(user)
    db.commit()

    order = Order(
        user_id=user.id,
        total_amount=7000.00,
        delivery_address="Corrientes 1234, CABA",
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    assert order.status == OrderStatus.PENDING
