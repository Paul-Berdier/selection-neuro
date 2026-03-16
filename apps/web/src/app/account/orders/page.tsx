'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { orderApi } from '@/services/api'
import type { Order } from '@/types'
import styles from './page.module.css'

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)

  useEffect(() => {
    orderApi.list().then((r: any) => { setOrders(r.items || []); setLoading(false) })
  }, [])

  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <h1 className="page-title" style={{ marginBottom: 8 }}>Mes commandes</h1>
      <p className="page-subtitle" style={{ marginBottom: 40 }}>Suivez et gérez vos commandes</p>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 4 }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 10h8M8 14h5"/>
          </svg>
          <p>Aucune commande pour l&apos;instant</p>
          <Link href="/products" className="btn btn-primary">Parcourir le catalogue</Link>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.orderList}>
            {orders.map(o => (
              <button
                key={o.id}
                className={`${styles.orderRow} ${selected?.id === o.id ? styles.orderRowActive : ''}`}
                onClick={() => setSelected(selected?.id === o.id ? null : o)}
              >
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>Commande #{o.id}</span>
                  <span className={styles.orderDate}>{o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '—'}</span>
                </div>
                <div className={styles.orderBadges}>
                  <span className={`badge ${STATUS_BADGE[o.status] || 'badge-muted'}`}>{STATUS_LABEL[o.status] || o.status}</span>
                  <span className={`badge ${PAYMENT_BADGE[o.payment_status] || 'badge-muted'}`}>{PAYMENT_LABEL[o.payment_status] || o.payment_status}</span>
                </div>
                <span className={styles.orderAmount}>€{o.total_amount.toFixed(2)}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-3)', transform: selected?.id === o.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            ))}
          </div>

          {selected && (
            <div className={`card ${styles.orderDetail} animate-in`}>
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>Commande #{selected.id}</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className={`badge ${STATUS_BADGE[selected.status] || 'badge-muted'}`}>{STATUS_LABEL[selected.status] || selected.status}</span>
                    <span className={`badge ${PAYMENT_BADGE[selected.payment_status] || 'badge-muted'}`}>{PAYMENT_LABEL[selected.payment_status] || selected.payment_status}</span>
                  </div>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selected.items.map(it => (
                  <div key={it.id} className={styles.detailItem}>
                    <div>
                      <p style={{ color: 'var(--text)', fontSize: 14 }}>{it.product_name}</p>
                      <p style={{ color: 'var(--text-3)', fontSize: 12 }}>€{it.unit_price.toFixed(2)} × {it.quantity}</p>
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>€{it.line_total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="divider" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className={styles.summaryRow}><span>Sous-total</span><span>€{selected.subtotal_amount?.toFixed(2) ?? '—'}</span></div>
                  <div className={styles.summaryRow}><span>Livraison</span><span>€{selected.shipping_amount?.toFixed(2) ?? '—'}</span></div>
                  <div className={styles.summaryRow}><span>TVA</span><span>€{selected.tax_amount?.toFixed(2) ?? '—'}</span></div>
                  <div className={styles.summaryTotal}><span>Total</span><span>€{selected.grand_total_amount?.toFixed(2) ?? selected.total_amount.toFixed(2)}</span></div>
                </div>
                {selected.payment_status === 'unpaid' && selected.status === 'created' && (
                  <Link href={`/checkout?order_id=${selected.id}`} className="btn btn-primary" style={{ marginTop: 8 }}>
                    Finaliser le paiement
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
