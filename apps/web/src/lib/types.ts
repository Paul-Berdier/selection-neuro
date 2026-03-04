// apps/web/src/lib/types.ts

export type ApiError = {
  ok: false;
  error?: string;
  detail?: string;
  raw?: any;
};

export type ApiOk<T> = { ok: true } & T;
export type ApiResp<T> = ApiOk<T> | ApiError;

export type Product = {
  id: number;
  slug: string;
  name: string;
  short_desc: string;
  category: string;
  description_md: string;
  price_month_eur: number | null;
  image_media_id: number | null;
  is_active: boolean;
};

/**
 * --- STACKS (public API) ---
 * Aligné avec ton StackOut côté API:
 *   slug, title, subtitle, description, products[]
 */
export type StackProduct = {
  product_slug: string;
  product_name: string;
  product_short_desc: string;
  product_category: string;
  dosage_value: number | null;
  dosage_unit: string;
  note: string;
};

export type Stack = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  products: StackProduct[];
};

export type StackListOut = {
  items: Stack[];
};

export type ProductListResponse = ApiResp<{
  total: number;
  limit: number;
  offset: number;
  items: Product[];
}>;

export type ProductGetResponse = ApiResp<{
  product: Product;
}>;

export type ProductUpsertResponse = ApiResp<{
  product: Product;
  benefits_added?: string[];
  benefits_mode?: "append" | "replace";
}>;

export type ProductDeleteResponse = ApiResp<{
  slug: string;
  is_active: boolean;
}>;

export function getErrorMessage(x: any): string {
  return x?.detail || x?.error || "Unknown error";
}

export function formatApiError(x: any): string {
  if (!x) return "Erreur inconnue";

  // FastAPI / Pydantic: detail peut être string OU array d'objets
  const d = x.detail ?? x.error ?? x.message ?? x;

  if (typeof d === "string") return d;

  if (Array.isArray(d)) {
    // format Pydantic: [{loc, msg, type, ...}, ...]
    return d
      .map((e: any) => {
        const loc = Array.isArray(e?.loc) ? e.loc.join(".") : e?.loc;
        const msg = e?.msg || JSON.stringify(e);
        return loc ? `${loc}: ${msg}` : msg;
      })
      .join("\n");
  }

  if (typeof d === "object") {
    // dernier recours: stringify
    try {
      return JSON.stringify(d);
    } catch {
      return String(d);
    }
  }

  return String(d);
}