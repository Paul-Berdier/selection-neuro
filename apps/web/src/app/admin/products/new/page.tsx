"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [okMsg, setOkMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOkMsg("");

    const form = new FormData(e.currentTarget);

    const resp = await fetch("/api/admin/products", {
      method: "POST",
      body: form,
    });

    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      setError(data?.detail || data?.error || "Erreur inconnue");
      return;
    }

    setOkMsg("Produit créé / mis à jour ✅");
    router.push(`/admin/products/${data.product.slug}`);
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Admin — Nouveau produit</h1>

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

      <form onSubmit={onSubmit} encType="multipart/form-data" style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          Nom *
          <input name="name" required style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Slug (optionnel)
          <input name="slug" placeholder="auto si vide" style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Short desc
          <input name="short_desc" style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Catégorie
          <input name="category" style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Prix mensuel (€)
          <input name="price_month_eur" placeholder="ex: 19.90" style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Actif ?
          <select name="is_active" defaultValue="true" style={{ width: "100%", padding: 10 }}>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </label>

        <label>
          Benefits (séparés par virgule)
          <input
            name="benefits"
            placeholder="⚡Attention & réactivité mentale, 🧬Plasticité et neurogenèse"
            style={{ width: "100%", padding: 10 }}
          />
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
          <textarea name="description_md" rows={14} style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Image
          <input type="file" name="image" accept="image/*" />
        </label>

        <button type="submit" style={{ padding: "10px 14px", fontWeight: 800 }}>
          Créer / Mettre à jour
        </button>
      </form>
    </main>
  );
}