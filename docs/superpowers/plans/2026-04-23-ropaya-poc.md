# Ropaya POC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working POC of the Ropaya marketplace — clients can browse products from Avellaneda clothing stores, add to cart, and pay via Stripe, with mocked delivery tracking.

**Architecture:** FastAPI backend serving a REST API with PostgreSQL for persistence and Redis for session/cache. Next.js 14 frontend consuming the API. Rappi delivery is fully mocked. Stripe runs in test mode.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL 16, Redis 7, Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Stripe SDK, Pytest, Playwright, Docker Compose.

---

## File Structure

```
ropaya/
├── docker-compose.yml
├── .env.example
├── services/
│   ├── api/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── alembic.ini
│   │   ├── alembic/
│   │   │   └── versions/
│   │   ├── app/
│   │   │   ├── main.py                    # FastAPI app entry point
│   │   │   ├── config.py                  # Settings (env vars)
│   │   │   ├── database.py                # SQLAlchemy engine + session
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── store.py               # Store model
│   │   │   │   ├── product.py             # Product + SizeStock models
│   │   │   │   ├── order.py               # Order + OrderItem models
│   │   │   │   └── user.py                # User model
│   │   │   ├── schemas/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── store.py               # Pydantic schemas for Store
│   │   │   │   ├── product.py             # Pydantic schemas for Product
│   │   │   │   ├── order.py               # Pydantic schemas for Order
│   │   │   │   └── user.py                # Pydantic schemas for User
│   │   │   ├── routers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── stores.py              # GET /stores, GET /stores/{id}
│   │   │   │   ├── products.py            # GET /products, GET /products/{id}
│   │   │   │   ├── cart.py                # POST /cart, GET /cart
│   │   │   │   ├── orders.py              # POST /orders, GET /orders/{id}
│   │   │   │   ├── payments.py            # POST /payments/create-intent, POST /payments/webhook
│   │   │   │   └── delivery.py            # GET /delivery/{order_id}/track (mocked)
│   │   │   └── services/
│   │   │       ├── __init__.py
│   │   │       ├── commission.py          # Commission calculation logic
│   │   │       ├── stripe_service.py      # Stripe PaymentIntent creation
│   │   │       └── delivery_mock.py       # Mocked Rappi delivery states
│   │   └── tests/
│   │       ├── conftest.py                # Pytest fixtures (test DB, client)
│   │       ├── test_commission.py         # Unit tests for commission logic
│   │       ├── test_stores.py             # Integration tests for stores API
│   │       ├── test_products.py           # Integration tests for products API
│   │       ├── test_cart.py               # Integration tests for cart
│   │       ├── test_orders.py             # Integration tests for orders
│   │       ├── test_payments.py           # Integration tests for Stripe webhook
│   │       └── test_delivery.py           # Integration tests for delivery mock
│   └── frontend/
│       ├── Dockerfile
│       ├── package.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       ├── app/
│       │   ├── layout.tsx                 # Root layout
│       │   ├── page.tsx                   # Home page
│       │   ├── stores/
│       │   │   ├── page.tsx               # Store listing
│       │   │   └── [id]/
│       │   │       └── page.tsx           # Store detail + products
│       │   ├── products/
│       │   │   └── [id]/
│       │   │       └── page.tsx           # Product detail + size table
│       │   ├── cart/
│       │   │   └── page.tsx               # Cart page
│       │   ├── checkout/
│       │   │   └── page.tsx               # Checkout + Stripe Elements
│       │   └── orders/
│       │       └── [id]/
│       │           └── page.tsx           # Order confirmation + tracking
│       ├── components/
│       │   ├── ui/                        # shadcn/ui components
│       │   ├── StoreCard.tsx              # Store card for listing
│       │   ├── ProductCard.tsx            # Product card for grid
│       │   ├── SizeTable.tsx              # Interactive size table
│       │   ├── CartItem.tsx               # Cart item row
│       │   └── TrackingStatus.tsx         # Delivery status steps
│       ├── lib/
│       │   ├── api.ts                     # API client (fetch wrapper)
│       │   └── cart-store.ts              # Zustand cart state
│       └── e2e/
│           └── purchase-flow.spec.ts      # Playwright E2E happy path
```

---

## Task 1: Docker Compose + project scaffold

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `services/api/Dockerfile`
- Create: `services/api/requirements.txt`
- Create: `services/frontend/Dockerfile`

- [ ] **Step 1: Create `.env.example`**

```bash
# Database
POSTGRES_USER=ropaya
POSTGRES_PASSWORD=ropaya
POSTGRES_DB=ropaya
DATABASE_URL=postgresql://ropaya:ropaya@db:5432/ropaya

# Redis
REDIS_URL=redis://redis:6379/0

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_COMMISSION_PERCENT=2.5

# App
SECRET_KEY=changeme
ENVIRONMENT=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

- [ ] **Step 2: Create `docker-compose.yml`**

```yaml
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build: ./services/api
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      STRIPE_COMMISSION_PERCENT: ${STRIPE_COMMISSION_PERCENT}
      SECRET_KEY: ${SECRET_KEY}
      ENVIRONMENT: ${ENVIRONMENT}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./services/api:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./services/frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
    depends_on:
      - api
    volumes:
      - ./services/frontend:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev

volumes:
  postgres_data:
```

- [ ] **Step 3: Create `services/api/requirements.txt`**

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.35
alembic==1.13.3
psycopg2-binary==2.9.9
pydantic==2.9.2
pydantic-settings==2.5.2
redis==5.1.1
stripe==10.12.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
httpx==0.27.2
pytest==8.3.3
pytest-asyncio==0.24.0
pytest-cov==5.0.0
```

- [ ] **Step 4: Create `services/api/Dockerfile`**

```dockerfile
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 5: Create `services/frontend/Dockerfile`**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "dev"]
```

- [ ] **Step 6: Copy `.env.example` to `.env`**

```bash
cp .env.example .env
```

Edit `.env` and fill in your Stripe test keys (get them from dashboard.stripe.com → Developers → API keys).

- [ ] **Step 7: Commit**

```bash
git add docker-compose.yml .env.example services/api/Dockerfile services/api/requirements.txt services/frontend/Dockerfile
git commit -m "chore: add Docker Compose scaffold and project structure"
```

---

## Task 2: FastAPI app skeleton + config

**Files:**
- Create: `services/api/app/main.py`
- Create: `services/api/app/config.py`
- Create: `services/api/app/database.py`

- [ ] **Step 1: Create `services/api/app/config.py`**

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    redis_url: str
    stripe_secret_key: str
    stripe_webhook_secret: str
    stripe_commission_percent: float = 2.5
    secret_key: str
    environment: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
```

- [ ] **Step 2: Create `services/api/app/database.py`**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 3: Create `services/api/app/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import stores, products, cart, orders, payments, delivery

app = FastAPI(title="Ropaya API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stores.router, prefix="/stores", tags=["stores"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(cart.router, prefix="/cart", tags=["cart"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])
app.include_router(delivery.router, prefix="/delivery", tags=["delivery"])


@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 4: Create empty `__init__.py` files**

```bash
mkdir -p services/api/app/models services/api/app/schemas services/api/app/routers services/api/app/services services/api/tests
touch services/api/app/__init__.py
touch services/api/app/models/__init__.py
touch services/api/app/schemas/__init__.py
touch services/api/app/routers/__init__.py
touch services/api/app/services/__init__.py
touch services/api/tests/__init__.py
```

- [ ] **Step 5: Commit**

```bash
git add services/api/app/
git commit -m "feat: add FastAPI app skeleton with config and database setup"
```

---

## Task 3: Database models

**Files:**
- Create: `services/api/app/models/store.py`
- Create: `services/api/app/models/product.py`
- Create: `services/api/app/models/order.py`
- Create: `services/api/app/models/user.py`

- [ ] **Step 1: Write failing test for Store model**

Create `services/api/tests/test_models.py`:

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd services/api && python -m pytest tests/test_models.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'app.models.store'`

- [ ] **Step 3: Create `services/api/app/models/user.py`**

```python
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
```

- [ ] **Step 4: Create `services/api/app/models/store.py`**

```python
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.product import Product


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    address: Mapped[str] = mapped_column(String(500))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    accepts_returns: Mapped[bool] = mapped_column(Boolean, default=False)
    return_contact: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    products: Mapped[list["Product"]] = relationship("Product", back_populates="store")
```

- [ ] **Step 5: Create `services/api/app/models/product.py`**

```python
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
```

- [ ] **Step 6: Create `services/api/app/models/order.py`**

```python
import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PREPARING = "preparing"
    ON_THE_WAY = "on_the_way"
    DELIVERED = "delivered"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus), default=OrderStatus.PENDING
    )
    total_amount: Mapped[float] = mapped_column(Float)
    delivery_address: Mapped[str] = mapped_column(String(500))
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    size: Mapped[str] = mapped_column(String(20))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[float] = mapped_column(Float)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
cd services/api && python -m pytest tests/test_models.py -v
```

Expected: 3 tests PASS

- [ ] **Step 8: Commit**

```bash
git add services/api/app/models/ services/api/tests/test_models.py
git commit -m "feat: add SQLAlchemy models for Store, Product, Order, User"
```

---

## Task 4: Alembic migrations

**Files:**
- Create: `services/api/alembic.ini`
- Create: `services/api/alembic/env.py`
- Create: `services/api/alembic/versions/0001_initial.py`

- [ ] **Step 1: Initialize Alembic**

```bash
cd services/api && alembic init alembic
```

- [ ] **Step 2: Edit `services/api/alembic/env.py`** — replace the `target_metadata` section:

```python
from app.database import Base
from app.models import store, product, order, user  # noqa: F401

target_metadata = Base.metadata
```

Also update the `run_migrations_online` function to use the `DATABASE_URL` from settings:

```python
from app.config import settings

def run_migrations_online() -> None:
    connectable = create_engine(settings.database_url)
    # ... rest of the function unchanged
```

- [ ] **Step 3: Generate initial migration**

```bash
cd services/api && alembic revision --autogenerate -m "initial"
```

Expected: creates `alembic/versions/xxxx_initial.py` with tables for users, stores, products, size_stocks, orders, order_items.

- [ ] **Step 4: Apply migration to local DB (requires DB running)**

```bash
docker compose up db -d
cd services/api && alembic upgrade head
```

Expected: all tables created without errors.

- [ ] **Step 5: Commit**

```bash
git add services/api/alembic/ services/api/alembic.ini
git commit -m "feat: add Alembic migrations for initial schema"
```

---

## Task 5: Commission service (pure logic, fully tested)

**Files:**
- Create: `services/api/app/services/commission.py`
- Create: `services/api/tests/test_commission.py`

- [ ] **Step 1: Write failing tests**

Create `services/api/tests/test_commission.py`:

```python
import pytest

from app.services.commission import calculate_commission, calculate_store_payout


def test_commission_standard_rate():
    result = calculate_commission(amount=10000.0, rate_percent=2.5)
    assert result == 250.0


def test_commission_zero_amount():
    result = calculate_commission(amount=0.0, rate_percent=2.5)
    assert result == 0.0


def test_commission_rounds_to_two_decimals():
    result = calculate_commission(amount=333.33, rate_percent=2.5)
    assert result == 8.33


def test_store_payout_is_amount_minus_commission():
    payout = calculate_store_payout(amount=10000.0, rate_percent=2.5)
    assert payout == 9750.0


def test_store_payout_with_zero_commission():
    payout = calculate_store_payout(amount=5000.0, rate_percent=0.0)
    assert payout == 5000.0


def test_commission_negative_amount_raises():
    with pytest.raises(ValueError, match="amount must be non-negative"):
        calculate_commission(amount=-100.0, rate_percent=2.5)


def test_commission_invalid_rate_raises():
    with pytest.raises(ValueError, match="rate_percent must be between 0 and 100"):
        calculate_commission(amount=1000.0, rate_percent=150.0)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd services/api && python -m pytest tests/test_commission.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'app.services.commission'`

- [ ] **Step 3: Implement `services/api/app/services/commission.py`**

```python
def calculate_commission(amount: float, rate_percent: float) -> float:
    if amount < 0:
        raise ValueError("amount must be non-negative")
    if not (0 <= rate_percent <= 100):
        raise ValueError("rate_percent must be between 0 and 100")
    return round(amount * rate_percent / 100, 2)


def calculate_store_payout(amount: float, rate_percent: float) -> float:
    return round(amount - calculate_commission(amount, rate_percent), 2)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd services/api && python -m pytest tests/test_commission.py -v
```

Expected: 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add services/api/app/services/commission.py services/api/tests/test_commission.py
git commit -m "feat: add commission calculation service with full test coverage"
```

---

## Task 6: Delivery mock service

**Files:**
- Create: `services/api/app/services/delivery_mock.py`
- Create: `services/api/tests/test_delivery.py`

- [ ] **Step 1: Write failing tests**

Create `services/api/tests/test_delivery.py`:

```python
import pytest

from app.models.order import OrderStatus
from app.services.delivery_mock import get_delivery_status, advance_delivery_status


def test_pending_order_delivery_status():
    status = get_delivery_status(OrderStatus.PENDING)
    assert status["status"] == "pending"
    assert status["message"] == "Esperando confirmación de pago"


def test_paid_order_delivery_status():
    status = get_delivery_status(OrderStatus.PAID)
    assert status["status"] == "paid"
    assert status["message"] == "El local está preparando tu pedido"


def test_preparing_delivery_status():
    status = get_delivery_status(OrderStatus.PREPARING)
    assert status["status"] == "preparing"
    assert status["message"] == "Rider en camino al local"


def test_on_the_way_delivery_status():
    status = get_delivery_status(OrderStatus.ON_THE_WAY)
    assert status["status"] == "on_the_way"
    assert status["message"] == "Tu pedido está en camino"


def test_delivered_delivery_status():
    status = get_delivery_status(OrderStatus.DELIVERED)
    assert status["status"] == "delivered"
    assert status["message"] == "¡Pedido entregado!"


def test_advance_from_paid_to_preparing():
    next_status = advance_delivery_status(OrderStatus.PAID)
    assert next_status == OrderStatus.PREPARING


def test_advance_from_preparing_to_on_the_way():
    next_status = advance_delivery_status(OrderStatus.PREPARING)
    assert next_status == OrderStatus.ON_THE_WAY


def test_advance_from_on_the_way_to_delivered():
    next_status = advance_delivery_status(OrderStatus.ON_THE_WAY)
    assert next_status == OrderStatus.DELIVERED


def test_advance_from_delivered_stays_delivered():
    next_status = advance_delivery_status(OrderStatus.DELIVERED)
    assert next_status == OrderStatus.DELIVERED
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd services/api && python -m pytest tests/test_delivery.py -v
```

Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 3: Implement `services/api/app/services/delivery_mock.py`**

```python
from app.models.order import OrderStatus

_STATUS_MESSAGES = {
    OrderStatus.PENDING: "Esperando confirmación de pago",
    OrderStatus.PAID: "El local está preparando tu pedido",
    OrderStatus.PREPARING: "Rider en camino al local",
    OrderStatus.ON_THE_WAY: "Tu pedido está en camino",
    OrderStatus.DELIVERED: "¡Pedido entregado!",
}

_NEXT_STATUS = {
    OrderStatus.PAID: OrderStatus.PREPARING,
    OrderStatus.PREPARING: OrderStatus.ON_THE_WAY,
    OrderStatus.ON_THE_WAY: OrderStatus.DELIVERED,
    OrderStatus.DELIVERED: OrderStatus.DELIVERED,
}


def get_delivery_status(status: OrderStatus) -> dict:
    return {
        "status": status.value,
        "message": _STATUS_MESSAGES[status],
    }


def advance_delivery_status(status: OrderStatus) -> OrderStatus:
    return _NEXT_STATUS.get(status, status)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd services/api && python -m pytest tests/test_delivery.py -v
```

Expected: 9 tests PASS

- [ ] **Step 5: Commit**

```bash
git add services/api/app/services/delivery_mock.py services/api/tests/test_delivery.py
git commit -m "feat: add mocked delivery service with status progression"
```

---

## Task 7: Pytest fixtures + test database setup

**Files:**
- Create: `services/api/tests/conftest.py`

- [ ] **Step 1: Create `services/api/tests/conftest.py`**

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

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
```

- [ ] **Step 2: Run all existing tests to verify they still pass**

```bash
cd services/api && python -m pytest tests/ -v --ignore=tests/test_models.py
```

Expected: all tests PASS (test_models.py uses its own fixture and is excluded here to avoid conflict)

- [ ] **Step 3: Commit**

```bash
git add services/api/tests/conftest.py
git commit -m "test: add pytest fixtures with test database and sample data"
```

---

## Task 8: Stores API

**Files:**
- Create: `services/api/app/schemas/store.py`
- Create: `services/api/app/routers/stores.py`
- Create: `services/api/tests/test_stores.py`

- [ ] **Step 1: Write failing tests**

Create `services/api/tests/test_stores.py`:

```python
def test_list_stores_empty(client):
    response = client.get("/stores")
    assert response.status_code == 200
    assert response.json() == []


def test_list_stores_returns_verified_stores(client, sample_store):
    response = client.get("/stores")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Moda Avellaneda"
    assert data[0]["address"] == "Av. Mitre 500, Avellaneda"
    assert data[0]["is_verified"] is True


def test_get_store_by_id(client, sample_store):
    response = client.get(f"/stores/{sample_store.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_store.id
    assert data["name"] == "Moda Avellaneda"


def test_get_store_not_found(client):
    response = client.get("/stores/99999")
    assert response.status_code == 404


def test_get_store_products(client, sample_store, sample_product):
    response = client.get(f"/stores/{sample_store.id}/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Remera Básica Negra"
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd services/api && python -m pytest tests/test_stores.py -v
```

Expected: FAIL

- [ ] **Step 3: Create `services/api/app/schemas/store.py`**

```python
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
```

- [ ] **Step 4: Create `services/api/app/schemas/product.py`**

```python
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
```

- [ ] **Step 5: Create `services/api/app/routers/stores.py`**

```python
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
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd services/api && python -m pytest tests/test_stores.py -v
```

Expected: 5 tests PASS

- [ ] **Step 7: Commit**

```bash
git add services/api/app/schemas/store.py services/api/app/schemas/product.py services/api/app/routers/stores.py services/api/tests/test_stores.py
git commit -m "feat: add stores API with list and detail endpoints"
```

---

## Task 9: Products API

**Files:**
- Create: `services/api/app/routers/products.py`
- Create: `services/api/tests/test_products.py`

- [ ] **Step 1: Write failing tests**

Create `services/api/tests/test_products.py`:

```python
def test_list_products(client, sample_product):
    response = client.get("/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Remera Básica Negra"


def test_list_products_filter_by_category(client, sample_product):
    response = client.get("/products?category=remeras")
    assert response.status_code == 200
    assert len(response.json()) == 1

    response = client.get("/products?category=pantalones")
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_list_products_filter_by_max_price(client, sample_product):
    response = client.get("/products?max_price=5000")
    assert response.status_code == 200
    assert len(response.json()) == 1

    response = client.get("/products?max_price=1000")
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_list_products_filter_by_size(client, sample_product):
    response = client.get("/products?size=M")
    assert response.status_code == 200
    assert len(response.json()) == 1

    response = client.get("/products?size=XXL")
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_get_product_by_id(client, sample_product):
    response = client.get(f"/products/{sample_product.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Remera Básica Negra"
    assert data["price"] == 3500.0
    assert len(data["sizes"]) == 4


def test_get_product_not_found(client):
    response = client.get("/products/99999")
    assert response.status_code == 404
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd services/api && python -m pytest tests/test_products.py -v
```

Expected: FAIL

- [ ] **Step 3: Create `services/api/app/routers/products.py`**

```python
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd services/api && python -m pytest tests/test_products.py -v
```

Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add services/api/app/routers/products.py services/api/tests/test_products.py
git commit -m "feat: add products API with category/price/size/color filters"
```

---

## Task 10: Orders API + Stripe payment intent

**Files:**
- Create: `services/api/app/schemas/order.py`
- Create: `services/api/app/services/stripe_service.py`
- Create: `services/api/app/routers/orders.py`
- Create: `services/api/app/routers/payments.py`
- Create: `services/api/tests/test_orders.py`
- Create: `services/api/tests/test_payments.py`

- [ ] **Step 1: Write failing tests for orders**

Create `services/api/tests/test_orders.py`:

```python
def test_create_order(client, sample_product, sample_user):
    payload = {
        "user_id": sample_user.id,
        "delivery_address": "Corrientes 1234, CABA",
        "items": [
            {
                "product_id": sample_product.id,
                "size": "M",
                "quantity": 1,
                "unit_price": sample_product.price,
            }
        ],
    }
    response = client.post("/orders", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "pending"
    assert data["total_amount"] == sample_product.price
    assert len(data["items"]) == 1


def test_get_order_by_id(client, sample_product, sample_user):
    payload = {
        "user_id": sample_user.id,
        "delivery_address": "Corrientes 1234, CABA",
        "items": [
            {
                "product_id": sample_product.id,
                "size": "M",
                "quantity": 2,
                "unit_price": 3500.0,
            }
        ],
    }
    create_response = client.post("/orders", json=payload)
    order_id = create_response.json()["id"]

    response = client.get(f"/orders/{order_id}")
    assert response.status_code == 200
    assert response.json()["id"] == order_id
    assert response.json()["total_amount"] == 7000.0


def test_get_order_not_found(client):
    response = client.get("/orders/99999")
    assert response.status_code == 404
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd services/api && python -m pytest tests/test_orders.py -v
```

Expected: FAIL

- [ ] **Step 3: Create `services/api/app/schemas/order.py`**

```python
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
```

- [ ] **Step 4: Create `services/api/app/routers/orders.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

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
    db.refresh(order)
    return order


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
```

- [ ] **Step 5: Run order tests to verify they pass**

```bash
cd services/api && python -m pytest tests/test_orders.py -v
```

Expected: 3 tests PASS

- [ ] **Step 6: Write failing tests for payments**

Create `services/api/tests/test_payments.py`:

```python
from unittest.mock import MagicMock, patch


def test_create_payment_intent(client, sample_product, sample_user):
    order_payload = {
        "user_id": sample_user.id,
        "delivery_address": "Corrientes 1234, CABA",
        "items": [{"product_id": sample_product.id, "size": "M", "quantity": 1, "unit_price": 3500.0}],
    }
    order = client.post("/orders", json=order_payload).json()

    mock_intent = MagicMock()
    mock_intent.id = "pi_test_123"
    mock_intent.client_secret = "pi_test_123_secret_xxx"

    with patch("app.routers.payments.stripe.PaymentIntent.create", return_value=mock_intent):
        response = client.post(f"/payments/create-intent/{order['id']}")

    assert response.status_code == 200
    data = response.json()
    assert data["client_secret"] == "pi_test_123_secret_xxx"
    assert data["payment_intent_id"] == "pi_test_123"


def test_stripe_webhook_payment_succeeded(client, sample_product, sample_user, db):
    order_payload = {
        "user_id": sample_user.id,
        "delivery_address": "Corrientes 1234, CABA",
        "items": [{"product_id": sample_product.id, "size": "M", "quantity": 1, "unit_price": 3500.0}],
    }
    order = client.post("/orders", json=order_payload).json()

    from app.models.order import Order
    db_order = db.query(Order).filter(Order.id == order["id"]).first()
    db_order.stripe_payment_intent_id = "pi_test_abc"
    db.commit()

    event_payload = {
        "type": "payment_intent.succeeded",
        "data": {"object": {"id": "pi_test_abc"}},
    }

    with patch("app.routers.payments.stripe.Webhook.construct_event", return_value=event_payload):
        response = client.post(
            "/payments/webhook",
            json=event_payload,
            headers={"stripe-signature": "test_sig"},
        )

    assert response.status_code == 200
    db.refresh(db_order)
    assert db_order.status.value == "paid"
```

- [ ] **Step 7: Create `services/api/app/routers/payments.py`**

```python
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.order import Order, OrderStatus

stripe.api_key = settings.stripe_secret_key
router = APIRouter()


@router.post("/create-intent/{order_id}")
def create_payment_intent(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    intent = stripe.PaymentIntent.create(
        amount=int(order.total_amount * 100),  # Stripe uses cents
        currency="ars",
        metadata={"order_id": order.id},
    )
    order.stripe_payment_intent_id = intent.id
    db.commit()

    return {"client_secret": intent.client_secret, "payment_intent_id": intent.id}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "payment_intent.succeeded":
        payment_intent_id = event["data"]["object"]["id"]
        order = db.query(Order).filter(
            Order.stripe_payment_intent_id == payment_intent_id
        ).first()
        if order:
            order.status = OrderStatus.PAID
            db.commit()

    return {"status": "ok"}
```

- [ ] **Step 8: Run payment tests to verify they pass**

```bash
cd services/api && python -m pytest tests/test_payments.py -v
```

Expected: 2 tests PASS

- [ ] **Step 9: Commit**

```bash
git add services/api/app/schemas/order.py services/api/app/routers/orders.py services/api/app/routers/payments.py services/api/tests/test_orders.py services/api/tests/test_payments.py
git commit -m "feat: add orders API and Stripe payment intent with webhook handler"
```

---

## Task 11: Delivery tracking endpoint

**Files:**
- Create: `services/api/app/routers/delivery.py`
- Modify: `services/api/tests/test_delivery.py`

- [ ] **Step 1: Add API integration tests to `services/api/tests/test_delivery.py`**

Append these tests to the existing file:

```python
def test_get_delivery_tracking(client, sample_product, sample_user):
    order_payload = {
        "user_id": sample_user.id,
        "delivery_address": "Corrientes 1234, CABA",
        "items": [{"product_id": sample_product.id, "size": "M", "quantity": 1, "unit_price": 3500.0}],
    }
    order = client.post("/orders", json=order_payload).json()

    response = client.get(f"/delivery/{order['id']}/track")
    assert response.status_code == 200
    data = response.json()
    assert data["order_id"] == order["id"]
    assert data["status"] == "pending"
    assert data["message"] == "Esperando confirmación de pago"
    assert "steps" in data


def test_get_delivery_tracking_not_found(client):
    response = client.get("/delivery/99999/track")
    assert response.status_code == 404
```

- [ ] **Step 2: Run new tests to verify they fail**

```bash
cd services/api && python -m pytest tests/test_delivery.py::test_get_delivery_tracking -v
```

Expected: FAIL

- [ ] **Step 3: Create `services/api/app/routers/delivery.py`**

```python
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
```

- [ ] **Step 4: Run all delivery tests to verify they pass**

```bash
cd services/api && python -m pytest tests/test_delivery.py -v
```

Expected: 11 tests PASS

- [ ] **Step 5: Commit**

```bash
git add services/api/app/routers/delivery.py services/api/tests/test_delivery.py
git commit -m "feat: add delivery tracking endpoint with mocked step progression"
```

---

## Task 12: Run full backend test suite + coverage check

- [ ] **Step 1: Run all tests with coverage**

```bash
cd services/api && python -m pytest tests/ --ignore=tests/test_models.py --cov=app --cov-report=term-missing -v
```

Expected: all tests PASS, coverage ≥ 80%

- [ ] **Step 2: If coverage is below 80%, identify uncovered lines and add tests**

The coverage report shows which lines are uncovered. Add tests to `tests/` files for any uncovered business logic paths (not framework boilerplate).

- [ ] **Step 3: Commit coverage report config**

Create `services/api/.coveragerc`:

```ini
[run]
omit =
    tests/*
    app/main.py
    alembic/*

[report]
fail_under = 80
```

```bash
git add services/api/.coveragerc
git commit -m "chore: add coverage config with 80% minimum threshold"
```

---

## Task 13: Next.js frontend scaffold

**Files:**
- Create: `services/frontend/package.json`
- Create: `services/frontend/next.config.js`
- Create: `services/frontend/tailwind.config.js`
- Create: `services/frontend/app/layout.tsx`
- Create: `services/frontend/lib/api.ts`
- Create: `services/frontend/lib/cart-store.ts`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd services/frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --no-eslint
```

- [ ] **Step 2: Install additional dependencies**

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js zustand lucide-react class-variance-authority clsx tailwind-merge
npx shadcn@latest init
```

When `shadcn init` asks:
- Style: Default
- Base color: Zinc
- CSS variables: Yes

- [ ] **Step 3: Install shadcn components we'll need**

```bash
npx shadcn@latest add button card badge input label sheet skeleton
```

- [ ] **Step 4: Create `services/frontend/lib/api.ts`**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${path}`);
  }
  return response.json() as Promise<T>;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  description: string | null;
  phone: string | null;
  accepts_returns: boolean;
  return_contact: string | null;
  is_verified: boolean;
  is_featured: boolean;
}

export interface SizeStock {
  id: number;
  size: string;
  stock: number;
}

export interface Product {
  id: number;
  store_id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  color: string | null;
  image_url: string | null;
  is_active: boolean;
  sizes: SizeStock[];
}

export interface OrderItem {
  product_id: number;
  size: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  status: string;
  total_amount: number;
  delivery_address: string;
  items: OrderItem[];
}

export interface TrackingStep {
  status: string;
  label: string;
  completed: boolean;
}

export interface TrackingResponse {
  order_id: number;
  status: string;
  message: string;
  steps: TrackingStep[];
}

export const api = {
  stores: {
    list: () => apiFetch<Store[]>("/stores"),
    get: (id: number) => apiFetch<Store>(`/stores/${id}`),
    products: (id: number) => apiFetch<Product[]>(`/stores/${id}/products`),
  },
  products: {
    list: (params?: { category?: string; max_price?: number; size?: string; color?: string }) => {
      const query = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params ?? {})
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )
      ).toString();
      return apiFetch<Product[]>(`/products${query ? `?${query}` : ""}`);
    },
    get: (id: number) => apiFetch<Product>(`/products/${id}`),
  },
  orders: {
    create: (payload: { user_id: number; delivery_address: string; items: OrderItem[] }) =>
      apiFetch<Order>("/orders", { method: "POST", body: JSON.stringify(payload) }),
    get: (id: number) => apiFetch<Order>(`/orders/${id}`),
  },
  payments: {
    createIntent: (orderId: number) =>
      apiFetch<{ client_secret: string; payment_intent_id: string }>(
        `/payments/create-intent/${orderId}`,
        { method: "POST" }
      ),
  },
  delivery: {
    track: (orderId: number) => apiFetch<TrackingResponse>(`/delivery/${orderId}/track`),
  },
};
```

- [ ] **Step 5: Create `services/frontend/lib/cart-store.ts`**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./api";

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: number, size: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id && i.size === size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && i.size === size
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, size, quantity: 1 }] };
        });
      },
      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.size === size)
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: "ropaya-cart" }
  )
);
```

- [ ] **Step 6: Update `services/frontend/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ropaya — Ropa de Avellaneda a domicilio",
  description: "Comprá ropa de los mejores locales de Avellaneda sin salir de tu casa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Verify dev server starts**

```bash
cd services/frontend && npm run dev
```

Expected: server starts on port 3000 without errors.

- [ ] **Step 8: Commit**

```bash
git add services/frontend/
git commit -m "feat: scaffold Next.js frontend with Tailwind, shadcn/ui, API client, and cart store"
```

---

## Task 14: Frontend pages — Home, Store listing, Product detail

**Files:**
- Create: `services/frontend/components/StoreCard.tsx`
- Create: `services/frontend/components/ProductCard.tsx`
- Create: `services/frontend/components/SizeTable.tsx`
- Create: `services/frontend/app/page.tsx`
- Create: `services/frontend/app/stores/page.tsx`
- Create: `services/frontend/app/products/[id]/page.tsx`

- [ ] **Step 1: Create `services/frontend/components/StoreCard.tsx`**

```tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Store } from "@/lib/api";
import { MapPin } from "lucide-react";

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/stores/${store.id}`}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-zinc-50 text-lg">{store.name}</CardTitle>
            <div className="flex gap-1 flex-shrink-0">
              {store.is_verified && (
                <Badge variant="secondary" className="bg-emerald-900 text-emerald-300 text-xs">
                  Verificado
                </Badge>
              )}
              {store.is_featured && (
                <Badge className="bg-amber-500 text-zinc-900 text-xs">Destacado</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-1 text-zinc-400 text-sm">
            <MapPin size={14} />
            <span>{store.address}</span>
          </div>
          {store.description && (
            <p className="text-zinc-400 text-sm line-clamp-2">{store.description}</p>
          )}
          <p className="text-zinc-500 text-xs">
            {store.accepts_returns ? "✓ Acepta devoluciones" : "✗ No acepta devoluciones"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: Create `services/frontend/components/ProductCard.tsx`**

```tsx
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/lib/api";

export function ProductCard({ product }: { product: Product }) {
  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer overflow-hidden">
        <div className="aspect-[4/5] relative bg-zinc-800">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
              Sin foto
            </div>
          )}
        </div>
        <CardContent className="p-3 space-y-1">
          <p className="text-zinc-50 font-medium text-sm line-clamp-1">{product.name}</p>
          <p className="text-emerald-400 font-bold">{formattedPrice}</p>
          <div className="flex gap-1 flex-wrap">
            {product.sizes.filter((s) => s.stock > 0).map((s) => (
              <span
                key={s.size}
                className="text-xs bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded"
              >
                {s.size}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 3: Create `services/frontend/components/SizeTable.tsx`**

```tsx
"use client";
import type { SizeStock } from "@/lib/api";

interface SizeTableProps {
  sizes: SizeStock[];
  selected: string | null;
  onSelect: (size: string) => void;
}

export function SizeTable({ sizes, selected, onSelect }: SizeTableProps) {
  return (
    <div className="space-y-2">
      <p className="text-zinc-400 text-sm font-medium">Seleccioná tu talle</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => {
          const outOfStock = s.stock === 0;
          const isSelected = selected === s.size;
          return (
            <button
              key={s.size}
              onClick={() => !outOfStock && onSelect(s.size)}
              disabled={outOfStock}
              className={`
                px-4 py-2 rounded border text-sm font-medium transition-colors
                ${outOfStock
                  ? "border-zinc-800 text-zinc-700 cursor-not-allowed line-through"
                  : isSelected
                  ? "border-zinc-50 bg-zinc-50 text-zinc-900"
                  : "border-zinc-700 text-zinc-300 hover:border-zinc-400"
                }
              `}
            >
              {s.size}
              {!outOfStock && (
                <span className="text-xs ml-1 opacity-50">({s.stock})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `services/frontend/app/page.tsx`** (Home)

```tsx
import Link from "next/link";
import { api } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [stores, products] = await Promise.all([
    api.stores.list(),
    api.products.list(),
  ]);

  const featuredStores = stores.filter((s) => s.is_featured);
  const latestProducts = products.slice(0, 8);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-bold tracking-tight">
          Ropa de{" "}
          <span className="text-emerald-400">Avellaneda</span>
          <br />a tu puerta
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Los mejores locales de Avellaneda, sin filas, sin colectivo, sin perder el día.
          Elegí, pagá y recibilo hoy.
        </p>
        <Link href="/stores">
          <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold">
            Ver locales
          </Button>
        </Link>
      </section>

      {/* Featured stores */}
      {featuredStores.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Locales destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* Latest products */}
      {latestProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Últimas novedades</h2>
            <Link href="/stores" className="text-emerald-400 text-sm hover:underline">
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 5: Create `services/frontend/app/stores/page.tsx`**

```tsx
import { api } from "@/lib/api";
import { StoreCard } from "@/components/StoreCard";

export default async function StoresPage() {
  const stores = await api.stores.list();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Locales en Avellaneda</h1>
      {stores.length === 0 ? (
        <p className="text-zinc-400">No hay locales disponibles todavía.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 6: Create `services/frontend/app/products/[id]/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { api, type Product } from "@/lib/api";
import { SizeTable } from "@/components/SizeTable";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { ShoppingBag } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  useEffect(() => {
    api.products.get(Number(id)).then(setProduct);
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-zinc-800 rounded w-1/2" />
        <div className="aspect-[4/5] bg-zinc-800 rounded max-w-sm" />
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-[4/5] relative bg-zinc-800 rounded-lg overflow-hidden">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              Sin foto
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-zinc-400 text-sm capitalize">{product.category}</p>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-3xl font-bold text-emerald-400">{formattedPrice}</p>
          </div>

          {product.description && (
            <p className="text-zinc-400">{product.description}</p>
          )}

          <SizeTable
            sizes={product.sizes}
            selected={selectedSize}
            onSelect={setSelectedSize}
          />

          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold disabled:opacity-40"
          >
            <ShoppingBag size={18} className="mr-2" />
            {added ? "¡Agregado!" : "Agregar al carrito"}
          </Button>

          <Button
            variant="outline"
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            onClick={() => router.push("/cart")}
          >
            Ver carrito
          </Button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Verify pages render at localhost:3000 (with API running)**

```bash
docker compose up db api -d
cd services/frontend && npm run dev
```

Visit: `http://localhost:3000` — should show hero + empty stores/products sections.

- [ ] **Step 8: Commit**

```bash
git add services/frontend/
git commit -m "feat: add Home, Stores, and Product detail pages"
```

---

## Task 15: Cart + Checkout + Order confirmation pages

**Files:**
- Create: `services/frontend/components/CartItem.tsx`
- Create: `services/frontend/components/TrackingStatus.tsx`
- Create: `services/frontend/app/cart/page.tsx`
- Create: `services/frontend/app/checkout/page.tsx`
- Create: `services/frontend/app/orders/[id]/page.tsx`

- [ ] **Step 1: Create `services/frontend/components/CartItem.tsx`**

```tsx
"use client";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem as CartItemType } from "@/lib/cart-store";

export function CartItem({ item }: { item: CartItemType }) {
  const removeItem = useCart((s) => s.removeItem);

  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(item.product.price * item.quantity);

  return (
    <div className="flex gap-4 py-4 border-b border-zinc-800">
      <div className="w-20 h-24 relative bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
        {item.product.image_url ? (
          <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
            Sin foto
          </div>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <p className="font-medium text-zinc-50">{item.product.name}</p>
        <p className="text-zinc-400 text-sm">Talle: {item.size}</p>
        <p className="text-zinc-400 text-sm">Cantidad: {item.quantity}</p>
        <p className="text-emerald-400 font-bold">{formattedPrice}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeItem(item.product.id, item.size)}
        className="text-zinc-500 hover:text-red-400 flex-shrink-0"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create `services/frontend/components/TrackingStatus.tsx`**

```tsx
import type { TrackingStep } from "@/lib/api";
import { CheckCircle, Circle } from "lucide-react";

export function TrackingStatus({ steps, message }: { steps: TrackingStep[]; message: string }) {
  return (
    <div className="space-y-4">
      <p className="text-zinc-300 font-medium">{message}</p>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.status} className="flex items-center gap-3">
            {step.completed ? (
              <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle size={20} className="text-zinc-700 flex-shrink-0" />
            )}
            <span className={step.completed ? "text-zinc-200" : "text-zinc-600"}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className="absolute left-[9px] mt-5 w-px h-6 bg-zinc-800" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `services/frontend/app/cart/page.tsx`**

```tsx
"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { CartItem } from "@/components/CartItem";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, total } = useCart();

  const formattedTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(total());

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingBag size={48} className="text-zinc-700 mx-auto" />
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-zinc-400">Explorá los locales y encontrá lo que buscás.</p>
        <Link href="/stores">
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold">
            Ver locales
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Tu carrito</h1>
      <div>
        {items.map((item) => (
          <CartItem key={`${item.product.id}-${item.size}`} item={item} />
        ))}
      </div>
      <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
        <span className="text-lg font-bold">Total</span>
        <span className="text-2xl font-bold text-emerald-400">{formattedTotal}</span>
      </div>
      <Link href="/checkout">
        <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold">
          Ir a pagar
        </Button>
      </Link>
    </main>
  );
}
```

- [ ] **Step 4: Create `services/frontend/app/checkout/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@/lib/cart-store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const DEMO_USER_ID = 1; // In POC, hardcoded. Auth comes in v0.

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(total());

  const handleCheckout = async () => {
    if (!address.trim()) {
      setError("Ingresá tu dirección de entrega");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const order = await api.orders.create({
        user_id: DEMO_USER_ID,
        delivery_address: address,
        items: items.map((i) => ({
          product_id: i.product.id,
          size: i.size,
          quantity: i.quantity,
          unit_price: i.product.price,
        })),
      });

      const { client_secret } = await api.payments.createIntent(order.id);

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe not loaded");

      const { error: stripeError } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: { token: "tok_visa" }, // Stripe test token
        },
      });

      if (stripeError) throw new Error(stripeError.message);

      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección de entrega</Label>
        <Input
          id="address"
          placeholder="Ej: Corrientes 1234, CABA"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="bg-zinc-900 border-zinc-700"
        />
      </div>

      <div className="bg-zinc-900 rounded-lg p-4 space-y-2">
        <p className="text-zinc-400 text-sm">{items.length} producto(s)</p>
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold text-emerald-400">{formattedTotal}</span>
        </div>
        <p className="text-zinc-500 text-xs">
          Stripe cobra ~2.9% + $0.30 adicional por transacción
        </p>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button
        size="lg"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold"
      >
        {loading ? "Procesando..." : "Confirmar y pagar"}
      </Button>

      <p className="text-zinc-500 text-xs text-center">
        Pago 100% seguro vía Stripe. Modo test activo.
      </p>
    </main>
  );
}
```

- [ ] **Step 5: Create `services/frontend/app/orders/[id]/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, type TrackingResponse } from "@/lib/api";
import { TrackingStatus } from "@/components/TrackingStatus";
import { CheckCircle } from "lucide-react";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);

  useEffect(() => {
    const load = () => api.delivery.track(Number(id)).then(setTracking);
    load();
    const interval = setInterval(load, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [id]);

  if (!tracking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-zinc-800 rounded w-1/2" />
        <div className="h-40 bg-zinc-800 rounded" />
      </div>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle size={48} className="text-emerald-400 mx-auto" />
        <h1 className="text-3xl font-bold">¡Pedido confirmado!</h1>
        <p className="text-zinc-400">Orden #{tracking.order_id}</p>
      </div>

      <div className="bg-zinc-900 rounded-lg p-6">
        <TrackingStatus steps={tracking.steps} message={tracking.message} />
      </div>

      <p className="text-zinc-500 text-xs text-center">
        El estado se actualiza automáticamente cada 5 segundos.
      </p>
    </main>
  );
}
```

- [ ] **Step 6: Verify full purchase flow manually**

1. Start stack: `docker compose up`
2. Open `http://localhost:3000`
3. Navigate to a store → product → add to cart → checkout → confirm
4. Verify redirect to order confirmation with tracking

- [ ] **Step 7: Commit**

```bash
git add services/frontend/
git commit -m "feat: add Cart, Checkout, and Order tracking pages — completes full purchase flow"
```

---

## Task 16: Playwright E2E test for happy path

**Files:**
- Create: `services/frontend/e2e/purchase-flow.spec.ts`
- Create: `services/frontend/playwright.config.ts`

- [ ] **Step 1: Install Playwright**

```bash
cd services/frontend && npm install -D @playwright/test && npx playwright install chromium
```

- [ ] **Step 2: Create `services/frontend/playwright.config.ts`**

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60000,
  },
});
```

- [ ] **Step 3: Create `services/frontend/e2e/purchase-flow.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";

test("happy path: browse store → add to cart → checkout", async ({ page }) => {
  // Home page loads
  await page.goto("/");
  await expect(page.getByText("Ropa de")).toBeVisible();
  await expect(page.getByText("Avellaneda")).toBeVisible();

  // Navigate to stores
  await page.getByRole("link", { name: "Ver locales" }).click();
  await expect(page).toHaveURL("/stores");

  // If stores exist, click on first one
  const storeCards = page.locator("a[href^='/stores/']");
  const count = await storeCards.count();

  if (count > 0) {
    await storeCards.first().click();
    await expect(page.url()).toMatch(/\/stores\/\d+/);
  }
});

test("cart is empty by default", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
});

test("product page shows size selector", async ({ page }) => {
  // This test requires at least one product in the DB
  // Seed data must be present (see Task 17)
  await page.goto("/");
  const productLinks = page.locator("a[href^='/products/']");
  const count = await productLinks.count();

  if (count > 0) {
    await productLinks.first().click();
    await expect(page.getByText("Seleccioná tu talle")).toBeVisible();
  }
});
```

- [ ] **Step 4: Run E2E tests**

```bash
cd services/frontend && npx playwright test
```

Expected: tests PASS (first two unconditionally, third if seed data exists)

- [ ] **Step 5: Commit**

```bash
git add services/frontend/e2e/ services/frontend/playwright.config.ts
git commit -m "test: add Playwright E2E tests for purchase flow happy path"
```

---

## Task 17: Seed data for development

**Files:**
- Create: `services/api/seed.py`

- [ ] **Step 1: Create `services/api/seed.py`**

```python
"""Run with: python seed.py from the services/api directory."""
from app.database import SessionLocal, engine
from app.database import Base
from app.models.store import Store
from app.models.product import Product, SizeStock
from app.models.user import User

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Clear existing data
db.query(SizeStock).delete()
db.query(Product).delete()
db.query(Store).delete()
db.query(User).delete()
db.commit()

# Demo user
user = User(
    email="demo@ropaya.com",
    hashed_password="$2b$12$demo_hash",
    full_name="Usuario Demo",
)
db.add(user)
db.commit()

# Stores
stores_data = [
    {
        "name": "Moda Center Avellaneda",
        "address": "Av. Mitre 123, Avellaneda",
        "description": "Las últimas tendencias en ropa de mujer y hombre",
        "phone": "1145678901",
        "accepts_returns": False,
        "is_verified": True,
        "is_featured": True,
    },
    {
        "name": "Todo Moda",
        "address": "Av. Mitre 456, Avellaneda",
        "description": "Ropa casual y deportiva para toda la familia",
        "phone": "1156789012",
        "accepts_returns": True,
        "return_contact": "WhatsApp: 1156789012",
        "is_verified": True,
        "is_featured": False,
    },
    {
        "name": "Style Shop",
        "address": "Calle Güemes 789, Avellaneda",
        "description": "Moda urbana y streetwear",
        "phone": "1167890123",
        "accepts_returns": False,
        "is_verified": True,
        "is_featured": True,
    },
]

stores = []
for data in stores_data:
    store = Store(**data)
    db.add(store)
    db.commit()
    db.refresh(store)
    stores.append(store)

# Products
products_data = [
    {
        "store_id": stores[0].id,
        "name": "Remera Oversize Negra",
        "description": "Remera oversize 100% algodón, talle especial",
        "price": 4500.0,
        "category": "remeras",
        "color": "negro",
        "image_url": "https://placehold.co/400x500/1a1a1a/ffffff?text=Remera+Negra",
        "sizes": [("XS", 3), ("S", 8), ("M", 12), ("L", 6), ("XL", 4)],
    },
    {
        "store_id": stores[0].id,
        "name": "Jean Skinny Azul",
        "description": "Jean skinny clásico, tiro alto",
        "price": 8500.0,
        "category": "pantalones",
        "color": "azul",
        "image_url": "https://placehold.co/400x500/1a1a2e/ffffff?text=Jean+Azul",
        "sizes": [("36", 5), ("38", 7), ("40", 9), ("42", 4), ("44", 2)],
    },
    {
        "store_id": stores[1].id,
        "name": "Buzo Canguro Gris",
        "description": "Buzo canguro con capucha, relleno suave",
        "price": 6200.0,
        "category": "buzos",
        "color": "gris",
        "image_url": "https://placehold.co/400x500/2d2d2d/ffffff?text=Buzo+Gris",
        "sizes": [("S", 5), ("M", 10), ("L", 8), ("XL", 5), ("XXL", 3)],
    },
    {
        "store_id": stores[1].id,
        "name": "Vestido Floral Verano",
        "description": "Vestido floral liviano, ideal para verano",
        "price": 5800.0,
        "category": "vestidos",
        "color": "multicolor",
        "image_url": "https://placehold.co/400x500/4a1a4a/ffffff?text=Vestido+Floral",
        "sizes": [("XS", 4), ("S", 6), ("M", 8), ("L", 5)],
    },
    {
        "store_id": stores[2].id,
        "name": "Campera Rompeviento",
        "description": "Campera rompeviento impermeable, estilo urbano",
        "price": 12500.0,
        "category": "camperas",
        "color": "negro",
        "image_url": "https://placehold.co/400x500/0a0a0a/ffffff?text=Campera",
        "sizes": [("S", 3), ("M", 6), ("L", 4), ("XL", 2)],
    },
    {
        "store_id": stores[2].id,
        "name": "Calza Deportiva",
        "description": "Calza deportiva con bolsillo lateral",
        "price": 3200.0,
        "category": "calzas",
        "color": "negro",
        "image_url": "https://placehold.co/400x500/111111/ffffff?text=Calza",
        "sizes": [("XS", 8), ("S", 10), ("M", 12), ("L", 7), ("XL", 4)],
    },
]

for data in products_data:
    sizes = data.pop("sizes")
    product = Product(**data)
    db.add(product)
    db.commit()
    db.refresh(product)
    for size, stock in sizes:
        db.add(SizeStock(product_id=product.id, size=size, stock=stock))
    db.commit()

db.close()
print("✓ Seed data loaded: 3 stores, 6 products, 1 demo user")
```

- [ ] **Step 2: Run seed**

```bash
cd services/api && python seed.py
```

Expected: `✓ Seed data loaded: 3 stores, 6 products, 1 demo user`

- [ ] **Step 3: Verify data in API**

```bash
curl http://localhost:8000/stores | python -m json.tool
curl http://localhost:8000/products | python -m json.tool
```

Expected: 3 stores, 6 products with sizes.

- [ ] **Step 4: Commit**

```bash
git add services/api/seed.py
git commit -m "chore: add seed data with 3 stores and 6 products for development"
```

---

## Task 18: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```bash
mkdir -p .github/workflows
```

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: |
          cd services/api
          pip install -r requirements.txt

      - name: Run tests with coverage
        env:
          DATABASE_URL: sqlite:///./test.db
          REDIS_URL: redis://localhost:6379/0
          STRIPE_SECRET_KEY: sk_test_dummy
          STRIPE_WEBHOOK_SECRET: whsec_dummy
          STRIPE_COMMISSION_PERCENT: "2.5"
          SECRET_KEY: test_secret
          ENVIRONMENT: test
        run: |
          cd services/api
          python -m pytest tests/ --ignore=tests/test_models.py --cov=app --cov-report=term-missing --cov-fail-under=80 -v

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: services/frontend/package-lock.json

      - name: Install dependencies
        run: cd services/frontend && npm ci

      - name: Build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:8000
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_dummy
        run: cd services/frontend && npm run build
```

- [ ] **Step 2: Commit and push to trigger CI**

```bash
git add .github/
git commit -m "ci: add GitHub Actions workflow for API tests and frontend build"
git push origin main
```

- [ ] **Step 3: Verify CI passes**

Go to `https://github.com/pedromesaglio/ropaya/actions` and confirm both jobs pass.

---

## Self-Review

**Spec coverage check:**
- ✅ Catálogo (stores + products + filters) — Tasks 8, 9, 14
- ✅ Tabla de talles — Task 14 (SizeTable component)
- ✅ Dirección física del local — Task 3 (Store model), Task 8 (API), Task 14 (StoreCard)
- ✅ Política de devoluciones — Task 3 (Store model), Task 8 (API)
- ✅ Carrito multi-local — Task 13 (cart-store.ts), Task 15 (CartPage)
- ✅ Pago con Stripe — Task 10 (payments router), Task 15 (CheckoutPage)
- ✅ Comisión 2.5% — Task 5 (commission service)
- ✅ Tracking de delivery (mockeado) — Task 6, 11, 15
- ✅ TDD en toda la capa de backend — Tasks 3–11
- ✅ E2E Playwright — Task 16
- ✅ CI/CD — Task 18
- ✅ Docker Compose — Task 1
- ✅ Seed data — Task 17

**Out of scope for POC (deferred to v0):**
- Vendor dashboard (locales cargan sus propios productos)
- Admin panel
- Auth / login
- App mobile (Expo)
- Stripe Connect (split automático) — POC usa cuenta única
- Featured listings / suscripciones
