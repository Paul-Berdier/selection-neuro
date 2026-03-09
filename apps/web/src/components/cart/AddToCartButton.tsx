// apps/web/src/components/cart/AddToCartButton.tsx
"use client";

import { useTransition } from "react";
import { addToCartAction } from "@/app/cart/actions";

export function AddToCartButton({ productId }: { productId: number }) {
  const [pending, start] = useTransition();

  return (
    <button
      className="border rounded px-4 py-2 bg-black text-white"
      disabled={pending}
      onClick={() => start(() => addToCartAction(productId, 1))}
    >
      {pending ? "Ajout..." : "Ajouter au panier"}
    </button>
  );
}