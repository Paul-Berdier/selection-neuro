from __future__ import annotations

from tests.conftest import auth_headers, admin_headers


def test_addresses_and_attach_to_order(client, admin_token):
    # create user + login
    email = "addr@mail.com"
    password = "Password123!"
    client.post("/auth/register", json={"email": email, "password": password})
    tok = client.post("/auth/login", json={"email": email, "password": password}).json()["access_token"]
    h = auth_headers(tok)

    # create address
    addr = client.post(
        "/addresses",
        headers=h,
        json={
            "label": "Home",
            "full_name": "Paul Berdier",
            "line1": "1 rue de test",
            "line2": "",
            "city": "Toulouse",
            "postal_code": "31000",
            "country": "FR",
            "phone": "0600000000",
        },
    )
    assert addr.status_code == 200, addr.text
    address_id = addr.json()["id"]

    # admin create product
    r = client.post(
        "/admin/products",
        headers=admin_headers(admin_token),
        data={
            "name": "Prod Addr",
            "slug": "prod-addr",
            "price_month_eur": "10.00",
            "is_active": "true",
            "short_desc": "x",
            "description_md": "x",
            "category": "x",
            "benefits": "",
            "benefits_mode": "append",
        },
        files={},
    )
    product_id = r.json()["product"]["id"]

    # cart -> order
    client.get("/cart", headers=h)
    client.post("/cart/items", headers=h, json={"product_id": product_id, "quantity": 1})
    order = client.post("/orders", headers=h).json()
    order_id = order["id"]

    # attach addresses
    r = client.put(
        f"/orders/{order_id}/addresses",
        headers=h,
        json={"shipping_address_id": address_id},
    )
    assert r.status_code == 200, r.text