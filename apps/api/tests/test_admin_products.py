from __future__ import annotations

from tests.conftest import admin_headers


def test_admin_create_and_get_product(client, admin_token):
    headers = admin_headers(admin_token)

    # admin create product uses multipart/form-data (Form)
    r = client.post(
        "/admin/products",
        headers=headers,
        data={
            "name": "Creatine Monohydrate",
            "slug": "creatine-monohydrate",
            "short_desc": "Test",
            "description_md": "## Test",
            "category": "performance",
            "price_month_eur": "19.90",
            "is_active": "true",
            "benefits": "force,performance",
            "benefits_mode": "append",
        },
        files={},  # no image
    )
    assert r.status_code == 200, r.text
    out = r.json()
    assert out["ok"] is True
    assert out["product"]["slug"] == "creatine-monohydrate"

    # admin get
    r = client.get("/admin/products/creatine-monohydrate", headers=headers)
    assert r.status_code == 200, r.text
    p = r.json()["product"]
    assert p["name"] == "Creatine Monohydrate"