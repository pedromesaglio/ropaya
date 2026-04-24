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
