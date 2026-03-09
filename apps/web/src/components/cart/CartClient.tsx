// apps/web/src/components/cart/CartClient.tsx
"use client";

import { useTransition } from "react";
import type { CartOut } from "@/lib/types";
import { updateCartItemAction, removeCartItemAction, checkoutFromCartAction } from "@/app/cart/actions";

export function CartClient({ cart }: { cart: CartOut }) {
  const [pending, start] = useTransition();

  if (!cart.items?.length) {
    return (
      <div className="border rounded p-6 text-neutral-700">
        Ton panier est vide.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="border rounded">
        <div className="divide-y">
          {cart.items.map((it) => (
            <div key={it.id} className="flex items-center justify-between p-4 gap-4">
              <div className="min-w-0">
                <div className="font-medium truncate">{it.product_name}</div>
                <div className="text-sm text-neutral-600">
                  {it.unit_price.toFixed(2)} € × {it.quantity}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="border rounded px-2 py-1"
                  disabled={pending || it.quantity <= 1}
                  onClick={() => start(() => updateCartItemAction(it.id, it.quantity - 1))}
                >
                  −
                </button>

                <span className="w-8 text-center">{it.quantity}</span>

                <button
                  className="border rounded px-2 py-1"
                  disabled={pending || it.quantity >= 99}
                  onClick={() => start(() => updateCartItemAction(it.id, it.quantity + 1))}
                >
                  +
                </button>

                <button
                  className="border rounded px-3 py-1 text-red-600"
                  disabled={pending}
                  onClick={() => start(() => removeCartItemAction(it.id))}
                >
                  Suppr.
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-600">Sous-total</div>
          <div className="text-xl font-semibold">{cart.subtotal.toFixed(2)} €</div>
        </div>

        <button
          className="border rounded px-4 py-2 bg-black text-white"
          disabled={pending}
          onClick={() => start(() => checkoutFromCartAction())}
        >
          Payer
        </button>
      </div>
    </div>
  );
}