"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Product, getErrorMessage, formatApiError } from "@/lib/types";

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
  const [isActive, setIsActive] = useState<"" | "true" | "false">("");
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

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
    setErr("");
    try {
      const res = await fetch(`/api/admin/products?${qs}`, { cache: "no-store" });
      const data: ApiResp = await res.json();
      if (!res.ok || !data.ok) {
        setErr(formatApiError(data));
        setLoading(false);
        return;
      }
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setErr(e?.message || "fetch failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  const prevOffset = Math.max(0, offset - limit);
  const nextOffset = offset + limit;

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin — Produits</h1>
          <div className="text-sm text-zinc-600">Gestion des produits (proxy sécurisé via /api/admin/*)</div>
        </div>
        <Link href="/admin/products/new" className="rounded-md bg-zinc-900 px-4 py-2 text-white font-semibold">
          + Nouveau
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Recherche</span>
          <input
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            placeholder="slug ou nom"
            value={q}
            onChange={(e) => {
              setOffset(0);
              setQ(e.target.value);
            }}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Statut</span>
          <select
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            value={isActive}
            onChange={(e) => {
              setOffset(0);
              setIsActive(e.target.value as any);
            }}
          >
            <option value="">Tous</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Limit</span>
          <input
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            type="number"
            min={1}
            max={200}
            value={String(limit)}
            onChange={(e) => {
              setOffset(0);
              setLimit(Number(e.target.value || 50));
            }}
          />
        </label>

        <button
          onClick={() => void load()}
          className="mt-6 rounded-md border border-zinc-300 bg-white px-4 py-2 font-semibold hover:bg-zinc-50"
        >
          {loading ? "…" : "Rafraîchir"}
        </button>
      </div>

      {err ? (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          <b>Erreur:</b> {err}
        </div>
      ) : null}

      <div className="mt-4 text-sm text-zinc-600">
        Total: <b>{total}</b> — offset {offset} — limit {limit}
      </div>

      <div className="mt-3 overflow-x-auto rounded-md border border-zinc-200 bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Prix/mois</th>
              <th className="px-4 py-3">Actif</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-zinc-100">
                <td className="px-4 py-3">
                  <div className="font-semibold">{p.name}</div>
                  {p.short_desc ? <div className="text-zinc-500">{p.short_desc}</div> : null}
                </td>
                <td className="px-4 py-3 font-mono">{p.slug}</td>
                <td className="px-4 py-3">{p.category || "-"}</td>
                <td className="px-4 py-3">{p.price_month_eur ?? "-"}</td>
                <td className="px-4 py-3">{p.is_active ? "✅" : "❌"}</td>
                <td className="px-4 py-3">
                  <Link className="underline" href={`/admin/products/${p.slug}`}>
                    Éditer
                  </Link>
                </td>
              </tr>
            ))}

            {!items.length && !loading ? (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={6}>
                  Aucun produit.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          disabled={offset === 0}
          onClick={() => setOffset(prevOffset)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 disabled:opacity-50"
        >
          ← Précédent
        </button>
        <button
          disabled={nextOffset >= total}
          onClick={() => setOffset(nextOffset)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 disabled:opacity-50"
        >
          Suivant →
        </button>
      </div>
    </main>
  );
}