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
