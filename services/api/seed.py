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
