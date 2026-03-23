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

  const displayPrice = selected?.price ?? null
  const displayQty = selected?.qty_g ?? null

  // Économie par rapport à la variante 1 mois
  const base1m = variants[0]
  const saving = selected && base1m && selected !== base1m
    ? Math.round((1 - (selected.price / selected.months) / (base1m.price / base1m.months)) * 100)
    : 0

  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <button className={styles.back} onClick={() => router.back()}>← Retour</button>

      {/* Bandeau distinctif — achat unitaire ≠ abonnement */}
      <div style={{
        marginBottom: 24,
        padding: '10px 16px',
        borderRadius: 10,
        background: 'rgba(255,214,102,0.07)',
        border: '1px solid rgba(255,214,102,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 12,
        color: 'var(--text-2)',
      }}>
        <span style={{ fontSize: 16 }}>📦</span>
        <span>
          <strong style={{ color: 'var(--accent)' }}>Achat unitaire</strong>
          {' '}— vous achetez une quantité précise.{' '}
          <span style={{ color: 'var(--text-3)' }}>
            Pour un abonnement mensuel, consultez nos{' '}
            <a href="/stacks" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Stacks</a>.
          </span>
        </span>
      </div>

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

          {product.description && (
            <div className={styles.description}>
              <pre className={styles.descPre}>{product.description}</pre>
            </div>
          )}

          <div className={styles.divider} />

          {/* Sélecteur de variantes */}
          {hasVariants ? (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Choisir la quantité
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {variants.map((v, i) => {
                  const isActive = variantIdx === i
                  const s = base1m
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
                      <div style={{ fontWeight: 600 }}>
                        {v.qty_g >= 1000
                          ? `${(v.qty_g / 1000).toFixed(v.qty_g % 1000 === 0 ? 0 : 2)} kg`
                          : `${v.qty_g} g`}
                      </div>
                      <div style={{ fontSize: 11, marginTop: 2, color: isActive ? 'var(--accent)' : 'var(--text-3)' }}>
                        {v.label}
                      </div>
                      <div style={{ fontSize: 12, marginTop: 2, fontWeight: 600 }}>
                        €{v.price.toFixed(2)}
                      </div>
                      {s > 0 && (
                        <span style={{
                          position: 'absolute', top: -8, right: -4,
                          background: 'var(--accent)', color: '#000',
                          fontSize: 9, fontWeight: 700, padding: '2px 5px',
                          borderRadius: 6, lineHeight: 1.4,
                        }}>-{s}%</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              marginBottom: 20,
              fontSize: 13,
              color: 'var(--text-3)',
            }}>
              Variantes non disponibles pour ce produit.
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
                      · {selected.months > 1 ? `soit €${(displayPrice / selected.months).toFixed(2)}/mois` : 'pour 1 mois'}
                    </span>
                  )}
                </div>
                {saving > 0 && (
                  <span style={{ fontSize: 12, color: 'var(--success, #4ade80)', fontWeight: 500 }}>
                    Économie de {saving}% par rapport à la variante 1 mois
                  </span>
                )}
                {displayQty != null && (
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    {displayQty >= 1000
                      ? `${(displayQty / 1000).toFixed(2).replace('.00', '')} kg d'actif`
                      : `${displayQty} g d'actif`}
                  </span>
                )}
              </div>
            ) : (
              <span className={styles.priceAmount}>Prix sur demande</span>
            )}
          </div>

          {/* Info livraison — règle ferme 10€ sous 30€ */}
          <div style={{
            margin: '10px 0 16px',
            padding: '10px 14px',
            borderRadius: 8,
            background: displayPrice != null && displayPrice * qty >= 30
              ? 'rgba(74,222,128,0.06)'
              : 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--text-3)',
          }}>
            {displayPrice != null && displayPrice * qty >= 30 ? (
              <span style={{ color: 'var(--success, #4ade80)' }}>✓ Livraison offerte dès 30€</span>
            ) : (
              <>
                <span style={{ color: 'var(--text-2)' }}>🚚 Livraison 10€</span>
                {displayPrice != null && displayPrice * qty < 30 && (
                  <span> · offerte dès 30€ d&apos;achat
                    {displayPrice != null && (
                      <span style={{ color: 'var(--accent)' }}>
                        {' '}(encore €{Math.max(0, 30 - displayPrice * qty).toFixed(2)})
                      </span>
                    )}
                  </span>
                )}
              </>
            )}
          </div>

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
