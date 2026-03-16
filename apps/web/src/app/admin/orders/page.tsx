'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminOrderApi } from '@/services/api'
import type { Order } from '@/types'
import styles from './page.module.css'

const STATUS_OPTS = ['created', 'confirmed', 'shipped', 'delivered', 'canceled', 'refunded']
const PAYMENT_OPTS = ['unpaid', 'paid', 'refunded']
const STATUS_LABEL: Record<string, string> = {
  created: 'Créée', confirmed: 'Confirmée', shipped: 'Expédiée',
  delivered: 'Livrée', canceled: 'Annulée', refunded: 'Remboursée',
}
const PAYMENT_LABEL: Record<string, string> = {
  unpaid: 'Non payée', paid: 'Payée', refunded: 'Remboursée',
}
const STATUS_BADGE: Record<string, string> = {
  created: 'badge-muted', confirmed: 'badge-accent', shipped: 'badge-accent',
  delivered: 'badge-success', canceled: 'badge-error', refunded: 'badge-warning',
}
const PAYMENT_BADGE: Record<string, string> = {
  unpaid: 'badge-warning', paid: 'badge-success', refunded: 'badge-error',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [newPayment, setNewPayment] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 20

  const load = useCallback(() => {
    setLoading(true)
    adminOrderApi.list(limit, offset).then((r: any) => {
      setOrders(r.items || [])
      setTotal(r.total || 0)
      setLoading(false)
    })
  }, [offset])

  useEffect(() => { load() }, [load])

  const selectOrder = (o: Order) => {
    setSelected(o)
    setNewStatus(o.status)
    setNewPayment(o.payment_status)
    setError('')
  }

  const handleUpdate = async () => {
    if (!selected) return
    setUpdating(true)
    setError('')
    try {
      const updated = await adminOrderApi.update(selected.id, {
        status: newStatus !== selected.status ? newStatus : undefined,
        payment_status: newPayment !== selected.payment_status ? newPayment : undefined,
      }) as Order
      setSelected(updated)
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
    } catch (e: any) { setError(e.message) }
    setUpdating(false)
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Commandes</h1>
          <p className={styles.pageSubtitle}>{total} commande{total !== 1 ? 's' : ''} au total</p>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.tableWrap}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client</th>
                  <th>Statut</th>
                  <th>Paiement</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>Chargement…</td></tr>
                ) : orders.map(o => (
                  <tr
                    key={o.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => selectOrder(o)}
                    className={selected?.id === o.id ? styles.rowSelected : ''}
                  >
                    <td style={{ fontWeight: 500, color: 'var(--text)' }}>#{o.id}</td>
                    <td>Client {o.user_id}</td>
                    <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-muted'}`}>{STATUS_LABEL[o.status] || o.status}</span></td>
                    <td><span className={`badge ${PAYMENT_BADGE[o.payment_status] || 'badge-muted'}`}>{PAYMENT_LABEL[o.payment_status] || o.payment_status}</span></td>
                    <td style={{ fontWeight: 500, color: 'var(--text)' }}>€{o.total_amount.toFixed(2)}</td>
                    <td>{o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > limit && (
            <div className={styles.pagination}>
              <button className="btn btn-ghost btn-sm" onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}>
                ← Précédent
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                {offset + 1}–{Math.min(offset + limit, total)} sur {total}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setOffset(offset + limit)} disabled={offset + limit >= total}>
                Suivant →
              </button>
            </div>
          )}
        </div>

        {selected && (
          <div className={`card ${styles.detail} animate-in`}>
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>Commande #{selected.id}</h3>
                <button className={styles.closeBtn} onClick={() => setSelected(null)}>×</button>
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className={styles.detailGrid}>
                <div><span className={styles.detailLabel}>Client ID</span><span>{selected.user_id}</span></div>
                <div><span className={styles.detailLabel}>Devise</span><span>{selected.currency}</span></div>
                <div><span className={styles.detailLabel}>Session Stripe</span><span className={styles.mono}>{selected.stripe_session_id || '—'}</span></div>
                <div><span className={styles.detailLabel}>Payé le</span><span>{selected.paid_at ? new Date(selected.paid_at).toLocaleString('fr-FR') : '—'}</span></div>
              </div>

              <div className="divider" />

              {selected.items?.map(it => (
                <div key={it.id} className={styles.orderItem}>
                  <span style={{ flex: 1, color: 'var(--text)', fontSize: 13 }}>{it.product_name}</span>
                  <span style={{ color: 'var(--text-3)', fontSize: 12 }}>×{it.quantity}</span>
                  <span style={{ fontWeight: 500 }}>€{it.line_total.toFixed(2)}</span>
                </div>
              ))}

              <div className="divider" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className={styles.summaryRow}><span>Sous-total</span><span>€{selected.subtotal_amount?.toFixed(2) ?? '—'}</span></div>
                <div className={styles.summaryRow}><span>Livraison</span><span>€{selected.shipping_amount?.toFixed(2) ?? '—'}</span></div>
                <div className={styles.summaryRow}><span>TVA</span><span>€{selected.tax_amount?.toFixed(2) ?? '—'}</span></div>
                <div className={styles.summaryTotal}><span>Total</span><span>€{selected.grand_total_amount?.toFixed(2) ?? selected.total_amount.toFixed(2)}</span></div>
              </div>

              <div className="divider" />

              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, marginBottom: 8 }}>Modifier la commande</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select className="select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Paiement</label>
                  <select className="select" value={newPayment} onChange={e => setNewPayment(e.target.value)}>
                    {PAYMENT_OPTS.map(s => <option key={s} value={s}>{PAYMENT_LABEL[s] || s}</option>)}
                  </select>
                </div>
              </div>
              {error && <p className="text-error" style={{ fontSize: 13 }}>{error}</p>}
            </div>
            <div className="card-footer">
              <button className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
                {updating ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
