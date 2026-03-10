"use server";

import { cookies } from "next/headers";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();

  // Cookie HttpOnly
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

export function formatApiError(err: unknown): string {
  if (err instanceof Error) return err.message;

  try {
    if (typeof err === "string") return err;
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}