'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { orderApi, addressApi, shippingApi, paymentApi } from '@/services/api'
import type { Order, Address, ShippingRate } from '@/types'
import AddressForm from '@/components/address/AddressForm'
import styles from './page.module.css'

type Step = 'address' | 'shipping' | 'payment'

function formatVariantQty(value?: number | null) {
  if (value == null) return null
  return value >= 1000
    ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 2)} kg`
    : `${value} g`
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container-sm" style={{ paddingTop: 80, display: 'flex', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}

function CheckoutContent() {
  const params = useSearchParams()
  const router = useRouter()
  const orderId = Number(params.get('order_id'))

  const [step, setStep] = useState<Step>('address')
  const [order, setOrder] = useState<Order | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [selectedShipping, setSelectedShipping] = useState<number | null>(null)
  const [selectedBilling, setSelectedBilling] = useState<number | null>(null)
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)

  useEffect(() => {
    if (!orderId) { router.push('/cart'); return }
    Promise.all([
      orderApi.get(orderId) as Promise<Order>,
      addressApi.list() as Promise<Address[]>,
    ]).then(([o, a]) => {
      setOrder(o)
      setAddresses(a)
      setSelectedShipping(o.shipping_address_id ?? null)
      setSelectedBilling(o.billing_address_id ?? null)
      setSelectedShippingMethod(o.shipping_method ?? '')
      if (o.shipping_address_id) {
        void loadRates(o.shipping_address_id, o.shipping_method ?? undefined)
      }
      if (a.length === 0) setShowAddressForm(true)
      setLoading(false)
    }).catch(() => { router.push('/cart') })
  }, [orderId, router])

  const loadRates = async (addressId: number, preferredMethod?: string) => {
    const r = await shippingApi.getRates(addressId) as { items: ShippingRate[] }
    setShippingRates(r.items)
    if (r.items.length === 0) {
      setSelectedShippingMethod('')
      return
    }

    const method = preferredMethod && r.items.some((item) => item.method === preferredMethod)
      ? preferredMethod
      : r.items[0].method

    setSelectedShippingMethod(method)
  }

  const handleAddressSubmit = async () => {
    if (!selectedShipping) { setError('Veuillez sélectionner une adresse de livraison'); return }
    setSubmitting(true)
    setError('')
    try {
      const updated = await orderApi.setAddresses(orderId, selectedShipping, selectedBilling || undefined) as Order
      setOrder(updated)
      await loadRates(selectedShipping, updated.shipping_method ?? undefined)
      setStep('shipping')
    } catch (e: any) { setError(e.message) }
    setSubmitting(false)
  }

  const handleShippingSubmit = async () => {
    if (!selectedShippingMethod) { setError('Veuillez sélectionner un mode de livraison'); return }
    setSubmitting(true)
    setError('')
    try {
      await orderApi.setShipping(orderId, selectedShippingMethod)
      const updated = await orderApi.get(orderId) as Order
      setOrder(updated)
      setStep('payment')
    } catch (e: any) { setError(e.message) }
    setSubmitting(false)
  }

  const handlePayment = async () => {
    setSubmitting(true)
    setError('')
    try {
      const session = await paymentApi.createCheckoutSession(orderId) as any
      if (session.checkout_url) window.location.href = session.checkout_url
    } catch (e: any) { setError(e.message) }
    setSubmitting(false)
  }

  const handleAddressCreated = (addr: Address) => {
    setAddresses(prev => [addr, ...prev])
    setSelectedShipping(addr.id)
    setShowAddressForm(false)
  }

  if (loading) return (
    <div className="container-sm" style={{ paddingTop: 80 }}>
      <div className={styles.loadingWrap}><div className="spinner" /></div>
    </div>
  )

  const steps: { key: Step; label: string }[] = [
    { key: 'address', label: 'Adresse' },
    { key: 'shipping', label: 'Livraison' },
    { key: 'payment', label: 'Paiement' },
  ]

  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <h1 className={styles.title}>Commande</h1>

      <div className={styles.steps}>
        {steps.map((s, i) => (
          <div
            key={s.key}
            className={`${styles.step} ${step === s.key ? styles.stepActive : ''} ${steps.findIndex(x => x.key === step) > i ? styles.stepDone : ''}`}
          >
            <span className={styles.stepNum}>
              {steps.findIndex(x => x.key === step) > i ? '✓' : i + 1}
            </span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>

          {step === 'address' && (
            <div className="card animate-in">
              <div className="card-header">
                <h3>Adresse de livraison</h3>
              </div>
              <div className="card-body">
                {addresses.map(a => (
                  <label
                    key={a.id}
                    className={`${styles.addressOption} ${selectedShipping === a.id ? styles.addressSelected : ''}`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={selectedShipping === a.id}
                      onChange={() => setSelectedShipping(a.id)}
                    />
                    <div className={styles.addressInfo}>
                      <strong>{a.label}</strong>
                      <span>{a.full_name} · {a.line1}, {a.city} {a.postal_code}, {a.country}</span>
                    </div>
                  </label>
                ))}

                {showAddressForm ? (
                  <div style={{ marginTop: 20 }}>
                    <AddressForm
                      onSuccess={handleAddressCreated}
                      onCancel={addresses.length > 0 ? () => setShowAddressForm(false) : undefined}
                    />
                  </div>
                ) : (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 12 }}
                    onClick={() => setShowAddressForm(true)}
                  >
                    + Ajouter une adresse
                  </button>
                )}

                <div className="divider" />

                <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)', fontWeight: 400 }}>
                  Adresse de facturation
                </h3>

                <label className={`${styles.addressOption} ${selectedBilling === null ? styles.addressSelected : ''}`}>
                  <input
                    type="radio"
                    name="billing"
                    checked={selectedBilling === null}
                    onChange={() => setSelectedBilling(null)}
                  />
                  <span>Identique à l&apos;adresse de livraison</span>
                </label>

                {addresses.map(a => (
                  <label
                    key={a.id}
                    className={`${styles.addressOption} ${selectedBilling === a.id ? styles.addressSelected : ''}`}
                  >
                    <input
                      type="radio"
                      name="billing"
                      checked={selectedBilling === a.id}
                      onChange={() => setSelectedBilling(a.id)}
                    />
                    <div className={styles.addressInfo}>
                      <strong>{a.label}</strong>
                      <span>{a.full_name} · {a.line1}, {a.city}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="card-footer">
                {error && <p className="text-error" style={{ fontSize: 13, marginBottom: 10 }}>{error}</p>}
                <button
                  className="btn btn-primary"
                  onClick={handleAddressSubmit}
                  disabled={submitting || !selectedShipping}
                >
                  {submitting ? 'Enregistrement…' : 'Continuer vers la livraison'}
                </button>
              </div>
            </div>
          )}

          {step === 'shipping' && (
            <div className="card animate-in">
              <div className="card-header"><h3>Mode de livraison</h3></div>
              <div className="card-body">
                {shippingRates.map(r => (
                  <label
                    key={r.method}
                    className={`${styles.shippingOption} ${selectedShippingMethod === r.method ? styles.shippingSelected : ''}`}
                  >
                    <input
                      type="radio"
                      name="shipping_method"
                      checked={selectedShippingMethod === r.method}
                      onChange={() => setSelectedShippingMethod(r.method)}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: 'var(--text)' }}>{r.label}</strong>
                    </div>
                    <span className={styles.shippingPrice}>
                      {r.amount === 0
                        ? <span className="text-success">Gratuit</span>
                        : `€${r.amount.toFixed(2)}`}
                    </span>
                  </label>
                ))}
              </div>
              <div className="card-footer" style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setStep('address')}>← Retour</button>
                {error && <p className="text-error" style={{ fontSize: 13 }}>{error}</p>}
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto' }}
                  onClick={handleShippingSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Enregistrement…' : 'Continuer vers le paiement'}
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="card animate-in">
              <div className="card-header"><h3>Paiement</h3></div>
              <div className="card-body">
                <div className={styles.paymentInfo}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: 'var(--accent)' }}>
                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  <div>
                    <p style={{ color: 'var(--text)', fontWeight: 500 }}>Paiement sécurisé via Stripe</p>
                    <p style={{ fontSize: 13 }}>Vous serez redirigé pour finaliser votre paiement en toute sécurité.</p>
                  </div>
                </div>
              </div>
              <div className="card-footer" style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setStep('shipping')}>← Retour</button>
                {error && <p className="text-error" style={{ fontSize: 13 }}>{error}</p>}
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto' }}
                  onClick={handlePayment}
                  disabled={submitting}
                >
                  {submitting ? 'Redirection…' : `Payer €${order?.grand_total_amount?.toFixed(2) ?? '—'}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {order && (
          <div className={styles.sidebar}>
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>Commande #{order.id}</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {order.items.map(it => (
                  <div key={it.id} className={styles.orderItem}>
                    <div className={styles.orderItemDetails}>
                      <span className={styles.orderItemName}>{it.product_name}</span>
                      {(it.variant_label || it.variant_qty_g != null) && (
                        <span className={styles.orderItemMeta}>
                          {[it.variant_label, formatVariantQty(it.variant_qty_g)]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      )}
                    </div>
                    <span className={styles.orderItemQty}>×{it.quantity}</span>
                    <span>€{it.line_total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="divider" style={{ margin: '4px 0' }} />
                <div className={styles.orderSummaryRow}><span>Sous-total</span><span>€{order.subtotal_amount?.toFixed(2)}</span></div>
                <div className={styles.orderSummaryRow}>
                  <span>Livraison</span>
                  <span>{order.shipping_amount === 0 ? 'Offerte' : `€${order.shipping_amount.toFixed(2)}`}</span>
                </div>
                <div className={styles.orderSummaryRow}><span>TVA</span><span>€{order.tax_amount.toFixed(2)}</span></div>
                <div className="divider" style={{ margin: '4px 0' }} />
                <div className={styles.orderTotal}><span>Total</span><span>€{order.grand_total_amount?.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
