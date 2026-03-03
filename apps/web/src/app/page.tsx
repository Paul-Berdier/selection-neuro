import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { apiGet, apiPost } from "@/lib/api";

type Product = {
  slug: string;
  name: string;
  short_desc: string;
  category: string;
  price_month_eur?: number | null;
};

type Stack = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
};

async function getHomeData() {
  const [products, stacks] = await Promise.all([
    apiGet<{ items: Product[] }>("/products"),
    apiGet<{ items: Stack[] }>("/stacks"),
  ]);
  return { products: products.items, stacks: stacks.items };
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
              Front Next.js propre + API FastAPI + DB Postgres.
            </p>
            <div className="mt-8 flex gap-3">
              <Button href="#stacks">Voir les stacks</Button>
              <Button href="#invite" variant="secondary">
                Demander une invitation
              </Button>
            </div>
            <div className="mt-6 text-sm text-neutral-500">
              Démo: les stacks / produits viennent de l’API.
            </div>
          </div>

          <div className="rounded-2xl border bg-neutral-50 p-8">
            <div className="text-sm text-neutral-600">Bloc image / preuve</div>
            <div className="mt-4 h-56 rounded-xl bg-white border" />
          </div>
        </div>
      </section>

      <Section
        id="stacks"
        title="Stacks"
        subtitle="Récupérés via GET /stacks (API FastAPI)."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {stacks.map((s) => (
            <div key={s.slug} className="rounded-2xl border p-6">
              <div className="font-semibold">{s.title}</div>
              <p className="mt-2 text-sm text-neutral-600">{s.subtitle}</p>
              <p className="mt-3 text-sm text-neutral-600 line-clamp-3">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="produits"
        title="Produits"
        subtitle="Récupérés via GET /products (API FastAPI)."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {products.map((p) => (
            <div key={p.slug} className="rounded-2xl border p-6">
              <div className="font-semibold">{p.name}</div>
              <p className="mt-2 text-sm text-neutral-600">{p.short_desc}</p>
              <div className="mt-4 text-sm text-neutral-500">
                {p.category || "—"}{" "}
                {p.price_month_eur != null ? `· ${p.price_month_eur}€/mois` : ""}
              </div>
            </div>
          ))}
        </div>
      </Section>

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

    // server action: appel API depuis le serveur Next
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
        <input
          name="name"
          className="rounded-lg border px-3 py-2"
          placeholder="Paul"
        />
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