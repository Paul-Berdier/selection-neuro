'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { stackApi } from '@/services/api'
import { useCart } from '@/hooks/useCart'
import type { Stack } from '@/types'
import styles from './page.module.css'

export default function StackDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { addItem } = useCart()
  const [stack, setStack] = useState<Stack | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    stackApi.get(slug).then((s: any) => { setStack(s); setLoading(false) }).catch(() => setLoading(false))
  }, [slug])

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
          <span className={styles.eyebrow}>Stack</span>
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
                  {(sp.dosage_value || sp.note) && (
                    <div className={styles.dosage}>
                      {sp.dosage_value && (
                        <span className="badge badge-accent">{sp.dosage_value}{sp.dosage_unit}</span>
                      )}
                      {sp.note && <p className={styles.dosageNote}>{sp.note}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {stack.description && (
            <div className={styles.sidebar}>
              <div className="card">
                <div className="card-header"><h3>À propos de ce stack</h3></div>
                <div className="card-body">
                  <pre className={styles.descText}>{stack.description}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
