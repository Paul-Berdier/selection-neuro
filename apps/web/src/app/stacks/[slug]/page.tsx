'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { stackApi } from '@/services/api'
import { useCart } from '@/hooks/useCart'
import type { Stack } from '@/types'
import styles from './page.module.css'

// Durées d'abonnement — seul endroit où le prix mensuel est affiché
const DURATIONS = [
  { label: '1 mois',  months: 1,  discount: 0 },
  { label: '3 mois',  months: 3,  discount: 0.10 },
  { label: '1 an',    months: 12, discount: 0.20 },
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
    stackApi.get(slug)
      .then((s: any) => { setStack(s); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  // Somme des prix mensuels de référence de chaque produit du stack
  const totalMonthlyPrice = stack?.products.reduce((sum, sp) => {
    return sum + (sp.product_price_month_eur ?? 0)
  }, 0) ?? 0

  const d = DURATIONS[duration]
  const totalPrice = totalMonthlyPrice * d.months * (1 - d.discount)
  const saving = d.discount > 0
    ? (totalMonthlyPrice * d.months * d.discount).toFixed(2)
    : null

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
          <span className={styles.eyebrow}>Abonnement mensuel</span>
          <h1 className={styles.title}>{stack.title}</h1>
          {stack.subtitle && <p className={styles.subtitle}>{stack.subtitle}</p>}
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        <div className={styles.layout}>

          {/* Liste des produits */}
          <div className={styles.products}>
            <h2 className={styles.sectionTitle}>Composition du stack</h2>
            {stack.products.map(sp => (
              <div key={sp.product_slug} className={styles.productCard}>
                <div className={styles.productInfo}>
                  <div style={{ flex: 1 }}>
                    {sp.product_category && (
                      <span className={styles.category}>{sp.product_category}</span>
                    )}
                    <Link href={`/products/${sp.product_slug}`} className={styles.productName}>
                      {sp.product_name}
                    </Link>
                    {sp.product_short_desc && (
                      <p className={styles.productDesc}>{sp.product_short_desc}</p>
                    )}
                    {sp.note && (
                      <p className={styles.dosageNote}>{sp.note}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    {sp.dosage_value && (
                      <span className="badge badge-accent">
                        {sp.dosage_value}{sp.dosage_unit}
                      </span>
                    )}
                    {/* Prix mensuel affiché ici car c'est la page Stack = logique abonnement */}
                    {sp.product_price_month_eur != null && (
                      <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                        €{sp.product_price_month_eur.toFixed(2)}<span style={{ fontWeight: 400, color: 'var(--text-3)' }}>/mois</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar abonnement */}
          <div className={styles.sidebar}>
            <div className="card" style={{ marginBottom: 16, position: 'sticky', top: 80 }}>
              <div className="card-header">
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}>
                  Souscrire à ce stack
                </h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Sélecteur durée */}
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Durée d&apos;abonnement
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {DURATIONS.map((dur, i) => {
                      const isActive = duration === i
                      return (
                        <button
                          key={i}
                          onClick={() => setDuration(i)}
                          style={{
                            flex: 1,
                            padding: '10px 6px',
                            borderRadius: 10,
                            border: isActive ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                            background: isActive ? 'rgba(255,214,102,0.08)' : 'transparent',
                            color: isActive ? 'var(--accent)' : 'var(--text-2)',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: isActive ? 600 : 400,
                            position: 'relative',
                          }}
                        >
                          {dur.label}
                          {dur.discount > 0 && (
                            <span style={{
                              position: 'absolute', top: -8, right: -4,
                              background: 'var(--accent)', color: '#000',
                              fontSize: 9, fontWeight: 700, padding: '2px 4px',
                              borderRadius: 5,
                            }}>-{dur.discount * 100}%</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Récapitulatif prix */}
                {totalMonthlyPrice > 0 && (
                  <div style={{ background: 'var(--glass-bg)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-2)', fontSize: 13 }}>Total {d.label}</span>
                      <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                        €{totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        €{(totalMonthlyPrice * (1 - d.discount)).toFixed(2)}/mois
                        {d.discount > 0 && ` · -${d.discount * 100}% vs mensuel`}
                      </span>
                      {saving && (
                        <span style={{ fontSize: 12, color: 'var(--success, #4ade80)', fontWeight: 500 }}>
                          Économie de €{saving}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                        {totalPrice >= 30 ? '✓ Livraison offerte' : 'Livraison 10€ (offerte dès 30€)'}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary w-full"
                  onClick={handleAddAll}
                  disabled={adding || added}
                  style={{ height: 48 }}
                >
                  {added ? '✓ Produits ajoutés au panier' : adding ? 'Ajout en cours…' : 'Ajouter tous au panier'}
                </button>

                <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5 }}>
                  Les prix affichés sont des prix de référence mensuelle.<br/>
                  Choisissez votre variante sur chaque fiche produit.
                </p>
              </div>
            </div>

            {/* Description */}
            {stack.description && (
              <div className="card">
                <div className="card-header"><h3>À propos</h3></div>
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
