import { apiGet } from "@/lib/api";
import type { Stack } from "@/lib/types";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

function formatDosage(v?: number | null, unit?: string) {
  if (v == null) return "—";
  const u = unit || "";
  return `${v}${u ? " " + u : ""}`;
}

export default async function StackDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const s = await apiGet<Stack>(`/stacks/${params.slug}`);

  return (
    <>
      <Section title={s.title} subtitle={s.subtitle || ""}>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <p className="text-neutral-700 whitespace-pre-wrap">
                {s.description || "Description à venir."}
              </p>

              <div className="mt-8">
                <div className="text-sm font-medium">Produits inclus</div>
                <div className="mt-4 overflow-hidden rounded-xl border">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Produit</th>
                        <th className="px-4 py-3 text-left font-medium">Dose / jour</th>
                        <th className="px-4 py-3 text-left font-medium">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {s.products.map((sp) => (
                        <tr key={sp.product_slug}>
                          <td className="px-4 py-3">
                            <a
                              className="no-underline hover:underline font-medium"
                              href={`/produits/${sp.product_slug}`}
                            >
                              {sp.product_name}
                            </a>
                            <div className="mt-1">
                              {sp.product_category ? <Badge>{sp.product_category}</Badge> : null}
                            </div>
                            {sp.product_short_desc ? (
                              <div className="mt-2 text-xs text-neutral-600">
                                {sp.product_short_desc}
                              </div>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">{formatDosage(sp.dosage_value, sp.dosage_unit)}</td>
                          <td className="px-4 py-3 text-neutral-600">{sp.note || "—"}</td>
                        </tr>
                      ))}
                      {s.products.length === 0 ? (
                        <tr>
                          <td className="px-4 py-3 text-neutral-600" colSpan={3}>
                            Aucun produit associé (à remplir via seed/import).
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card>
              <div className="text-sm font-medium">Navigation</div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <a className="no-underline hover:underline" href="/#stacks">← Retour landing</a>
                <a className="no-underline hover:underline" href="/produits">Voir tous les produits</a>
                <a className="no-underline hover:underline" href="/#invite">Demander une invitation</a>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}