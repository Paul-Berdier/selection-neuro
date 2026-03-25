'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { productApi, stackApi } from '@/services/api'
import type { Product, Stack } from '@/types'
import styles from './page.module.css'

function useInView() {
  const [el, setEl] = useState<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [el])
  return { ref: setEl as any, visible }
}

function ProductCard({ p, idx }: { p: Product; idx: number }) {
  const v1m = p.variants?.find(v => v.months === 1)
  return (
    <Link href={`/products/${p.slug}`} className={styles.productCard} style={{ '--i': idx } as any}>
      <div className={styles.productCardInner}>
        {p.image_url ? (
          <div className={styles.productImg}><img src={`/api${p.image_url}`} alt={p.name} /></div>
        ) : (
          <div className={styles.productImgEmpty}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
            </svg>
          </div>
        )}
        <div className={styles.productCardBody}>
          {p.category && <span className={styles.productCat}>{p.category}</span>}
          <h3 className={styles.productName}>{p.name}</h3>
          {p.short_desc && <p className={styles.productDesc}>{p.short_desc}</p>}
          <div className={styles.productFooter}>
            {v1m ? (
              <span className={styles.productPrice}>€{v1m.price.toFixed(2)} <span>/ {v1m.qty_g}g</span></span>
            ) : <span className={styles.productPrice}>—</span>}
            <span className={styles.productArrow}>→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [stacks, setStacks] = useState<Stack[]>([])
  const [loading, setLoading] = useState(true)

  const productsRef = useInView()
  const pillarsRef = useInView()
  const stacksRef = useInView()

  useEffect(() => {
    productApi.list({ limit: 6 } as any)
      .then((r: any) => { setProducts((r.items ?? r).slice(0, 6)); setLoading(false) })
      .catch(() => setLoading(false))
    stackApi.list()
      .then((r: any) => setStacks((r.items ?? r).slice(0, 2)))
      .catch(() => {})
  }, [])

  return (
    <div className={styles.page}>

      {/* ══ HERO — mobile first, gabarit : image > texte > CTA > chips ══ */}
      <section className={styles.hero}>

        {/* Image zone */}
        <div className={styles.heroImage}>
          <div className={styles.heroImageInner}>
            {/* Illustration laboratoire — grille bento moléculaire */}
            <div className={styles.bentoHero}>
              <div className={`${styles.bentoCell} ${styles.bentoCellLg}`}>
                <span className={styles.bentoLabel}>Actifs vérifiés</span>
                <div className={styles.bentoValue}>17</div>
                <span className={styles.bentoSub}>références cataloguées</span>
              </div>
              <div className={`${styles.bentoCell} ${styles.bentoCellSm}`}>
                <span className={styles.bentoLabel}>Dose</span>
                <div className={styles.bentoValueSm}>100%</div>
                <span className={styles.bentoSub}>clinique</span>
              </div>
              <div className={`${styles.bentoCell} ${styles.bentoCellSm}`}>
                <span className={styles.bentoLabel}>Prix/kg</span>
                <div className={styles.bentoValueSm}>affiché</div>
                <span className={styles.bentoSub}>transparent</span>
              </div>
              <div className={`${styles.bentoCell} ${styles.bentoCellMd}`}>
                <span className={styles.bentoLabel}>Citicoline</span>
                <div className={styles.bentoValueSm}>CDP-Choline</div>
                <span className={styles.bentoSub}>1 000 mg / j</span>
              </div>
              <div className={`${styles.bentoCell} ${styles.bentoCellMd}`}>
                <span className={styles.bentoLabel}>Lion's Mane</span>
                <div className={styles.bentoValueSm}>Hericium</div>
                <span className={styles.bentoSub}>2 000 mg / j</span>
              </div>
            </div>
          </div>
        </div>

        {/* Texte zone */}
        <div className={styles.heroText}>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroDot} />
            Labstock · Blagnac
          </div>
          <h1 className={styles.heroTitle}>
            Nootropiques à doses réelles.
          </h1>
          <p className={styles.heroLead}>
            Chaque actif est formulé à la dose maximale effective validée en littérature scientifique.
            Prix au kilogramme d'actif affiché pour chaque référence.
          </p>
        </div>

        {/* CTA */}
        <div className={styles.heroCta}>
          <Link href="/products" className={`btn btn-primary ${styles.ctaPrimary}`}>
            Explorer le catalogue
          </Link>
          <Link href="/stacks" className={`btn btn-secondary ${styles.ctaSecondary}`}>
            Voir les stacks →
          </Link>
        </div>

        {/* Chips bénéfices */}
        <div className={styles.heroChips}>
          {['Mémoire', 'Attention', 'Énergie mentale', 'Neuroprotection', 'Plasticité'].map(c => (
            <span key={c} className={styles.chip}>{c}</span>
          ))}
        </div>
      </section>

      {/* ══ SHIPPING RULE — ferme et visible ══ */}
      <div className={styles.shippingBar}>
        <div className="container">
          <div className={styles.shippingInner}>
            <span>🚚 <strong>Livraison 10€</strong> · offerte dès 30€ d'achat</span>
            <span className={styles.shippingDiv} />
            <span>📦 3 variantes : 1 mois · 3 mois · 1 an</span>
            <span className={styles.shippingDiv} />
            <span>⚗️ Actifs dosés à 100% de la dose clinique</span>
          </div>
        </div>
      </div>

      {/* ══ PRODUITS ══ */}
      <section className={styles.productsSection} ref={productsRef.ref}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <div className={styles.sectionLabel}>Catalogue</div>
              <h2 className={styles.sectionTitle}>Actifs disponibles</h2>
            </div>
            <Link href="/products" className={styles.seeAll}>Tout voir →</Link>
          </div>

          <div className={`${styles.productsGrid} ${productsRef.visible ? styles.visible : ''}`}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
                ))
              : products.map((p, i) => <ProductCard key={p.slug} p={p} idx={i} />)
            }
          </div>
        </div>
      </section>

      {/* ══ 3 PILIERS ══ */}
      <section className={styles.pillarsSection} ref={pillarsRef.ref}>
        <div className="container">
          <div className={`${styles.pillarsGrid} ${pillarsRef.visible ? styles.visible : ''}`}>
            <div className={styles.pillar} style={{ '--i': 0 } as any}>
              <div className={styles.pillarIcon}>01</div>
              <h3>Dosage clinique</h3>
              <p>Chaque référence est dosée à la dose maximale effective issue de la littérature scientifique revue par les pairs — pas un dosage symbolique.</p>
            </div>
            <div className={styles.pillar} style={{ '--i': 1 } as any}>
              <div className={styles.pillarIcon}>02</div>
              <h3>Prix/kg transparent</h3>
              <p>Notre grille tarifaire est construite depuis le coût au kilo d'actif pur. Vous payez la matière, pas l'emballage ni la marge de distribution.</p>
            </div>
            <div className={styles.pillar} style={{ '--i': 2 } as any}>
              <div className={styles.pillarIcon}>03</div>
              <h3>Abonnement ou unitaire</h3>
              <p>Achat ponctuel sur les fiches produit, abonnement mensuel sur les Stacks. Les deux logiques sont clairement séparées, jamais mélangées.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STACKS ══ */}
      <section className={styles.stacksSection} ref={stacksRef.ref}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div>
              <div className={styles.sectionLabel}>Abonnements</div>
              <h2 className={styles.sectionTitle}>Stacks prêts à l'emploi</h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
                Prix affichés = références mensuelles — différents des prix unitaires des fiches.
              </p>
            </div>
            <Link href="/stacks" className={styles.seeAll}>Tout voir →</Link>
          </div>

          <div className={`${styles.stacksGrid} ${stacksRef.visible ? styles.visible : ''}`}>
            {stacks.length === 0 ? (
              <Link href="/stacks/stack-premium" className={styles.stackCard} style={{ '--i': 0 } as any}>
                <div className={styles.stackCardTop}>
                  <span className={styles.stackBadge}>Abonnement mensuel</span>
                  <h3>Stack Nootropique Premium</h3>
                  <p>Plasticité, Synaptogenèse, Régulation, Cognition</p>
                </div>
                <div className={styles.stackCardFooter}>
                  <span className={styles.stackSeeMore}>Voir le stack →</span>
                </div>
              </Link>
            ) : stacks.map((s, i) => {
              const total = s.products.reduce((sum, sp) => sum + (sp.product_price_month_eur ?? 0), 0)
              return (
                <Link key={s.slug} href={`/stacks/${s.slug}`} className={styles.stackCard} style={{ '--i': i } as any}>
                  <div className={styles.stackCardTop}>
                    <span className={styles.stackBadge}>Abonnement mensuel</span>
                    <h3>{s.title}</h3>
                    <p>{s.subtitle}</p>
                    <div className={styles.stackComps}>
                      {s.products.slice(0, 4).map(sp => (
                        <span key={sp.product_slug} className={styles.stackComp}>{sp.product_name}</span>
                      ))}
                      {s.products.length > 4 && <span className={styles.stackComp}>+{s.products.length - 4}</span>}
                    </div>
                  </div>
                  <div className={styles.stackCardFooter}>
                    {total > 0 && (
                      <span className={styles.stackPrice}>~€{total.toFixed(0)}<span>/mois réf.</span></span>
                    )}
                    <span className={styles.stackSeeMore}>Voir →</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className={styles.ctaFinal}>
        <div className="container-sm">
          <div className={styles.ctaFinalCard}>
            <div className={styles.sectionLabel}>Commencer</div>
            <h2>Votre cerveau mérite une sélection sérieuse.</h2>
            <p>Parcourez les actifs, comparez les stacks, créez votre compte pour suivre vos commandes.</p>
            <div className={styles.ctaFinalActions}>
              <Link href="/products" className="btn btn-primary btn-lg">Explorer le catalogue</Link>
              <Link href="/register" className="btn btn-secondary btn-lg">Créer un compte</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
