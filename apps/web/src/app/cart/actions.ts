// apps/web/src/app/cart/actions.ts
"use server";

import { redirect } from "next/navigation";
import { apiDelete, apiPatch, apiPost } from "@/lib/api";

export async function addToCartAction(product_id: number, quantity: number = 1) {
  await apiPost("/cart/items", { product_id, quantity });
}

export async function updateCartItemAction(item_id: number, quantity: number) {
  await apiPatch(`/cart/items/${item_id}`, { quantity });
}

export async function removeCartItemAction(item_id: number) {
  await apiDelete(`/cart/items/${item_id}`);
}

export async function checkoutFromCartAction() {
  // 1) créer commande depuis le panier
  const order = await apiPost<{ id: number }>("/orders", {});
  const order_id = (order as any).id;

  // 2) créer session Stripe
  const cs = await apiPost<{ checkout_url: string }>(
    "/payments/stripe/checkout-session",
    { order_id }
  );

  const url = (cs as any).checkout_url;
  if (!url) throw new Error("Stripe checkout_url missing");
  redirect(url);
}