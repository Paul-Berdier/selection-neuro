// apps/web/src/components/cart/CartIndicator.tsx
import { apiGet } from "@/lib/api";
import type { CartOut } from "@/lib/types";
import { cookies } from "next/headers";

export async function CartIndicator() {
  const token = cookies().get("access_token")?.value;
  if (!token) return <span className="text-neutral-500">(0)</span>;

  try {
    const cart = await apiGet<CartOut>("/cart");
    return <span className="text-neutral-500">({cart.total_items ?? 0})</span>;
  } catch {
    return <span className="text-neutral-500">(0)</span>;
  }
}