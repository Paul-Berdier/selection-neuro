// apps/web/src/app/cart/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiGet } from "@/lib/api";
import type { CartOut } from "@/lib/types";
import { Section } from "@/components/Section";
import { CartClient } from "@/components/cart/CartClient";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) redirect("/account/login");

  const cart = await apiGet<CartOut>("/cart");

  return (
    <Section title="Panier" subtitle="Vérifie ton panier puis paie via Stripe.">
      <CartClient cart={cart} />
    </Section>
  );
}