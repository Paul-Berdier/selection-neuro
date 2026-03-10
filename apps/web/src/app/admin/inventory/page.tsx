'use client'

import { useState, useEffect } from 'react'
import { adminProductApi, adminInventoryApi } from '@/services/api'
import styles from './page.module.css'

interface AdminProduct {
  id: number
  slug: string
  name: string
  category: string
  stock_qty: number | null
  is_active: boolean
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const [error, setError] = useState<Record<number, string>>({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminProductApi.list({ limit: 200 }).then((r: any) => {
      setProducts(r.items || [])
      setLoading(false)
    })
  }, [])

  const startEdit = (p: AdminProduct) => {
    setEditing(prev => ({ ...prev, [p.id]: p.stock_qty == null ? '' : String(p.stock_qty) }))
  }

  const handleSave = async (p: AdminProduct) => {
    const val = editing[p.id]
    const qty = val === '' ? null : parseInt(val)
    if (val !== '' && (isNaN(qty!) || qty! < 0)) {
      setError(prev => ({ ...prev, [p.id]: 'Invalid quantity' }))
      return
    }
    setSaving(p.id)
    setError(prev => ({ ...prev, [p.id]: '' }))
    try {
      await adminInventoryApi.setStock(p.id, qty)
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, stock_qty: qty } : x))
      setSaved(p.id)
      setTimeout(() => setSaved(null), 1500)
      setEditing(prev => { const n = { ...prev }; delete n[p.id]; return n })
    } catch (e: any) {
      setError(prev => ({ ...prev, [p.id]: e.message }))
    }
    setSaving(null)
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Inventory</h1>
          <p className={styles.pageSubtitle}>Manage stock levels</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={`input ${styles.searchInput}`}
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.stats}>
          <span className={styles.stat}>
            <span className="badge badge-error">{products.filter(p => p.stock_qty === 0).length}</span>
            Out of stock
          </span>
          <span className={styles.stat}>
            <span className="badge badge-warning">{products.filter(p => p.stock_qty !== null && p.stock_qty > 0 && p.stock_qty <= 5).length}</span>
            Low stock (≤5)
          </span>
          <span className={styles.stat}>
            <span className="badge badge-muted">{products.filter(p => p.stock_qty === null).length}</span>
            Unlimited
          </span>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Status</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>Loading…</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div>
                    <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: 13 }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>{p.slug}</p>
                  </div>
                </td>
                <td>{p.category || '—'}</td>
                <td>
                  <span className={`badge ${p.is_active ? 'badge-success' : 'badge-muted'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {editing[p.id] !== undefined ? (
                    <div className={styles.editQty}>
                      <input
                        className={`input ${styles.qtyInput}`}
                        type="number"
                        min="0"
                        value={editing[p.id]}
                        onChange={e => setEditing(prev => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="∞"
                        onKeyDown={e => e.key === 'Enter' && handleSave(p)}
                        autoFocus
                      />
                      {error[p.id] && <span className="text-error" style={{ fontSize: 11 }}>{error[p.id]}</span>}
                    </div>
                  ) : (
                    <span className={`${styles.stockValue} ${p.stock_qty === 0 ? styles.stockOut : p.stock_qty !== null && p.stock_qty <= 5 ? styles.stockLow : ''}`}>
                      {p.stock_qty === null ? <span style={{ color: 'var(--text-3)' }}>∞ Unlimited</span> : p.stock_qty}
                    </span>
                  )}
                </td>
                <td>
                  {editing[p.id] !== undefined ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleSave(p)} disabled={saving === p.id}>
                        {saving === p.id ? '…' : saved === p.id ? '✓' : 'Save'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(prev => { const n = { ...prev }; delete n[p.id]; return n })}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
