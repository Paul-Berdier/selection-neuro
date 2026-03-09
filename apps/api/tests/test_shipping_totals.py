from __future__ import annotations

from tests.conftest import admin_headers, auth_headers


def test_shipping_rates_and_totals_recompute(client, admin_token):
    h_admin = admin_headers(admin_token)

    # user
    email = "ship@mail.com"
    password = "Password123!"
    client.post("/auth/register", json={"email": email, "password": password})
    tok = client.post("/auth/login", json={"email": email, "password": password}).json()["access_token"]
    h_user = auth_headers(tok)

    # address
    addr = client.post(
        "/addresses",
        headers=h_user,
        json={
            "label": "Home",
            "full_name": "Paul Berdier",
            "line1": "1 rue test",
            "line2": "",
            "city": "Toulouse",
            "postal_code": "31000",
            "country": "FR",
            "phone": "0600000000",
        },
    ).json()
    address_id = addr["id"]

    # rates
    r = client.get(f"/shipping/rates?address_id={address_id}", headers=h_user)
    assert r.status_code == 200, r.text
    assert len(r.json()["items"]) >= 1

    # product
    r = client.post(
        "/admin/products",
        headers=h_admin,
        data={
            "name": "Ship Prod",
            "slug": "ship-prod",
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
    pid = r.json()["product"]["id"]

    # cart -> order
    client.get("/cart", headers=h_user)
    client.post("/cart/items", headers=h_user, json={"product_id": pid, "quantity": 1})
    order = client.post("/orders", headers=h_user).json()
    oid = order["id"]

    # attach shipping address triggers recompute
    r = client.put(f"/orders/{oid}/addresses", headers=h_user, json={"shipping_address_id": address_id})
    assert r.status_code == 200, r.text

    # choose express and recompute again
    r = client.put(f"/orders/{oid}/shipping", headers=h_user, json={"shipping_method": "express"})
    assert r.status_code == 200, r.text