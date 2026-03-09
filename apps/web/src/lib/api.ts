// src/lib/api.ts
import { cookies } from "next/headers";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function authHeaderFromCookies() {
  const token = cookies().get("access_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Accept": "application/json",
      ...(init.headers || {}),
      ...authHeaderFromCookies(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GET ${path} -> ${res.status} ${txt}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body?: any, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(init.headers || {}),
      ...authHeaderFromCookies(),
    },
    body: body == null ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`POST ${path} -> ${res.status} ${txt}`);
  }
  return res.json();
}

export async function apiPatch<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...authHeaderFromCookies(),
    },
    body: body == null ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`PATCH ${path} -> ${res.status} ${txt}`);
  }
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      ...authHeaderFromCookies(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`DELETE ${path} -> ${res.status} ${txt}`);
  }
  return res.json();
}