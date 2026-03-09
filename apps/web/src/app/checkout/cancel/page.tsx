// apps/web/src/app/checkout/cancel/page.tsx
import Link from "next/link";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";

export default function CheckoutCancelPage() {
  return (
    <Section title="Paiement annulé" subtitle="Aucun débit n’a été effectué.">
      <div className="border rounded p-6 grid gap-3">
        <div className="text-sm text-neutral-700">
          Tu peux revenir au panier et réessayer.
        </div>
        <div className="flex gap-4">
          <Link className="underline" href="/cart">Retour au panier</Link>
          <Link className="underline" href="/products">Voir les produits</Link>
        </div>
      </div>
    </Section>
  );
}