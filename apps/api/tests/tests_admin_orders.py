from __future__ import annotations

from tests.conftest import admin_headers, auth_headers


def test_admin_order_status_transitions_and_restock(client, admin_token):
    h_admin = admin_headers(admin_token)

    # user + login
    email = "adminorders@mail.com"
    password = "Password123!"
    client.post("/auth/register", json={"email": email, "password": password})
    tok = client.post("/auth/login", json={"email": email, "password": password}).json()["access_token"]
    h_user = auth_headers(tok)

    # create product
    r = client.post(
        "/admin/products",
        headers=h_admin,
        data={
            "name": "Admin Orders Prod",
            "slug": "admin-orders-prod",
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
    product_id = r.json()["product"]["id"]

    # set stock to 1
    client.put(f"/admin/inventory/products/{product_id}", headers=h_admin, json={"stock_qty": 1})

    # cart + order (decrements stock to 0)
    client.get("/cart", headers=h_user)
    client.post("/cart/items", headers=h_user, json={"product_id": product_id, "quantity": 1})
    order = client.post("/orders", headers=h_user).json()
    order_id = order["id"]

    # admin list orders
    r = client.get("/admin/orders", headers=h_admin)
    assert r.status_code == 200, r.text
    assert r.json()["total"] >= 1

    # cancel order -> restock -> stock becomes 1 again => can add to cart
    r = client.patch(f"/admin/orders/{order_id}", headers=h_admin, json={"status": "canceled"})
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "canceled"

    # now user can add again
    r = client.post("/cart/items", headers=h_user, json={"product_id": product_id, "quantity": 1})
    assert r.status_code == 200, r.text