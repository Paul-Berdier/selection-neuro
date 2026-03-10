'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { stackApi } from '@/services/api'
import type { Stack } from '@/types'
import styles from './page.module.css'

export default function StacksPage() {
  const [stacks, setStacks] = useState<Stack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    stackApi.list().then((r: any) => { setStacks(r.items || []); setLoading(false) })
  }, [])

  return (
    <div>
      <div className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>Expert Curation</span>
          <h1 className="page-title">Stacks</h1>
          <p className="page-subtitle">Science-driven supplement combinations for specific goals</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        {loading ? (
          <div className={styles.grid}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 280, borderRadius: 4 }} />
            ))}
          </div>
        ) : stacks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-2)' }}>
            No stacks available yet.
          </div>
        ) : (
          <div className={styles.grid}>
            {stacks.map(s => (
              <Link key={s.slug} href={`/stacks/${s.slug}`} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.iconWrap}>◈</div>
                  <span className={styles.productCount}>{s.products.length} products</span>
                </div>
                <h3 className={styles.stackTitle}>{s.title}</h3>
                {s.subtitle && <p className={styles.stackSubtitle}>{s.subtitle}</p>}
                <div className={styles.productPills}>
                  {s.products.slice(0, 3).map(p => (
                    <span key={p.product_slug} className={styles.pill}>{p.product_name}</span>
                  ))}
                  {s.products.length > 3 && (
                    <span className={styles.pillMore}>+{s.products.length - 3} more</span>
                  )}
                </div>
                <span className={styles.viewLink}>View Stack →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
