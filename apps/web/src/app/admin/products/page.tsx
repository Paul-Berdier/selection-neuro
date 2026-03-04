import Link from "next/link";

type Product = {
  id: number;
  slug: string;
  name: string;
  short_desc: string;
  category: string;
  price_month_eur: number | null;
  image_media_id: number | null;
  is_active: boolean;
};

type ApiResp = {
  ok: boolean;
  total?: number;
  limit?: number;
  offset?: number;
  items?: Product[];
  error?: string;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; is_active?: string; limit?: string; offset?: string };
}) {
  const q = searchParams.q ?? "";
  const is_active = searchParams.is_active ?? "";
  const limit = Number(searchParams.limit ?? "50");
  const offset = Number(searchParams.offset ?? "0");

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (is_active) qs.set("is_active", is_active);
  qs.set("limit", String(limit));
  qs.set("offset", String(offset));

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/admin/products?${qs.toString()}`, {
    // NEXT_PUBLIC_APP_URL optionnel; sinon fetch relatif:
    // mais en server component, fetch("/api/...") fonctionne aussi selon config.
    // Pour être robuste, on tente relatif si env absent.
    cache: "no-store",
  }).catch(async () => {
    return fetch(`/api/admin/products?${qs.toString()}`, { cache: "no-store" });
  });

  const data: ApiResp = await res.json();

  const items = data.items ?? [];

  const nextOffset = offset + limit;
  const prevOffset = Math.max(0, offset - limit);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <h1 style={{ margin: 0 }}>Admin — Produits</h1>
        <Link href="/admin/products/new" style={{ fontWeight: 700 }}>
          + Nouveau produit
        </Link>
      </div>

      <form method="get" style={{ display: "grid", gridTemplateColumns: "1fr 180px 120px 120px", gap: 12, marginTop: 16 }}>
        <input name="q" placeholder="Rechercher (slug ou nom)..." defaultValue={q} style={{ padding: 10 }} />

        <select name="is_active" defaultValue={is_active} style={{ padding: 10 }}>
          <option value="">Tous</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>

        <input name="limit" type="number" min={1} max={200} defaultValue={limit} style={{ padding: 10 }} />
        <button type="submit" style={{ padding: 10, fontWeight: 700 }}>
          Filtrer
        </button>
      </form>

      {!data.ok && (
        <div style={{ marginTop: 16, padding: 12, background: "#ffecec", border: "1px solid #ffb3b3" }}>
          <b>Erreur:</b> {data.error ?? "unknown"}
        </div>
      )}

      <div style={{ marginTop: 16, opacity: 0.8 }}>
        Total: <b>{data.total ?? 0}</b> — offset {offset} — limit {limit}
      </div>

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: 10 }}>Nom</th>
              <th style={{ padding: 10 }}>Slug</th>
              <th style={{ padding: 10 }}>Catégorie</th>
              <th style={{ padding: 10 }}>Prix/mois</th>
              <th style={{ padding: 10 }}>Actif</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 10 }}>
                  <b>{p.name}</b>
                  {p.short_desc ? <div style={{ opacity: 0.75 }}>{p.short_desc}</div> : null}
                </td>
                <td style={{ padding: 10, fontFamily: "monospace" }}>{p.slug}</td>
                <td style={{ padding: 10 }}>{p.category}</td>
                <td style={{ padding: 10 }}>{p.price_month_eur ?? "-"}</td>
                <td style={{ padding: 10 }}>{p.is_active ? "✅" : "❌"}</td>
                <td style={{ padding: 10, display: "flex", gap: 10 }}>
                  <Link href={`/admin/products/${p.slug}`}>Éditer</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <Link
          href={`/admin/products?${new URLSearchParams({ q, is_active, limit: String(limit), offset: String(prevOffset) }).toString()}`}
        >
          ← Précédent
        </Link>
        <Link
          href={`/admin/products?${new URLSearchParams({ q, is_active, limit: String(limit), offset: String(nextOffset) }).toString()}`}
        >
          Suivant →
        </Link>
      </div>
    </main>
  );
}