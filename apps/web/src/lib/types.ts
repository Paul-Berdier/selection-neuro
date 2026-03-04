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