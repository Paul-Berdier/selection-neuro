import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { apiGet } from "@/lib/api";
import type { OrderListOut } from "@/lib/types";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const cookieStore = await cookies(); // ✅ Next 15
  const token = cookieStore.get("access_token")?.value;

  if (!token) redirect("/account/login");

  const data = await apiGet<OrderListOut>("/orders");

  return (
    <Section title="Mes commandes" subtitle="Historique de tes achats.">
      <div className="grid gap-4">
        {data.items.length === 0 ? (
          <div className="text-sm text-neutral-600">Aucune commande pour l’instant.</div>
        ) : (
          data.items.map((o) => (
            <Card key={o.id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">Commande #{o.id}</div>
                  <div className="text-sm text-neutral-600">{o.items.length} article(s)</div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    {Number(o.grand_total_amount ?? o.total_amount).toFixed(2)} €
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <Badge>{o.status}</Badge>
                    <Badge>{o.payment_status}</Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}

        <div className="mt-4">
          <Link className="underline" href="/products">
            Retour produits
          </Link>
        </div>
      </div>
    </Section>
  );
}