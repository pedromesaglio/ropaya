import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

# Import all models so Base.metadata is fully populated before create_all
from app.models import store as _store_model  # noqa: F401
from app.models import product as _product_model  # noqa: F401
from app.models import user as _user_model  # noqa: F401
from app.models import order as _order_model  # noqa: F401

TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_store(db):
    from app.models.store import Store
    store = Store(
        name="Moda Avellaneda",
        address="Av. Mitre 500, Avellaneda",
        description="Ropa de calidad a buen precio",
        phone="1198765432",
        accepts_returns=False,
        is_verified=True,
        is_featured=False,
    )
    db.add(store)
    db.commit()
    db.refresh(store)
    return store


@pytest.fixture
def sample_product(db, sample_store):
    from app.models.product import Product, SizeStock
    product = Product(
        store_id=sample_store.id,
        name="Remera Básica Negra",
        description="100% algodón, calidad premium",
        price=3500.0,
        category="remeras",
        color="negro",
        image_url="https://placehold.co/400x500",
    )
    db.add(product)
    db.commit()

    for size, stock in [("S", 5), ("M", 10), ("L", 8), ("XL", 3)]:
        db.add(SizeStock(product_id=product.id, size=size, stock=stock))
    db.commit()
    db.refresh(product)
    return product


@pytest.fixture
def sample_user(db):
    from app.models.user import User
    user = User(
        email="cliente@test.com",
        hashed_password="$2b$12$hashed",
        full_name="Juan Pérez",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
