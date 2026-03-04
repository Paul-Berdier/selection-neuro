"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function normalizeForm(form: FormData) {
  // is_active
  const ia = form.get("is_active");
  if (ia !== null) form.set("is_active", String(ia).toLowerCase() === "true" ? "true" : "false");

  // price
  const pm = form.get("price_month_eur");
  if (pm !== null) {
    const raw = String(pm).trim();
    if (!raw) form.delete("price_month_eur");
    else form.set("price_month_eur", raw.replace("€", "").trim().replace(",", "."));
  }

  // benefits_mode
  const bm = form.get("benefits_mode");
  if (bm !== null) form.set("benefits_mode", String(bm) === "replace" ? "replace" : "append");
}

export default function NewProductPage() {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setOk("");

    const form = new FormData(e.currentTarget);
    normalizeForm(form);

    const res = await fetch("/api/admin/products", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      setErr(data?.detail || data?.error || "Erreur création");
      return;
    }

    setOk("Produit créé ✅");
    router.push(`/admin/products/${data.product.slug}`);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-6">
      <h1 className="text-2xl font-bold">Admin — Nouveau produit</h1>

      {err ? (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          <b>Erreur:</b> {err}
        </div>
      ) : null}

      {ok ? (
        <div className="mt-4 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">
          {ok}
        </div>
      ) : null}

      <form onSubmit={onSubmit} encType="multipart/form-data" className="mt-6 grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Nom *</span>
          <input name="name" required className="rounded-md border border-zinc-300 bg-white px-3 py-2" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Slug (optionnel)</span>
          <input name="slug" className="rounded-md border border-zinc-300 bg-white px-3 py-2" placeholder="auto si vide" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Short desc</span>
          <input name="short_desc" className="rounded-md border border-zinc-300 bg-white px-3 py-2" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Catégorie</span>
          <input name="category" className="rounded-md border border-zinc-300 bg-white px-3 py-2" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Prix mensuel (€)</span>
          <input name="price_month_eur" className="rounded-md border border-zinc-300 bg-white px-3 py-2" placeholder="19.90" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Actif ?</span>
          <select name="is_active" defaultValue="true" className="rounded-md border border-zinc-300 bg-white px-3 py-2">
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Benefits (virgules)</span>
          <input name="benefits" className="rounded-md border border-zinc-300 bg-white px-3 py-2" placeholder="🛡Neuroprotection, 🌿Anti-stress" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Mode benefits</span>
          <select name="benefits_mode" defaultValue="append" className="rounded-md border border-zinc-300 bg-white px-3 py-2">
            <option value="append">Ajouter</option>
            <option value="replace">Remplacer</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Description (Markdown)</span>
          <textarea name="description_md" rows={12} className="rounded-md border border-zinc-300 bg-white px-3 py-2" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Image</span>
          <input name="image" type="file" accept="image/*" className="block" />
        </label>

        <button className="rounded-md bg-zinc-900 px-4 py-2 text-white font-semibold hover:bg-zinc-800">
          Créer / Upsert
        </button>
      </form>
    </main>
  );
}