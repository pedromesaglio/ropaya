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
