"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { formatApiError } from "@/lib/errors";

function normalizeForm(form: FormData) {
  // is_active
  const ia = form.get("is_active");
  if (ia !== null) {
    form.set("is_active", String(ia).toLowerCase() === "true" ? "true" : "false");
  }

  // price_month_eur
  const pm = form.get("price_month_eur");
  if (pm !== null) {
    const raw = String(pm).trim();
    if (!raw) form.delete("price_month_eur");
    else form.set("price_month_eur", raw.replace("€", "").trim().replace(",", "."));
  }

  // benefits_mode
  const bm = form.get("benefits_mode");
  if (bm !== null) {
    form.set("benefits_mode", String(bm) === "replace" ? "replace" : "append");
  }

  // ✅ image: ne l'envoyer que si c'est un vrai File non vide
  const img = form.get("image");
  if (!(img instanceof File) || img.size === 0) {
    form.delete("image");
  }
}

export default function EditProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();

  const [p, setP] = useState<Product | null>(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    setOk("");

    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErr(formatApiError(data));
        setLoading(false);
        return;
      }
      setP(data.product);
    } catch (e: any) {
      setErr(e?.message || "fetch failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!slug) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setOk("");

    const form = new FormData(e.currentTarget);
    normalizeForm(form);

    const res = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, {
      method: "PUT",
      body: form,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      setErr(formatApiError(data));
      return;
    }

    setP(data.product);
    setOk("Sauvegardé ✅");
  }

  async function onDisable() {
    if (!confirm("Désactiver ce produit ?")) return;
    setErr("");
    setOk("");

    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setErr(formatApiError(data));
        return;
      }

      router.push("/admin/products");
    } catch (e: any) {
      setErr(e?.message || "fetch failed");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin — Éditer produit</h1>
          <div className="mt-1 text-sm text-zinc-600">
            <Link className="underline" href="/admin/products">
              ← Retour liste
            </Link>
          </div>
        </div>

        <button onClick={onDisable} className="rounded-md border border-zinc-300 bg-white px-4 py-2 font-semibold">
          Désactiver
        </button>
      </div>

      {err ? (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 whitespace-pre-wrap">
          <b>Erreur:</b> {err}
        </div>
      ) : null}

      {ok ? (
        <div className="mt-4 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">
          {ok}
        </div>
      ) : null}

      {loading ? <div className="mt-4 text-sm text-zinc-600">Chargement…</div> : null}

      {!p && !loading ? (
        <div className="mt-6 text-zinc-600">Produit introuvable.</div>
      ) : p ? (
        <form onSubmit={onSave} encType="multipart/form-data" className="mt-6 grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Nom</span>
            <input name="name" defaultValue={p.name} className="rounded-md border border-zinc-300 bg-white px-3 py-2" />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Short desc</span>
            <input
              name="short_desc"
              defaultValue={p.short_desc}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Catégorie</span>
            <input
              name="category"
              defaultValue={p.category}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Prix mensuel (€)</span>
            <input
              name="price_month_eur"
              defaultValue={p.price_month_eur ?? ""}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Actif ?</span>
            <select
              name="is_active"
              defaultValue={String(p.is_active)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2"
            >
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Benefits (virgules)</span>
            <input
              name="benefits"
              placeholder="🛡Neuroprotection, 🌿Anti-stress"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Mode benefits</span>
            <select
              name="benefits_mode"
              defaultValue="append"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2"
            >
              <option value="append">Ajouter</option>
              <option value="replace">Remplacer</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Description (Markdown)</span>
            <textarea
              name="description_md"
              rows={12}
              defaultValue={p.description_md}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Remplacer l’image</span>
            <input name="image" type="file" accept="image/*" className="block" />
            <span className="text-xs text-zinc-500">
              image_media_id actuel : <b>{p.image_media_id ?? "—"}</b>
            </span>
          </label>

          <button className="rounded-md bg-zinc-900 px-4 py-2 text-white font-semibold hover:bg-zinc-800">
            Sauvegarder
          </button>

          <div className="text-sm text-zinc-600">
            Slug : <code className="font-mono">{p.slug}</code>
          </div>
        </form>
      ) : null}
    </main>
  );
}