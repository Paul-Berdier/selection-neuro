from __future__ import annotations

from tests.conftest import admin_headers, auth_headers


def test_cart_to_order_flow(client, admin_token):
    email = "buyer@mail.com"
    password = "Password123!"

    # register + login
    r = client.post("/auth/register", json={"email": email, "password": password})
    assert r.status_code == 200, r.text

    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    h_user = auth_headers(token)

    # create product as admin
    r = client.post(
        "/admin/products",
        headers=admin_headers(admin_token),
        data={
            "name": "Test Product",
            "slug": "test-product",
            "short_desc": "Test",
            "description_md": "Test",
            "category": "test",
            "price_month_eur": "10.00",
            "is_active": "true",
            "benefits": "",
            "benefits_mode": "append",
        },
        files={},
    )
    assert r.status_code == 200, r.text
    product_id = r.json()["product"]["id"]

    # get cart (empty)
    r = client.get("/cart", headers=h_user)
    assert r.status_code == 200, r.text
    assert r.json()["total_items"] == 0

    # add to cart
    r = client.post("/cart/items", headers=h_user, json={"product_id": product_id, "quantity": 2})
    assert r.status_code == 200, r.text
    cart = r.json()
    assert cart["total_items"] == 2
    assert cart["subtotal"] == 20.0

    # create order
    r = client.post("/orders", headers=h_user)
    assert r.status_code == 200, r.text
    order = r.json()
    assert order["total_amount"] == 20.0
    assert len(order["items"]) == 1
    assert order["items"][0]["quantity"] == 2

    # cart should be empty now
    r = client.get("/cart", headers=h_user)
    assert r.status_code == 200, r.text
    assert r.json()["total_items"] == 0

    # list orders
    r = client.get("/orders", headers=h_user)
    assert r.status_code == 200, r.text
    assert len(r.json()["items"]) >= 1


def test_selected_variant_is_kept_from_cart_to_order(client, admin_token):
    email = "variant@mail.com"
    password = "Password123!"

    client.post("/auth/register", json={"email": email, "password": password})
    token = client.post("/auth/login", json={"email": email, "password": password}).json()["access_token"]
    h_user = auth_headers(token)

    r = client.post(
        "/admin/products",
        headers=admin_headers(admin_token),
        data={
            "name": "Variant Product",
            "slug": "variant-product",
            "short_desc": "Variant test",
            "description": "Variant test",
            "category": "test",
            "price_month_eur": "10.00",
            "price_1m": "18.00",
            "qty_g_1m": "90",
            "price_3m": "45.00",
            "qty_g_3m": "270",
            "price_1y": "120.00",
            "qty_g_1y": "1080",
            "is_active": "true",
            "benefits": "",
            "benefits_mode": "append",
        },
        files={},
    )
    assert r.status_code == 200, r.text
    product_id = r.json()["product"]["id"]

    r = client.post(
        "/cart/items",
        headers=h_user,
        json={"product_id": product_id, "quantity": 2, "variant_months": 12},
    )
    assert r.status_code == 200, r.text
    cart = r.json()
    assert cart["subtotal"] == 240.0
    assert cart["items"][0]["variant_label"] == "1 an"
    assert cart["items"][0]["variant_months"] == 12
    assert cart["items"][0]["variant_qty_g"] == 1080.0

    r = client.post("/orders", headers=h_user)
    assert r.status_code == 200, r.text
    order = r.json()
    assert order["subtotal_amount"] == 240.0
    assert order["items"][0]["variant_label"] == "1 an"
    assert order["items"][0]["variant_months"] == 12
    assert order["items"][0]["unit_price"] == 120.0
    assert order["items"][0]["line_total"] == 240.0
