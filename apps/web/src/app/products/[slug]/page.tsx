// apps/web/src/app/products/[slug]/page.tsx
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Section } from "@/components/Section";
import { Badge } from "@/components/Badge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await apiGet<Product>(`/products/${slug}`);

  return (
    <>
      <Section
        title={p.name}
        subtitle={p.short_desc || "Produit Selection Neuro"}
        actions={
          <div className="flex items-center gap-3">
            <AddToCartButton productId={p.id} />
            <Link className="underline text-sm" href="/products">
              Retour
            </Link>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {p.category ? <Badge>{p.category}</Badge> : null}
          {p.price_month_eur != null ? <Badge>{Number(p.price_month_eur).toFixed(2)} € / mois</Badge> : null}
          {p.stock_qty != null ? <Badge>Stock: {p.stock_qty}</Badge> : null}
        </div>

        {p.description_md ? (
          <pre className="whitespace-pre-wrap rounded border p-4 text-sm">{p.description_md}</pre>
        ) : (
          <div className="text-sm text-neutral-600">Aucune description.</div>
        )}
      </Section>
    </>
  );
}