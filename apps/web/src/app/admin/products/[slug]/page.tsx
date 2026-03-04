"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Product = {
  id: number;
  slug: string;
  name: string;
  short_desc: string;
  category: string;
  description_md: string;
  price_month_eur: number | null;
  image_media_id: number | null;
  is_active: boolean;
};

export default function EditProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();

  const [p, setP] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  useEffect(() => {
    (async () => {
      setError("");
      const resp = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, { cache: "no-store" });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        setError(data?.detail || data?.error || "Erreur chargement");
        return;
      }
      setP(data.product);
    })();
  }, [slug]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOkMsg("");

    const form = new FormData(e.currentTarget);

    const resp = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, {
      method: "PUT",
      body: form,
    });

    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      setError(data?.detail || data?.error || "Erreur save");
      return;
    }
    setOkMsg("Sauvegardé ✅");
    setP(data.product);
  }

  async function onDelete() {
    if (!confirm("Désactiver ce produit (soft delete) ?")) return;
    setError("");
    setOkMsg("");

    const resp = await fetch(`/api/admin/products/${encodeURIComponent(slug)}`, { method: "DELETE" });
    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      setError(data?.detail || data?.error || "Erreur delete");
      return;
    }
    router.push("/admin/products");
  }

  if (!p) {
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1>Admin — Éditer</h1>
        {error ? <div style={{ color: "crimson" }}>{error}</div> : <div>Chargement…</div>}
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>Admin — Éditer: {p.name}</h1>
        <button onClick={onDelete} style={{ padding: "8px 12px", fontWeight: 800 }}>
          Désactiver
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: "#ffecec", border: "1px solid #ffb3b3" }}>
          <b>Erreur:</b> {error}
        </div>
      )}
      {okMsg && (
        <div style={{ marginTop: 16, padding: 12, background: "#ecffef", border: "1px solid #b3ffc2" }}>
          {okMsg}
        </div>
      )}

      <form onSubmit={onSave} encType="multipart/form-data" style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          Nom
          <input name="name" defaultValue={p.name} style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Short desc
          <input name="short_desc" defaultValue={p.short_desc} style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Catégorie
          <input name="category" defaultValue={p.category} style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Prix mensuel (€)
          <input
            name="price_month_eur"
            defaultValue={p.price_month_eur ?? ""}
            placeholder="ex: 19.90"
            style={{ width: "100%", padding: 10 }}
          />
        </label>

        <label>
          Actif ?
          <select name="is_active" defaultValue={String(p.is_active)} style={{ width: "100%", padding: 10 }}>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </label>

        <label>
          Benefits (séparés par virgule)
          <input name="benefits" placeholder="🛡Neuroprotection, 🌿Anti-stress" style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Mode benefits
          <select name="benefits_mode" defaultValue="append" style={{ width: "100%", padding: 10 }}>
            <option value="append">Ajouter</option>
            <option value="replace">Remplacer</option>
          </select>
        </label>

        <label>
          Description (Markdown)
          <textarea name="description_md" rows={14} defaultValue={p.description_md} style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Remplacer l’image
          <input type="file" name="image" accept="image/*" />
        </label>

        <button type="submit" style={{ padding: "10px 14px", fontWeight: 800 }}>
          Sauvegarder
        </button>
      </form>
    </main>
  );
}