'use client'

import { useState, useEffect, useRef } from 'react'
import RichEditor from '@/components/editor/RichEditor'
import { adminProductApi } from '@/services/api'
import styles from './page.module.css'

interface AdminProduct {
  id: number
  slug: string
  name: string
  short_desc: string
  category: string
  description: string
  price_month_eur: number | null
  image_media_id: number | null
  is_active: boolean
  price_1m?: number | null
  qty_g_1m?: number | null
  price_3m?: number | null
  qty_g_3m?: number | null
  price_1y?: number | null
  qty_g_1y?: number | null
}

function ProductForm({ initial, onSuccess, onCancel }: {
  initial?: AdminProduct
  onSuccess: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name || '')
  const [slug, setSlug] = useState(initial?.slug || '')
  const [shortDesc, setShortDesc] = useState(initial?.short_desc || '')
  const [descMd, setDescMd] = useState(initial?.description || '')
  const [category, setCategory] = useState(initial?.category || '')
  const [price, setPrice] = useState(initial?.price_month_eur?.toString() || '')
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)
  const [price1m, setPrice1m] = useState(initial?.price_1m?.toString() || '')
  const [qtyG1m, setQtyG1m] = useState(initial?.qty_g_1m?.toString() || '')
  const [price3m, setPrice3m] = useState(initial?.price_3m?.toString() || '')
  const [qtyG3m, setQtyG3m] = useState(initial?.qty_g_3m?.toString() || '')
  const [price1y, setPrice1y] = useState(initial?.price_1y?.toString() || '')
  const [qtyG1y, setQtyG1y] = useState(initial?.qty_g_1y?.toString() || '')
  const [benefits, setBenefits] = useState('')
  const [benefitsMode, setBenefitsMode] = useState('replace')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    const fd = new FormData()
    if (!initial) {
      fd.append('name', name)
      if (slug) fd.append('slug', slug)
      fd.append('short_desc', shortDesc)
      fd.append('description', descMd)
      fd.append('category', category)
      if (price) fd.append('price_month_eur', price)
      fd.append('is_active', String(isActive))
      fd.append('benefits', benefits)
      fd.append('benefits_mode', benefitsMode)
      if (image) fd.append('image', image)
      if (price1m) fd.append('price_1m', price1m)
      if (qtyG1m)  fd.append('qty_g_1m', qtyG1m)
      if (price3m) fd.append('price_3m', price3m)
      if (qtyG3m)  fd.append('qty_g_3m', qtyG3m)
      if (price1y) fd.append('price_1y', price1y)
      if (qtyG1y)  fd.append('qty_g_1y', qtyG1y)
    } else {
      if (name !== initial.name) fd.append('name', name)
      if (shortDesc !== initial.short_desc) fd.append('short_desc', shortDesc)
      if (descMd !== initial.description) fd.append('description', descMd)
      if (category !== initial.category) fd.append('category', category)
      if (price) fd.append('price_month_eur', price)
      fd.append('is_active', String(isActive))
      if (benefits) { fd.append('benefits', benefits); fd.append('benefits_mode', benefitsMode) }
      if (image) fd.append('image', image)
      fd.append('price_1m', price1m)
      fd.append('qty_g_1m', qtyG1m)
      fd.append('price_3m', price3m)
      fd.append('qty_g_3m', qtyG3m)
      fd.append('price_1y', price1y)
      fd.append('qty_g_1y', qtyG1y)
    }

    try {
      if (initial) {
        await adminProductApi.update(initial.slug, fd)
      } else {
        await adminProductApi.create(fd)
      }
      onSuccess()
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde')
    }
    setLoading(false)
  }

  return (
    <div className={styles.form}>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Nom *</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Slug {!initial && '(auto si vide)'}</label>
          <input className="input" value={slug} onChange={e => setSlug(e.target.value)} disabled={!!initial} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description courte</label>
        <input className="input" value={shortDesc} onChange={e => setShortDesc(e.target.value)} />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Catégorie</label>
          <input className="input" value={category} onChange={e => setCategory(e.target.value)} placeholder="Sommeil, Focus, Récupération…" />
        </div>
        <div className="form-group">
          <label className="form-label">Prix €/mois</label>
          <input className="input" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="29.90" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <RichEditor
          value={descMd}
          onChange={setDescMd}
          placeholder="Rédigez la description du produit — effets documentés, études scientifiques…"
        />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Bienfaits (séparés par virgule)</label>
          <input className="input" value={benefits} onChange={e => setBenefits(e.target.value)} placeholder="Sommeil amélioré, Relaxation…" />
        </div>
        <div className="form-group">
          <label className="form-label">Mode bienfaits</label>
          <select className="select" value={benefitsMode} onChange={e => setBenefitsMode(e.target.value)}>
            <option value="replace">Remplacer</option>
            <option value="append">Ajouter</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Image</label>
        <input ref={fileRef} type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} style={{ display: 'none' }} />
        <div className={styles.imageUpload}>
          {initial?.image_media_id && !image && (
            <img src={`/api/media/${initial.image_media_id}`} alt="" className={styles.imagePreview} />
          )}
          {image && <span className={styles.imageFilename}>{image.name}</span>}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
            {image || initial?.image_media_id ? 'Changer l\'image' : 'Uploader une image'}
          </button>
        </div>
      </div>
      <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
        <label htmlFor="isActive" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Actif (visible dans la boutique)</label>
      </div>
      {error && <p className="text-error" style={{ fontSize: 13 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onCancel} type="button">Annuler</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !name}>
          {loading ? 'Enregistrement…' : initial ? 'Mettre à jour' : 'Créer le produit'}
        </button>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    adminProductApi.list({ q: search || undefined, limit: 100 }).then((r: any) => {
      setProducts(r.items || [])
      setTotal(r.total || 0)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [search])

  const handleDelete = async (slug: string) => {
    if (!confirm('Désactiver ce produit ?')) return
    setDeleting(slug)
    try { await adminProductApi.softDelete(slug); load() }
    finally { setDeleting(null) }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Produits</h1>
          <p className={styles.pageSubtitle}>{total} produit{total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setCreating(true); setEditing(null) }}>
          + Nouveau produit
        </button>
      </div>

      {creating && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Créer un produit</h3></div>
          <div className="card-body">
            <ProductForm onSuccess={() => { setCreating(false); load() }} onCancel={() => setCreating(false)} />
          </div>
        </div>
      )}

      {editing && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>Modifier : {editing.name}</h3>
              <button className={styles.closeBtn} onClick={() => setEditing(null)}>×</button>
            </div>
          </div>
          <div className="card-body">
            <ProductForm initial={editing} onSuccess={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
        <input
          className={`input ${styles.searchInput}`}
          placeholder="Rechercher un produit…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>Chargement…</td></tr>
            ) : products.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {p.image_media_id ? (
                      <img src={`/api/media/${p.image_media_id}`} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, background: 'var(--bg-3)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-dim)', fontSize: 12, border: '1px solid var(--border)' }}>◆</div>
                    )}
                    <div>
                      <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: 13 }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td>{p.category || '—'}</td>
                <td>{p.price_month_eur != null ? `€${p.price_month_eur.toFixed(2)}/mois` : '—'}</td>
                <td><span className={`badge ${p.is_active ? 'badge-success' : 'badge-muted'}`}>{p.is_active ? 'Actif' : 'Inactif'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(p); setCreating(false) }}>Modifier</button>
                    {p.is_active && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.slug)} disabled={deleting === p.slug}>
                        {deleting === p.slug ? '…' : 'Désactiver'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
