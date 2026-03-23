'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productApi } from '@/services/api'
import { useCart } from '@/hooks/useCart'
import type { Product, ProductVariant } from '@/types'
import styles from './page.module.css'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [variantIdx, setVariantIdx] = useState(0)
  const [qty, setQty] = useState(1)
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
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => router.push('/products')}>
        Retour aux produits
      </button>
    </div>
  )

  const variants: ProductVariant[] = product.variants ?? []
  const hasVariants = variants.length > 0
  const selected = variants[variantIdx] ?? null

  // Prix à afficher — variante sélectionnée si dispo, sinon prix mensuel de ref
  const displayPrice = selected?.price ?? null
  const displayQty = selected?.qty_g ?? null

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

          {/* Sélecteur de variantes */}
          {hasVariants && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Durée d&apos;approvisionnement
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {variants.map((v, i) => {
                  const isActive = variantIdx === i
                  // Calculer l'économie par rapport à la variante 1 mois
                  const base1m = variants[0]
                  const saving = base1m
                    ? Math.round((1 - (v.price / v.months) / (base1m.price / base1m.months)) * 100)
                    : 0
                  return (
                    <button
                      key={i}
                      onClick={() => setVariantIdx(i)}
                      style={{
                        flex: 1,
                        padding: '12px 8px',
                        borderRadius: 12,
                        border: isActive ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                        background: isActive ? 'rgba(255,214,102,0.08)' : 'var(--glass-bg)',
                        color: isActive ? 'var(--accent)' : 'var(--text-2)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        transition: 'all 0.15s',
                        position: 'relative',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{v.label}</div>
                      <div style={{ fontSize: 11, marginTop: 2, color: isActive ? 'var(--accent)' : 'var(--text-3)' }}>
                        €{v.price.toFixed(2)}
                      </div>
                      {saving > 0 && (
                        <span style={{
                          position: 'absolute', top: -8, right: -4,
                          background: 'var(--accent)', color: '#000',
                          fontSize: 9, fontWeight: 700, padding: '2px 5px',
                          borderRadius: 6, lineHeight: 1.4,
                        }}>-{saving}%</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bloc prix */}
          <div className={styles.pricing}>
            {displayPrice != null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span className={styles.priceAmount}>€{displayPrice.toFixed(2)}</span>
                  {selected && (
                    <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                      pour {selected.label}
                    </span>
                  )}
                </div>
                {selected && selected.months > 1 && (
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    soit €{(displayPrice / selected.months).toFixed(2)}/mois
                  </span>
                )}
                {displayQty != null && (
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    {displayQty >= 1000
                      ? `${(displayQty / 1000).toFixed(2).replace('.00', '')} kg`
                      : `${displayQty} g`}
                  </span>
                )}
              </div>
            ) : (
              <span className={styles.priceAmount}>Prix sur demande</span>
            )}
          </div>

          {/* Info livraison */}
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '8px 0 16px' }}>
            {displayPrice && displayPrice >= 30
              ? '✓ Livraison offerte'
              : 'Livraison 10€ · offerte dès 30€ d\'achat'}
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
