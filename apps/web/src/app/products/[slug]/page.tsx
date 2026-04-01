'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [showPopup, setShowPopup] = useState(false)
  const [variantIdx, setVariantIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    productApi.get(slug).then((p: any) => {
      setProduct(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [slug])

  // Close popup on outside click
  useEffect(() => {
    if (!showPopup) return
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPopup(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [showPopup])

  // Lock body scroll when popup open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showPopup])

  const handleAdd = async () => {
    if (!product?.id) return
    setAdding(true)
    setError('')
    try {
      await addItem(product.id, qty)
      setAdded(true)
      setTimeout(() => {
        setAdded(false)
        setShowPopup(false)
      }, 1500)
    } catch (e: any) {
      setError(e.message)
    }
    setAdding(false)
  }

  if (loading) return (
    <div className={styles.pageWrap}>
      <div className={styles.stickyHeader}>
        <div className="skeleton" style={{ height: 280, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 32, width: '60%', marginTop: 16 }} />
      </div>
    </div>
  )

  if (!product) return (
    <div className={styles.pageWrap} style={{ textAlign: 'center', paddingTop: 80 }}>
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

  // Economy vs 1 month
  const base1m = variants[0]
  const saving = selected && base1m && selected !== base1m
    ? Math.round((1 - (selected.price / selected.months) / (base1m.price / base1m.months)) * 100)
    : 0

  // Shipping info
  const totalPrice = displayPrice != null ? displayPrice * qty : 0
  const freeShipping = totalPrice >= 30

  return (
    <div className={styles.pageWrap}>

      {/* ── Sticky top: image + title + category ── */}
      <div className={styles.stickyHeader}>
        <button className={styles.back} onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className={styles.imageWrap}>
          {product.image_url ? (
            <img src={`/api${product.image_url}`} alt={product.name} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}><span>◆</span></div>
          )}
        </div>

        <div className={styles.headerInfo}>
          {product.category && <span className={styles.category}>{product.category}</span>}
          <h1 className={styles.title}>{product.name}</h1>
          {product.short_desc && <p className={styles.shortDesc}>{product.short_desc}</p>}

          {/* Price preview */}
          {displayPrice != null && (
            <div className={styles.pricePreview}>
              <span className={styles.priceAmount}>€{displayPrice.toFixed(2)}</span>
              {selected && selected.months > 1 && (
                <span className={styles.pricePer}>soit €{(displayPrice / selected.months).toFixed(2)}/mois</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable description ── */}
      <div className={styles.scrollContent}>
        {/* Achat unitaire badge */}
        <div className={styles.unitBadge}>
          <span>📦</span>
          <span>
            <strong>Achat unitaire</strong> — vous achetez une quantité précise.{' '}
            <a href="/stacks">Voir les Stacks pour un abonnement →</a>
          </span>
        </div>

        {product.description && (
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}

        {/* Shipping info */}
        <div className={styles.shippingInfo}>
          {freeShipping ? (
            <span className={styles.shippingFree}>✓ Livraison offerte</span>
          ) : (
            <span>🚚 Livraison 10€ · offerte dès 30€</span>
          )}
        </div>
      </div>

      {/* ── Fixed bottom CTA ── */}
      <div className={styles.bottomCta}>
        <button
          className={styles.ctaButton}
          onClick={() => setShowPopup(true)}
          disabled={!hasVariants}
        >
          {hasVariants ? 'Ajouter au panier' : 'Indisponible'}
        </button>
      </div>

      {/* ── Popup: liquid glass variant selector ── */}
      {showPopup && (
        <div className={styles.overlay}>
          <div className={styles.popup} ref={popupRef}>
            {/* Popup header */}
            <div className={styles.popupHeader}>
              <div>
                <h3 className={styles.popupTitle}>{product.name}</h3>
                <p className={styles.popupSub}>Sélectionnez une variante</p>
              </div>
              <button className={styles.popupClose} onClick={() => setShowPopup(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Variant selector */}
            <div className={styles.variantGrid}>
              {variants.map((v, i) => {
                const isActive = variantIdx === i
                const s = base1m
                  ? Math.round((1 - (v.price / v.months) / (base1m.price / base1m.months)) * 100)
                  : 0
                return (
                  <button
                    key={i}
                    className={`${styles.variantCard} ${isActive ? styles.variantActive : ''}`}
                    onClick={() => setVariantIdx(i)}
                  >
                    <div className={styles.variantQty}>
                      {v.qty_g >= 1000
                        ? `${(v.qty_g / 1000).toFixed(v.qty_g % 1000 === 0 ? 0 : 2)} kg`
                        : `${v.qty_g} g`}
                    </div>
                    <div className={styles.variantLabel}>{v.label}</div>
                    <div className={styles.variantPrice}>€{v.price.toFixed(2)}</div>
                    {s > 0 && <span className={styles.variantSave}>-{s}%</span>}
                  </button>
                )
              })}
            </div>

            {/* Quantity */}
            <div className={styles.popupQty}>
              <span className={styles.popupQtyLabel}>Quantité</span>
              <div className={styles.qtyControl}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(99, q + 1))}>+</button>
              </div>
            </div>

            {/* Shipping preview */}
            <div className={styles.popupShipping}>
              {displayPrice != null && displayPrice * qty >= 30 ? (
                <span className={styles.shippingFree}>✓ Livraison offerte</span>
              ) : (
                <span>🚚 Livraison 10€ · encore €{displayPrice != null ? Math.max(0, 30 - displayPrice * qty).toFixed(2) : '—'} pour la gratuité</span>
              )}
            </div>

            {/* Total + Add */}
            <div className={styles.popupFooter}>
              <div className={styles.popupTotal}>
                <span className={styles.popupTotalLabel}>Total</span>
                <span className={styles.popupTotalPrice}>
                  €{displayPrice != null ? (displayPrice * qty).toFixed(2) : '—'}
                </span>
                {saving > 0 && (
                  <span className={styles.popupSaving}>-{saving}% vs 1 mois</span>
                )}
              </div>
              <button
                className={styles.popupAddBtn}
                onClick={handleAdd}
                disabled={adding || added}
              >
                {added ? '✓ Ajouté' : adding ? 'Ajout…' : 'Confirmer'}
              </button>
            </div>

            {error && <p className={styles.popupError}>{error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
