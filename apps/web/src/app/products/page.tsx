'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { productApi } from '@/services/api'
import type { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import styles from './page.module.css'

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    setAdding(true)
    try {
      await addItem(product.id!, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    } catch {}
    setAdding(false)
  }

  return (
    <Link href={`/products/${product.slug}`} className={styles.card}>
      <div className={styles.cardImage}>
        {product.image_url ? (
          <img src={`${''}${product.image_url}`} alt={product.name} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>◆</span>
          </div>
        )}
        {product.category && <span className={styles.categoryTag}>{product.category}</span>}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{product.name}</h3>
        <p className={styles.cardDesc}>{product.short_desc}</p>
        <div className={styles.cardFooter}>
          <span className={styles.price}>
            {product.price_month_eur != null
              ? `€${product.price_month_eur.toFixed(2)}/mois`
              : 'Prix sur demande'}
          </span>
          <button
            className={`btn btn-primary btn-sm ${styles.addBtn}`}
            onClick={handleAdd}
            disabled={adding || added}
          >
            {added ? '✓ Ajouté' : adding ? '...' : 'Ajouter'}
          </button>
        </div>
      </div>
    </Link>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState<Product[]>([])

  useEffect(() => {
    productApi.list().then((r: any) => {
      setProducts(r.items || [])
      setFiltered(r.items || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.short_desc?.toLowerCase().includes(q)
    ))
  }, [search, products])

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  return (
    <div>
      <div className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>Notre sélection</span>
          <h1 className="page-title">Tous les produits</h1>
          <p className="page-subtitle">Formules précises pour chaque objectif</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.catFilters}>
            <button
              className={`${styles.catBtn} ${search === '' ? styles.catActive : ''}`}
              onClick={() => setSearch('')}
            >Tous</button>
            {categories.map(c => (
              <button
                key={c}
                className={`${styles.catBtn} ${search === c ? styles.catActive : ''}`}
                onClick={() => setSearch(c!)}
              >{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.skeleton}>
                <div className="skeleton" style={{ height: 220 }} />
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="skeleton" style={{ height: 20, width: '70%' }} />
                  <div className="skeleton" style={{ height: 14, width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className={styles.resultCount}>{filtered.length} produit{filtered.length !== 1 ? 's' : ''}</p>
            <div className={styles.grid}>
              {filtered.map(p => <ProductCard key={p.slug} product={p} />)}
            </div>
            {filtered.length === 0 && (
              <div className={styles.empty}>
                <span>◌</span>
                <p>Aucun produit trouvé</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
