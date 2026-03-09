// apps/web/src/app/account/actions.ts
"use server";

import { cookies } from "next/headers";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function readError(res: Response) {
  const txt = await res.text().catch(() => "");
  return txt || res.statusText;
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();

  cookies().set("access_token", data.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return { ok: true };
}

export async function logoutAction() {
  cookies().delete("access_token");
  return { ok: true };
}