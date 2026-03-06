from __future__ import annotations

from tests.conftest import admin_headers, auth_headers


def test_stock_blocks_cart_and_decrements_on_order(client, admin_token):
    # user
    email = "stock@mail.com"
    password = "Password123!"
    client.post("/auth/register", json={"email": email, "password": password})
    tok = client.post("/auth/login", json={"email": email, "password": password}).json()["access_token"]
    h_user = auth_headers(tok)
    h_admin = admin_headers(admin_token)

    # create product
    r = client.post(
        "/admin/products",
        headers=h_admin,
        data={
            "name": "Stock Prod",
            "slug": "stock-prod",
            "short_desc": "x",
            "description_md": "x",
            "category": "x",
            "price_month_eur": "10.00",
            "is_active": "true",
            "benefits": "",
            "benefits_mode": "append",
        },
        files={},
    )
    assert r.status_code == 200, r.text
    product_id = r.json()["product"]["id"]

    # set stock to 1
    r = client.put(f"/admin/inventory/products/{product_id}", headers=h_admin, json={"stock_qty": 1})
    assert r.status_code == 200, r.text

    # add 2 -> should fail
    client.get("/cart", headers=h_user)
    r = client.post("/cart/items", headers=h_user, json={"product_id": product_id, "quantity": 2})
    assert r.status_code == 400, r.text

    # add 1 -> ok
    r = client.post("/cart/items", headers=h_user, json={"product_id": product_id, "quantity": 1})
    assert r.status_code == 200, r.text

    # create order -> decrements stock
    r = client.post("/orders", headers=h_user)
    assert r.status_code == 200, r.text

    # now stock is 0, cannot add again
    r = client.post("/cart/items", headers=h_user, json={"product_id": product_id, "quantity": 1})
    assert r.status_code == 400