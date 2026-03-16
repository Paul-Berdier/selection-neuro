'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { productApi } from '@/services/api'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/types'
import styles from './page.module.css'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
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
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => router.push('/products')}>Retour aux produits</button>
    </div>
  )

  

  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <button className={styles.back} onClick={() => router.back()}>
        ← Retour
      </button>

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

          <div className={styles.pricing}>
            <div className={styles.price}>
              {product.price_month_eur != null ? (
                <>
                  <span className={styles.priceAmount}>€{product.price_month_eur.toFixed(2)}</span>
                  <span className={styles.pricePer}>/mois</span>
                </>
              ) : (
                <span className={styles.priceAmount}>Prix sur demande</span>
              )}
            </div>
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
