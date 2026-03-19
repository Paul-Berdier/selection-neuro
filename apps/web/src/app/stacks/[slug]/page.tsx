'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { stackApi } from '@/services/api'
import { useCart } from '@/hooks/useCart'
import type { Stack } from '@/types'
import styles from './page.module.css'

const DURATIONS = [
  { label: '1 mois', months: 1, discount: 0 },
  { label: '4 mois', months: 4, discount: 0.10 },
  { label: '1 an', months: 12, discount: 0.20 },
]

export default function StackDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { addItem } = useCart()
  const [stack, setStack] = useState<Stack | null>(null)
  const [loading, setLoading] = useState(true)
  const [duration, setDuration] = useState(0)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    stackApi.get(slug).then((s: any) => { setStack(s); setLoading(false) }).catch(() => setLoading(false))
  }, [slug])

  const totalMonthlyPrice = stack?.products.reduce((sum, sp) => {
    return sum + (sp.product_price_month_eur || 0)
  }, 0) ?? 0

  const d = DURATIONS[duration]
  const totalPrice = totalMonthlyPrice * d.months * (1 - d.discount)

  const handleAddAll = async () => {
    if (!stack) return
    setAdding(true)
    try {
      for (const sp of stack.products) {
        if (sp.product_id) await addItem(sp.product_id, 1)
      }
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {}
    setAdding(false)
  }

  if (loading) return (
    <div className="container" style={{ paddingTop: 80 }}>
      <div className={styles.skeletonHero}>
        <div className="skeleton" style={{ height: 48, width: '60%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 20, width: '40%' }} />
      </div>
    </div>
  )

  if (!stack) return (
    <div className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
      <p className="text-muted">Stack introuvable.</p>
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => router.push('/stacks')}>Retour</button>
    </div>
  )

  return (
    <div>
      <div className={styles.hero}>
        <div className="container">
          <button className={styles.back} onClick={() => router.back()}>← Stacks</button>
          <span className={styles.eyebrow}>Stack abonnement</span>
          <h1 className={styles.title}>{stack.title}</h1>
          {stack.subtitle && <p className={styles.subtitle}>{stack.subtitle}</p>}
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        <div className={styles.layout}>
          <div className={styles.products}>
            <h2 className={styles.sectionTitle}>Produits de ce stack</h2>
            {stack.products.map(sp => (
              <div key={sp.product_slug} className={styles.productCard}>
                <div className={styles.productInfo}>
                  <div>
                    {sp.product_category && <span className={styles.category}>{sp.product_category}</span>}
                    <Link href={`/products/${sp.product_slug}`} className={styles.productName}>
                      {sp.product_name}
                    </Link>
                    {sp.product_short_desc && <p className={styles.productDesc}>{sp.product_short_desc}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    {(sp.dosage_value || sp.note) && (
                      <div className={styles.dosage}>
                        {sp.dosage_value && (
                          <span className="badge badge-accent">{sp.dosage_value}{sp.dosage_unit}</span>
                        )}
                        {sp.note && <p className={styles.dosageNote}>{sp.note}</p>}
                      </div>
                    )}
                    {sp.product_price_month_eur != null && (
                      <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                        €{sp.product_price_month_eur.toFixed(2)}/mois
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.sidebar}>
            {/* Bloc abonnement */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>Souscrire à ce stack</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Sélecteur durée */}
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Durée</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {DURATIONS.map((dur, i) => (
                      <button
                        key={i}
                        onClick={() => setDuration(i)}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          borderRadius: 10,
                          border: duration === i ? '1px solid var(--accent)' : '1px solid var(--border)',
                          background: duration === i ? 'rgba(255,214,102,0.08)' : 'transparent',
                          color: duration === i ? 'var(--accent)' : 'var(--text-2)',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: duration === i ? 600 : 400,
                          position: 'relative',
                        }}
                      >
                        {dur.label}
                        {dur.discount > 0 && (
                          <span style={{
                            position: 'absolute', top: -8, right: -4,
                            background: 'var(--accent)', color: '#000',
                            fontSize: 9, fontWeight: 700, padding: '2px 5px',
                            borderRadius: 6,
                          }}>-{dur.discount * 100}%</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prix */}
                {totalMonthlyPrice > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Total {d.label}</span>
                      <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>€{totalPrice.toFixed(2)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      soit €{(totalMonthlyPrice * (1 - d.discount)).toFixed(2)}/mois
                      {d.discount > 0 && ` · économie de €${(totalMonthlyPrice * d.months * d.discount).toFixed(2)}`}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
                      {totalPrice >= 30 ? '✓ Livraison offerte' : 'Livraison 10€ (offerte dès 30€)'}
                    </p>
                  </div>
                )}

                <button
                  className="btn btn-primary w-full"
                  onClick={handleAddAll}
                  disabled={adding || added}
                >
                  {added ? '✓ Ajoutés au panier' : adding ? 'Ajout…' : 'Ajouter tous au panier'}
                </button>
              </div>
            </div>

            {/* Description */}
            {stack.description && (
              <div className="card">
                <div className="card-header"><h3>À propos de ce stack</h3></div>
                <div className="card-body">
                  <pre className={styles.descText}>{stack.description}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
