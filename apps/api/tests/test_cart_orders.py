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