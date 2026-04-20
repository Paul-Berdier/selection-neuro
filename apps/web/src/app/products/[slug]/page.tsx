'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productApi } from '@/services/api'
import { useCart } from '@/hooks/useCart'
import type { Product, ProductVariant } from '@/types'
import styles from './page.module.css'

function formatVariantQty(value?: number | null) {
  if (value == null) return null
  return value >= 1000
    ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 2)} kg`
    : `${value} g`
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { addItem } = useCart()
  const pageRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPopup, setShowPopup] = useState(false)
  const [variantIdx, setVariantIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')
  const [mobileCtaVisible, setMobileCtaVisible] = useState(false)

  useEffect(() => {
    productApi.get(slug).then((p: any) => {
      setProduct(p)
      setVariantIdx(0)
      setQty(1)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!showPopup) return

    const handleClick = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false)
      }
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowPopup(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEsc)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [showPopup])

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [showPopup])

  useEffect(() => {
    const root = pageRef.current
    if (!root) return

    const media = window.matchMedia('(max-width: 767px)')
    let raf = 0
    let visible = false

    const updateProgress = () => {
      const progress = media.matches ? Math.min(window.scrollY / 260, 1) : 0
      root.style.setProperty('--scroll-progress', progress.toFixed(3))

      const nextVisible = media.matches && progress > 0.18
      if (visible !== nextVisible) {
        visible = nextVisible
        setMobileCtaVisible(nextVisible)
      }

      raf = 0
    }

    const requestUpdate = () => {
      if (raf) return
      raf = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    media.addEventListener?.('change', requestUpdate)

    return () => {
      if (raf) {
        window.cancelAnimationFrame(raf)
      }
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      media.removeEventListener?.('change', requestUpdate)
      root.style.removeProperty('--scroll-progress')
    }
  }, [])

  const handleAdd = async () => {
    if (!product?.id) return

    const selectedVariant = product.variants?.[variantIdx] ?? null

    setAdding(true)
    setError('')

    try {
      await addItem(product.id, qty, selectedVariant?.months)
      setAdded(true)
      setTimeout(() => {
        setAdded(false)
        setShowPopup(false)
      }, 1500)
    } catch (event: any) {
      setError(event.message)
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
  const totalPrice = displayPrice != null ? displayPrice * qty : 0
  const base1m = variants[0]
  const saving = selected && base1m && selected !== base1m
    ? Math.round((1 - (selected.price / selected.months) / (base1m.price / base1m.months)) * 100)
    : 0

  const shippingMessage = totalPrice >= 30
    ? '✓ Livraison offerte'
    : `🚚 Livraison 10€ · encore €${displayPrice != null ? Math.max(0, 30 - totalPrice).toFixed(2) : '—'} pour la gratuité`

  const selectedSummary = [selected?.label, formatVariantQty(selected?.qty_g)]
    .filter(Boolean)
    .join(' · ') || 'Choisissez une variante'

  return (
    <div ref={pageRef} className={styles.pageWrap}>
      <div className={styles.stickyHeader}>
        <button className={styles.back} onClick={() => router.back()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
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

          {displayPrice != null && (
            <div className={styles.pricePreview}>
              <span className={styles.priceAmount}>€{displayPrice.toFixed(2)}</span>
              {selected && selected.months > 1 && (
                <span className={styles.pricePer}>soit €{(displayPrice / selected.months).toFixed(2)}/mois</span>
              )}
            </div>
          )}

          {hasVariants && (
            <div className={styles.mobilePurchaseCard}>
              <div className={styles.mobilePurchaseSummary}>
                <div className={styles.mobilePurchaseCopy}>
                  <span className={styles.mobilePurchaseLabel}>{selectedSummary}</span>
                  <span className={styles.mobilePurchasePrice}>
                    €{displayPrice != null ? displayPrice.toFixed(2) : '—'}
                  </span>
                </div>
                <button
                  className={styles.mobilePurchaseButton}
                  onClick={() => setShowPopup(true)}
                  disabled={!hasVariants}
                >
                  Ajouter au panier
                </button>
              </div>
              <span className={styles.mobilePurchaseShipping}>{shippingMessage}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.scrollContent}>
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

        <div className={styles.shippingInfo}>
          {totalPrice >= 30 ? (
            <span className={styles.shippingFree}>✓ Livraison offerte</span>
          ) : (
            <span>🚚 Livraison 10€ · offerte dès 30€</span>
          )}
        </div>

        <div className={`${styles.bottomCta} ${mobileCtaVisible ? styles.bottomCtaVisible : ''}`}>
          <div className={styles.bottomCtaContent}>
            <div className={styles.bottomCtaMeta}>
              <span className={styles.bottomCtaLabel}>{selectedSummary}</span>
              <span className={styles.bottomCtaPrice}>
                €{displayPrice != null ? displayPrice.toFixed(2) : '—'}
              </span>
            </div>
            <button
              className={styles.ctaButton}
              onClick={() => setShowPopup(true)}
              disabled={!hasVariants}
            >
              {hasVariants ? 'Ajouter au panier' : 'Indisponible'}
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className={styles.overlay}>
          <div className={styles.popup} ref={popupRef}>
            <div className={styles.popupHeader}>
              <div>
                <h3 className={styles.popupTitle}>{product.name}</h3>
                <p className={styles.popupSub}>Sélectionnez une variante</p>
              </div>
              <button className={styles.popupClose} onClick={() => setShowPopup(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles.variantGrid}>
              {variants.map((variant, index) => {
                const isActive = variantIdx === index
                const variantSaving = base1m
                  ? Math.round((1 - (variant.price / variant.months) / (base1m.price / base1m.months)) * 100)
                  : 0

                return (
                  <button
                    key={`${variant.label}-${variant.months}`}
                    className={`${styles.variantCard} ${isActive ? styles.variantActive : ''}`}
                    onClick={() => setVariantIdx(index)}
                  >
                    <div className={styles.variantQty}>{formatVariantQty(variant.qty_g) ?? '—'}</div>
                    <div className={styles.variantLabel}>{variant.label}</div>
                    <div className={styles.variantPrice}>€{variant.price.toFixed(2)}</div>
                    {variantSaving > 0 && <span className={styles.variantSave}>-{variantSaving}%</span>}
                  </button>
                )
              })}
            </div>

            <div className={styles.popupQty}>
              <span className={styles.popupQtyLabel}>Quantité</span>
              <div className={styles.qtyControl}>
                <button onClick={() => setQty((current) => Math.max(1, current - 1))} disabled={qty <= 1}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((current) => Math.min(99, current + 1))}>+</button>
              </div>
            </div>

            <div className={styles.popupShipping}>
              {shippingMessage}
            </div>

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
