'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { orderApi } from '@/services/api'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function CartPage() {
  const { cart, updateItem, removeItem, loading } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (!user) { router.push('/login'); return }
    setCheckingOut(true)
    setError('')
    try {
      const order = await orderApi.create() as any
      router.push(`/checkout?order_id=${order.id}`)
    } catch (e: any) {
      setError(e.message)
      setCheckingOut(false)
    }
  }

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-sm" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center' }}>
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-3)' }}>
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <h2>Votre panier est vide</h2>
          <p>Add some products to get started</p>
          <Link href="/products" className="btn btn-primary" style={{ marginTop: 8 }}>Browse Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <h1 className={styles.title}>Your Cart</h1>
      <p className={styles.subtitle}>{cart.total_items} item{cart.total_items !== 1 ? 's' : ''}</p>

      <div className={styles.layout}>
        <div className={styles.items}>
          {cart.items.map(item => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemImage}>
                {item.image_url ? (
                  <img src={`${API}${item.image_url}`} alt={item.product_name} />
                ) : (
                  <div className={styles.imgPlaceholder}>◆</div>
                )}
              </div>
              <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.product_name}</h3>
                <span className={styles.itemPrice}>€{item.unit_price.toFixed(2)}/mo</span>
              </div>
              <div className={styles.itemControls}>
                <div className={styles.qtyWrap}>
                  <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))} disabled={loading}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateItem(item.id, Math.min(99, item.quantity + 1))} disabled={loading}>+</button>
                </div>
                <span className={styles.lineTotal}>€{(item.unit_price * item.quantity).toFixed(2)}</span>
                <button className={styles.removeBtn} onClick={() => removeItem(item.id)} disabled={loading}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>Order Summary</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({cart.total_items} items)</span>
                <span>€{cart.subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow} style={{ color: 'var(--text-3)', fontSize: 12 }}>
                <span>Shipping & taxes</span>
                <span>calculated at checkout</span>
              </div>
              <div className="divider" style={{ margin: '4px 0' }} />
              <div className={styles.summaryTotal}>
                <span>Estimated Total</span>
                <span>€{cart.subtotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="card-footer" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {error && <p style={{ color: 'var(--error)', fontSize: 13 }}>{error}</p>}
              <button
                className="btn btn-primary w-full"
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? 'Creating order…' : 'Proceed to Checkout'}
              </button>
              <Link href="/products" className="btn btn-ghost w-full" style={{ textAlign: 'center' }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
