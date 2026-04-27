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
