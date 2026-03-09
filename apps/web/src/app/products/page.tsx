import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const data = await apiGet<{ items: Product[] }>("/products");
  const items = data.items;

  return (
    <>
      <Section title="Produits" subtitle="Liste complète (GET /products).">
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((p) => (
            <Link key={p.slug} href={`/produits/${p.slug}`} className="no-underline">
              <Card className="hover:bg-neutral-50 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold">{p.name}</div>
                  {p.category ? <Badge>{p.category}</Badge> : null}
                </div>

                {p.short_desc ? (
                  <p className="mt-2 text-sm text-neutral-600">{p.short_desc}</p>
                ) : null}

                <div className="mt-4 text-sm text-neutral-500">
                  {p.price_month_eur != null ? `${p.price_month_eur}€ / mois` : "—"}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}