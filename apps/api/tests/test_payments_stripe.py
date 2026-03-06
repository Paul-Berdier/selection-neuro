from __future__ import annotations

from tests.conftest import admin_headers, auth_headers


def test_stripe_checkout_session_mock(client, admin_token):
    # user
    email = "buyer2@mail.com"
    password = "Password123!"
    client.post("/auth/register", json={"email": email, "password": password})
    r = client.post("/auth/login", json={"email": email, "password": password})
    token = r.json()["access_token"]
    h_user = auth_headers(token)

    # product admin
    r = client.post(
        "/admin/products",
        headers=admin_headers(admin_token),
        data={
            "name": "Test Product",
            "slug": "test-product-2",
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
    product_id = r.json()["product"]["id"]

    # cart + order
    client.get("/cart", headers=h_user)
    client.post("/cart/items", headers=h_user, json={"product_id": product_id, "quantity": 1})
    order = client.post("/orders", headers=h_user).json()
    order_id = order["id"]

    # checkout session (mock)
    r = client.post("/payments/stripe/checkout-session", headers=h_user, json={"order_id": order_id})
    assert r.status_code == 200, r.text
    out = r.json()
    assert out["ok"] is True
    assert out["order_id"] == order_id
    assert out["session_id"].startswith("cs_test_mock_")
    assert "checkout_url" in out