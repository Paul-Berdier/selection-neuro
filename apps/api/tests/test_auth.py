from __future__ import annotations

from tests.conftest import auth_headers


def test_register_and_login(client):
    email = "test.user@mail.com"
    password = "Password123!"

    # register
    r = client.post("/auth/register", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["email"] == email
    assert data["is_active"] is True

    # login
    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    tok = r.json()["access_token"]
    assert tok

    # me
    r = client.get("/auth/me", headers=auth_headers(tok))
    assert r.status_code == 200, r.text
    me = r.json()
    assert me["email"] == email