// apps/web/src/app/page.tsx
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { apiGet, apiPost } from "@/lib/api";
import type { Product, Stack } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getHomeData() {
  // API renvoie { items: [...] } chez toi
  const [products, stacks] = await Promise.all([
    apiGet<{ items: Product[] }>("/products"),
    apiGet<{ items: Stack[] }>("/stacks"),
  ]);

  return { products: products.items ?? [], stacks: stacks.items ?? [] };
}

function stripMd(md: string, maxLen = 220) {
  // simple & safe: enlever quelques marqueurs md + couper proprement
  const s = md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen).trimEnd() + "…";
}

export default async function HomePage() {
  const { products, stacks } = await getHomeData();

  return (
    <>
      {/* HERO */}
      <section className="py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight">
              Selection Neuro – Blagnac
            </h1>

            <p className="mt-5 text-lg text-neutral-600">
              Boutique e-commerce : Front Next.js + API FastAPI + Postgres. Stacks & produits,
              panier, commandes, Stripe Checkout.
            </p>

            <div className="mt-8 flex gap-3">
              <Button href="#stacks">Voir les stacks</Button>
              <Button href="#invite" variant="secondary">
                Demander une invitation
              </Button>
            </div>

            <div className="mt-6 text-sm text-neutral-500">
              Données servies par l’API. Seed/import ensuite.
            </div>
          </div>

          <div className="rounded-2xl border bg-neutral-50 p-8">
            <div className="text-sm text-neutral-600">Bloc visuel / preuve</div>
            <div className="mt-4 h-56 rounded-xl bg-white border" />
          </div>
        </div>
      </section>

      {/* STACKS */}
      <Section
        id="stacks"
        title="Stacks"
        subtitle="GET /stacks — chaque stack a sa page dédiée."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {stacks.map((s) => {
            const productCount = s.items?.length ?? 0;
            const subtitle = s.short_desc ?? "";
            const desc = s.description_md ? stripMd(s.description_md, 220) : "";

            return (
              <a key={s.slug} className="no-underline" href={`/stacks/${s.slug}`}>
                <Card className="hover:bg-neutral-50 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold">{s.name}</div>
                    {s.category ? <Badge>{s.category}</Badge> : null}
                  </div>

                  {subtitle ? (
                    <p className="mt-2 text-sm text-neutral-600">{subtitle}</p>
                  ) : (
                    <p className="mt-2 text-sm text-neutral-500">—</p>
                  )}

                  {desc ? (
                    <p className="mt-3 text-sm text-neutral-600 line-clamp-3">{desc}</p>
                  ) : null}

                  <div className="mt-4 text-sm text-neutral-500">
                    {productCount ? `${productCount} produit(s)` : "—"}
                  </div>
                </Card>
              </a>
            );
          })}
        </div>
      </Section>

      {/* PRODUCTS */}
      <Section
        id="products"
        title="Produits"
        subtitle="GET /products — page liste + fiche produit."
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-neutral-600">
            {products.length} produit(s) disponible(s).
          </div>
          <Button href="/products" variant="secondary">
            Voir tout
          </Button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {products.slice(0, 6).map((p) => (
            <a key={p.slug} className="no-underline" href={`/products/${p.slug}`}>
              <Card className="hover:bg-neutral-50 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold">{p.name}</div>
                  {p.category ? <Badge>{p.category}</Badge> : null}
                </div>

                {p.short_desc ? (
                  <p className="mt-2 text-sm text-neutral-600">{p.short_desc}</p>
                ) : (
                  <p className="mt-2 text-sm text-neutral-500">—</p>
                )}

                <div className="mt-4 text-sm text-neutral-500">
                  {p.price_month_eur != null
                    ? `${Number(p.price_month_eur).toFixed(2)}€ / mois`
                    : "—"}
                </div>
              </Card>
            </a>
          ))}
        </div>
      </Section>

      {/* INVITE */}
      <Section id="invite" title="Invitation" subtitle="POST /invite">
        <InviteForm />
      </Section>
    </>
  );
}

function InviteForm() {
  async function action(formData: FormData) {
    "use server";

    const payload = {
      email: String(formData.get("email") || ""),
      name: String(formData.get("name") || ""),
      goal: String(formData.get("goal") || ""),
      message: String(formData.get("message") || ""),
    };

    await apiPost<{ ok: boolean }>("/invite", payload);
  }

  return (
    <form action={action} className="max-w-xl space-y-4 rounded-2xl border p-6">
      <div className="grid gap-3">
        <label className="text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          required
          className="rounded-lg border px-3 py-2"
          placeholder="paul@mail.com"
        />
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-medium">Nom</label>
        <input name="name" className="rounded-lg border px-3 py-2" placeholder="Paul" />
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-medium">Objectif</label>
        <input
          name="goal"
          className="rounded-lg border px-3 py-2"
          placeholder="Focus / Mémoire / Énergie..."
        />
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-medium">Message</label>
        <textarea
          name="message"
          className="rounded-lg border px-3 py-2 min-h-28"
          placeholder="Détails..."
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit">Envoyer</Button>
        <Button href="#stacks" variant="secondary">
          Retour stacks
        </Button>
      </div>
    </form>
  );
}