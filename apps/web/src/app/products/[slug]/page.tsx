'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productApi } from '@/services/api'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types'
import styles from './page.module.css'

const DURATIONS = [
  { label: '1 mois', months: 1, discount: 0 },
  { label: '4 mois', months: 4, discount: 0.10 },
  { label: '1 an', months: 12, discount: 0.20 },
]

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [duration, setDuration] = useState(0) // index dans DURATIONS
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    productApi.get(slug).then((p: any) => {
      setProduct(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [slug])

  const handleAdd = async () => {
    if (!product?.id) return
    setAdding(true)
    setError('')
    try {
      await addItem(product.id, qty)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (e: any) {
      setError(e.message)
    }
    setAdding(false)
  }

  const computePrice = () => {
    if (!product?.price_month_eur) return null
    const d = DURATIONS[duration]
    const base = product.price_month_eur * d.months
    return base * (1 - d.discount)
  }

  if (loading) return (
    <div className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className={styles.skeletonLayout}>
        <div className="skeleton" style={{ height: 480, borderRadius: 4 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="skeleton" style={{ height: 48, width: '80%' }} />
          <div className="skeleton" style={{ height: 18, width: '50%' }} />
          <div className="skeleton" style={{ height: 100 }} />
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
      <p className="text-muted">Produit introuvable.</p>
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => router.push('/products')}>Retour aux produits</button>
    </div>
  )

  const totalPrice = computePrice()
  const d = DURATIONS[duration]

  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <button className={styles.back} onClick={() => router.back()}>← Retour</button>

      <div className={styles.layout}>
        {/* Image */}
        <div className={styles.imageWrap}>
          {product.image_url ? (
            <img src={`/api${product.image_url}`} alt={product.name} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}><span>◆</span></div>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          {product.category && <span className={styles.category}>{product.category}</span>}
          <h1 className={styles.title}>{product.name}</h1>
          {product.short_desc && <p className={styles.shortDesc}>{product.short_desc}</p>}

          <div className={styles.divider} />

          {product.description_md && (
            <div className={styles.description}>
              <pre className={styles.descPre}>{product.description_md}</pre>
            </div>
          )}

          <div className={styles.divider} />

          {/* Variantes de durée */}
          {product.price_month_eur != null && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quantité</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {DURATIONS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setDuration(i)}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: 10,
                      border: duration === i ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: duration === i ? 'rgba(255,214,102,0.08)' : 'var(--glass-bg)',
                      color: duration === i ? 'var(--accent)' : 'var(--text-2)',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: duration === i ? 600 : 400,
                      transition: 'all 0.15s',
                      position: 'relative',
                    }}
                  >
                    {d.label}
                    {d.discount > 0 && (
                      <span style={{
                        position: 'absolute', top: -8, right: -4,
                        background: 'var(--accent)', color: '#000',
                        fontSize: 9, fontWeight: 700, padding: '2px 5px',
                        borderRadius: 6,
                      }}>-{d.discount * 100}%</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prix total */}
          <div className={styles.pricing}>
            <div className={styles.price}>
              {totalPrice != null ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className={styles.priceAmount}>€{totalPrice.toFixed(2)}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-3)' }}>pour {d.label}</span>
                  </div>
                  {d.months > 1 && (
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      soit €{(totalPrice / d.months).toFixed(2)}/mois
                    </span>
                  )}
                </div>
              ) : (
                <span className={styles.priceAmount}>Prix sur demande</span>
              )}
            </div>
          </div>

          {/* Livraison */}
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
            {totalPrice && totalPrice >= 30
              ? '✓ Livraison offerte'
              : 'Livraison 10€ (offerte dès 30€)'}
          </p>

          <div className={styles.addToCart}>
            <div className={styles.qtyControl}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(99, q + 1))}>+</button>
            </div>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleAdd}
              disabled={adding || added}
            >
              {added ? '✓ Ajouté au panier' : adding ? 'Ajout en cours…' : 'Ajouter au panier'}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  )
}
