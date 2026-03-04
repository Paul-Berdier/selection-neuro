"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  detail?: string;
};

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [isActive, setIsActive] = useState<string>(""); // "" | "true" | "false"
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const [data, setData] = useState<ApiResp>({ ok: true, items: [], total: 0, limit: 50, offset: 0 });
  const [loading, setLoading] = useState(false);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (isActive) p.set("is_active", isActive);
    p.set("limit", String(limit));
    p.set("offset", String(offset));
    return p.toString();
  }, [q, isActive, limit, offset]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?${qs}`, { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setData({ ok: false, error: e?.message || "fetch failed" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  const items = data.items ?? [];
  const total = data.total ?? 0;

  const prevOffset = Math.max(0, offset - limit);
  const nextOffset = offset + limit;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <h1 style={{ margin: 0 }}>Admin — Produits</h1>
        <Link href="/admin/products/new" style={{ fontWeight: 800 }}>
          + Nouveau produit
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 120px 120px", gap: 12, marginTop: 16 }}>
        <input
          placeholder="Rechercher (slug ou nom)…"
          value={q}
          onChange={(e) => {
            setOffset(0);
            setQ(e.target.value);
          }}
          style={{ padding: 10 }}
        />

        <select
          value={isActive}
          onChange={(e) => {
            setOffset(0);
            setIsActive(e.target.value);
          }}
          style={{ padding: 10 }}
        >
          <option value="">Tous</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>

        <input
          type="number"
          min={1}
          max={200}
          value={limit}
          onChange={(e) => {
            setOffset(0);
            setLimit(Number(e.target.value || 50));
          }}
          style={{ padding: 10 }}
        />

        <button onClick={() => void load()} style={{ padding: 10, fontWeight: 800 }}>
          {loading ? "…" : "Rafraîchir"}
        </button>
      </div>

      {!data.ok && (
        <div style={{ marginTop: 16, padding: 12, background: "#ffecec", border: "1px solid #ffb3b3" }}>
          <b>Erreur:</b> {data.detail ?? data.error ?? "unknown"}
        </div>
      )}

      <div style={{ marginTop: 16, opacity: 0.8 }}>
        Total: <b>{total}</b> — offset {offset} — limit {limit}
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
                <td style={{ padding: 10 }}>
                  <Link href={`/admin/products/${p.slug}`}>Éditer</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button disabled={offset === 0} onClick={() => setOffset(prevOffset)} style={{ padding: "8px 12px" }}>
          ← Précédent
        </button>
        <button disabled={nextOffset >= total} onClick={() => setOffset(nextOffset)} style={{ padding: "8px 12px" }}>
          Suivant →
        </button>
      </div>
    </main>
  );
}