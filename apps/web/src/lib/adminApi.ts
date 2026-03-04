// apps/web/src/lib/adminApi.ts

import {
  ProductDeleteResponse,
  ProductGetResponse,
  ProductListResponse,
  ProductUpsertResponse,
} from "./types";

function toQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function parseJson(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { ok: false, raw: text, error: "Invalid JSON" };
  }
}

export async function adminListProducts(args: {
  q?: string;
  is_active?: "" | "true" | "false";
  limit?: number;
  offset?: number;
}): Promise<ProductListResponse> {
  const qs = toQuery({
    q: args.q,
    is_active: args.is_active,
    limit: args.limit ?? 50,
    offset: args.offset ?? 0,
  });

  const res = await fetch(`/api/admin/products${qs}`, { cache: "no-store" });
  return (await parseJson(res)) as ProductListResponse;
}

export async function adminGetProduct(slug: string): Promise<ProductGetResponse> {
  const res = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, { cache: "no-store" });
  return (await parseJson(res)) as ProductGetResponse;
}

export async function adminCreateProduct(form: FormData): Promise<ProductUpsertResponse> {
  // Normalisation anti-422
  normalizeProductForm(form);

  const res = await fetch(`/api/admin/products`, {
    method: "POST",
    body: form,
  });
  return (await parseJson(res)) as ProductUpsertResponse;
}

export async function adminUpdateProduct(slug: string, form: FormData): Promise<ProductUpsertResponse> {
  normalizeProductForm(form);

  const res = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: form,
  });
  return (await parseJson(res)) as ProductUpsertResponse;
}

export async function adminDisableProduct(slug: string): Promise<ProductDeleteResponse> {
  const res = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  return (await parseJson(res)) as ProductDeleteResponse;
}

/**
 * Normalise les champs "piégeux" qui causent des 422 :
 * - is_active doit être "true" / "false"
 * - price_month_eur doit être nombre ou absent
 * - benefits_mode doit être "append" / "replace"
 */
export function normalizeProductForm(form: FormData) {
  const ia = form.get("is_active");
  if (ia !== null) {
    const v = String(ia).toLowerCase();
    form.set("is_active", v === "true" ? "true" : "false");
  }

  const pm = form.get("price_month_eur");
  if (pm !== null) {
    const raw = String(pm).trim();
    if (!raw) {
      form.delete("price_month_eur");
    } else {
      // autorise "10", "10.5", "10,5"
      const cleaned = raw.replace("€", "").trim().replace(",", ".");
      form.set("price_month_eur", cleaned);
    }
  }

  const bm = form.get("benefits_mode");
  if (bm !== null) {
    const v = String(bm);
    form.set("benefits_mode", v === "replace" ? "replace" : "append");
  }
}