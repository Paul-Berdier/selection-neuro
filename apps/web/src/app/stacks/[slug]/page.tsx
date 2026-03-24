'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { stackApi } from '@/services/api'
import { useCart } from '@/hooks/useCart'
import type { Stack } from '@/types'
import styles from './page.module.css'

// Durées d'abonnement — le seul endroit de l'app où le prix mensuel est affiché
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

  const totalMonthlyPrice = stack?.products.reduce((sum, sp) => {
    return sum + (sp.product_price_month_eur ?? 0)
  }, 0) ?? 0

  const d = DURATIONS[duration]
  const totalPrice = totalMonthlyPrice * d.months * (1 - d.discount)
  const savingEur = d.discount > 0
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

          {/* Bandeau distinctif — abonnement ≠ achat unitaire */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 20,
            background: 'rgba(255,214,102,0.12)',
            border: '1px solid rgba(255,214,102,0.3)',
            fontSize: 12,
            color: 'var(--accent)',
            fontWeight: 600,
            marginBottom: 16,
          }}>
            🔄 Logique d&apos;abonnement mensuel — prix par mois
          </div>

          <h1 className={styles.title}>{stack.title}</h1>
          {stack.subtitle && <p className={styles.subtitle}>{stack.subtitle}</p>}
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>

        {/* Avertissement contexte abonnement vs unitaire */}
        <div style={{
          marginBottom: 24,
          padding: '12px 18px',
          borderRadius: 10,
          background: 'rgba(255,214,102,0.05)',
          border: '1px solid rgba(255,214,102,0.15)',
          fontSize: 13,
          color: 'var(--text-2)',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--accent)' }}>ℹ️ Page abonnement</strong>
          {' '}— Les prix affichés ici sont des <strong>références mensuelles</strong> utilisées pour calculer le coût de l&apos;abonnement.
          Ils sont différents des prix unitaires des fiches produit.{' '}
          <Link href="/products" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            Voir les fiches produits →
          </Link>
        </div>

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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    {sp.dosage_value && (
                      <span className="badge badge-accent">
                        {sp.dosage_value}{sp.dosage_unit}
                      </span>
                    )}
                    {/* Prix/mois — affiché UNIQUEMENT sur la page Stack car logique abonnement */}
                    {sp.product_price_month_eur != null && (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700 }}>
                          €{sp.product_price_month_eur.toFixed(2)}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block' }}>
                          /mois (réf.)
                        </span>
                      </div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-2)', fontSize: 13 }}>Total {d.label}</span>
                      <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                        €{totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        €{(totalMonthlyPrice * (1 - d.discount)).toFixed(2)}/mois
                        {d.discount > 0 && ` · -${d.discount * 100}% vs mensuel`}
                      </span>
                      {savingEur && (
                        <span style={{ fontSize: 12, color: 'var(--success, #4ade80)', fontWeight: 500 }}>
                          Économie de €{savingEur} sur la période
                        </span>
                      )}
                      {/* Règle livraison ferme */}
                      <div style={{
                        marginTop: 6,
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: totalPrice >= 30 ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${totalPrice >= 30 ? 'rgba(74,222,128,0.2)' : 'var(--border)'}`,
                        fontSize: 11,
                      }}>
                        {totalPrice >= 30 ? (
                          <span style={{ color: 'var(--success, #4ade80)' }}>✓ Livraison offerte dès 30€</span>
                        ) : (
                          <span style={{ color: 'var(--text-3)' }}>
                            🚚 <strong>Livraison 10€</strong> (obligatoire sous 30€) · offerte dès 30€
                          </span>
                        )}
                      </div>
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

                <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6, padding: '0 8px' }}>
                  Les prix <strong>/mois</strong> sont des références pour cet abonnement.
                  Chaque produit dispose de ses propres variantes (1 mois / 3 mois / 1 an)
                  sur sa fiche produit.
                </p>
              </div>
            </div>

            {/* Description */}
            {stack.description && (
              <div className="card">
                <div className="card-header"><h3>À propos</h3></div>
                <div className="card-body">
                  <div dangerouslySetInnerHTML={{ __html: stack.description }} className={styles.descText} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
