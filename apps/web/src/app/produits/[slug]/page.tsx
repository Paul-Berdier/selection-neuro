import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

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
      <Section title={p.name} subtitle={p.short_desc || "—"}>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <div className="flex items-center gap-3">
                {p.category ? <Badge>{p.category}</Badge> : null}
                {p.price_month_eur != null ? (
                  <span className="text-sm text-neutral-600">
                    {p.price_month_eur}€ / mois
                  </span>
                ) : null}
              </div>

              <div className="mt-5 max-w-none">
                <p className="text-neutral-700 whitespace-pre-wrap">
                  {p.description_md || "Description à venir."}
                </p>
              </div>
            </Card>
          </div>

          <div>
            <Card>
              <div className="text-sm font-medium">Navigation</div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <Link className="no-underline hover:underline" href="/produits">
                  ← Retour produits
                </Link>
                <Link className="no-underline hover:underline" href="/#invite">
                  Demander une invitation
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}