'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { productApi, stackApi } from '@/services/api'
import type { Product, Stack } from '@/types'
import styles from './page.module.css'

const MOLECULES = [
  { top: '12%', left: '6%',  size: 3, delay: 0 },
  { top: '28%', left: '91%', size: 2, delay: 0.8 },
  { top: '55%', left: '3%',  size: 2.5, delay: 1.4 },
  { top: '72%', left: '94%', size: 2, delay: 0.3 },
  { top: '88%', left: '18%', size: 3, delay: 1.1 },
  { top: '40%', left: '97%', size: 1.5, delay: 2.0 },
]

const BENEFITS = [
  { icon: '⚡', label: 'Attention & réactivité', color: '#ffd666' },
  { icon: '🧠', label: 'Mémoire & consolidation', color: '#8fb1ff' },
  { icon: '🌿', label: 'Anti-stress & récupération', color: '#52d0a8' },
  { icon: '🔋', label: 'Énergie mentale', color: '#ffd666' },
  { icon: '🧬', label: 'Plasticité & neurogenèse', color: '#c084fc' },
  { icon: '🛡', label: 'Neuroprotection', color: '#fb923c' },
]

const PILLARS = [
  {
    num: '01',
    title: 'Dosages réels',
    body: 'Chaque produit est dosé à la dose maximale effective démontrée en littérature scientifique — pas un symbole de catalogue.',
    accent: '#ffd666',
  },
  {
    num: '02',
    title: 'Prix/kg transparent',
    body: "Notre grille tarifaire est construite à partir du coût au kilo d'actif, pas à partir d'un prix de marché. Vous payez la matière, pas le packaging.",
    accent: '#8fb1ff',
  },
  {
    num: '03',
    title: 'Abonnement vs unitaire',
    body: "Deux logiques clairement séparées : achat ponctuel sur les fiches produit, abonnement mensuel sur les Stacks. Jamais mélangé.",
    accent: '#52d0a8',
  },
]

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

// Compteur animé
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, visible } = useInView()
  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = to / 40
    const interval = setInterval(() => {
      start += step
      if (start >= to) { setCount(to); clearInterval(interval) }
      else setCount(Math.floor(start))
    }, 30)
    return () => clearInterval(interval)
  }, [visible, to])
  return <span ref={ref}>{count}{suffix}</span>
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [stacks, setStacks] = useState<Stack[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    productApi.list({ limit: 6 } as any).then((r: any) => {
      setProducts((r.items ?? r).slice(0, 6))
      setLoadingProducts(false)
    }).catch(() => setLoadingProducts(false))

    stackApi.list().then((r: any) => {
      setStacks((r.items ?? r).slice(0, 2))
    }).catch(() => {})
  }, [])

  const pillarsRef = useInView()
  const productsRef = useInView()
  const stacksRef = useInView()
  const ctaRef = useInView()

  return (
    <div className={styles.page}>

      {/* ── Floating molecules ─────────────────────────────────── */}
      {MOLECULES.map((m, i) => (
        <div
          key={i}
          className={styles.molecule}
          style={{
            top: m.top, left: m.left,
            width: m.size * 6, height: m.size * 6,
            animationDelay: `${m.delay}s`,
          }}
        />
      ))}

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className="container-lg">
          <div className={styles.heroInner}>

            <div className={styles.heroLeft}>
              <div className={styles.heroLabel}>
                <span className={styles.heroDot} />
                Nootropiques · Blagnac
              </div>

              <h1 className={styles.heroTitle}>
                Optimisez votre<br />
                <span className={styles.heroAccent}>cerveau</span>,<br />
                pas votre budget.
              </h1>

              <p className={styles.heroLead}>
                Des actifs neuroprotecteurs dosés à leur plein potentiel.
                Prix au kilo transparent. Aucun compromis sur la qualité.
              </p>

              <div className={styles.heroCta}>
                <Link href="/products" className={`btn btn-primary ${styles.ctaMain}`}>
                  Explorer le catalogue
                </Link>
                <Link href="/stacks" className={`btn btn-ghost ${styles.ctaSecondary}`}>
                  Voir les stacks →
                </Link>
              </div>

              <div className={styles.heroMeta}>
                <div className={styles.metaItem}>
                  <strong><Counter to={17} /></strong>
                  <span>actifs référencés</span>
                </div>
                <div className={styles.metaSep} />
                <div className={styles.metaItem}>
                  <strong><Counter to={100} suffix="%" /></strong>
                  <span>dose maximale effective</span>
                </div>
                <div className={styles.metaSep} />
                <div className={styles.metaItem}>
                  <strong>10€</strong>
                  <span>livraison · offerte dès 30€</span>
                </div>
              </div>
            </div>

            <div className={styles.heroRight}>
              {/* Carte stack featured */}
              <div className={styles.featuredCard}>
                <div className={styles.featuredCardGlow} />
                <div className={styles.featuredCardInner}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <div className={styles.cardEyebrow}>Stack Premium</div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text)', marginTop: 4 }}>
                        Nootropique Premium
                      </h3>
                    </div>
                    <span className={styles.liveBadge}>✦ actif</span>
                  </div>

                  <div className={styles.compoundList}>
                    {[
                      { name: 'Citicoline', dose: '1 000 mg', note: 'Synaptogenèse' },
                      { name: 'DHA / Omega 3', dose: '600 mg', note: 'Membranes neuronales' },
                      { name: "Lion's Mane", dose: '2 000 mg', note: 'NGF & neuroplasticité' },
                      { name: 'Bacopa monnieri', dose: '300 mg', note: 'Mémoire' },
                    ].map(c => (
                      <div key={c.name} className={styles.compoundRow}>
                        <div>
                          <span className={styles.compoundName}>{c.name}</span>
                          <span className={styles.compoundNote}>{c.note}</span>
                        </div>
                        <span className={styles.compoundDose}>{c.dose}</span>
                      </div>
                    ))}
                    <div className={styles.compoundMore}>+ 3 actifs supplémentaires</div>
                  </div>

                  <div className={styles.featuredCardFooter}>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>à partir de</span>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                        ~€68<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-3)' }}>/mois</span>
                      </div>
                    </div>
                    <Link href="/stacks/stack-premium" className="btn btn-primary" style={{ fontSize: 13, padding: '10px 20px' }}>
                      Voir le stack
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mini stat cards */}
              <div className={styles.miniCards}>
                <div className={styles.miniStat}>
                  <span className={styles.miniStatIcon}>🏷</span>
                  <div>
                    <strong>Prix/kg</strong>
                    <span>affiché pour chaque produit</span>
                  </div>
                </div>
                <div className={styles.miniStat}>
                  <span className={styles.miniStatIcon}>📦</span>
                  <div>
                    <strong>3 variantes</strong>
                    <span>1 mois · 3 mois · 1 an</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BÉNÉFICES (scroll-in)
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.benefitsSection}>
        <div className="container-lg">
          <div className={styles.benefitsRow}>
            {BENEFITS.map(b => (
              <div key={b.label} className={styles.benefitChip} style={{ '--chip-color': b.color } as any}>
                <span>{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3 PILIERS
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.pillarsSection} ref={pillarsRef.ref}>
        <div className="container-lg">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Notre approche</span>
            <h2 className={styles.sectionTitle}>Formulé différemment,<br />pour de bonnes raisons.</h2>
          </div>

          <div className={`${styles.pillarsGrid} ${pillarsRef.visible ? styles.revealed : ''}`}>
            {PILLARS.map((p, i) => (
              <div key={p.num} className={styles.pillarCard} style={{ '--delay': `${i * 0.12}s`, '--col': p.accent } as any}>
                <span className={styles.pillarNum} style={{ color: p.accent }}>{p.num}</span>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarBody}>{p.body}</p>
                <div className={styles.pillarLine} style={{ background: p.accent }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PRODUITS VEDETTES
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.productsSection} ref={productsRef.ref}>
        <div className="container-lg">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Catalogue</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <h2 className={styles.sectionTitle}>Actifs sélectionnés.</h2>
              <Link href="/products" className={styles.seeAll}>
                Tous les produits →
              </Link>
            </div>
          </div>

          {loadingProducts ? (
            <div className={styles.productsGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 220, borderRadius: 20 }} />
              ))}
            </div>
          ) : (
            <div className={`${styles.productsGrid} ${productsRef.visible ? styles.revealed : ''}`}>
              {products.map((p, i) => {
                const v1m = p.variants?.find(v => v.months === 1)
                return (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    className={styles.productCard}
                    style={{ '--delay': `${i * 0.07}s` } as any}
                  >
                    <div className={styles.productCardGlow} />
                    <div className={styles.productCardInner}>
                      {p.image_url ? (
                        <div className={styles.productImg}>
                          <img src={`/api${p.image_url}`} alt={p.name} />
                        </div>
                      ) : (
                        <div className={styles.productImgPlaceholder}>◆</div>
                      )}
                      <div className={styles.productCardContent}>
                        {p.category && <span className={styles.productCategory}>{p.category}</span>}
                        <h3 className={styles.productName}>{p.name}</h3>
                        {p.short_desc && <p className={styles.productShortDesc}>{p.short_desc}</p>}
                        <div className={styles.productFooter}>
                          {v1m ? (
                            <div>
                              <span className={styles.productPrice}>€{v1m.price.toFixed(2)}</span>
                              <span className={styles.productPriceLabel}> / {v1m.qty_g}g</span>
                            </div>
                          ) : (
                            <span className={styles.productPrice}>—</span>
                          )}
                          <span className={styles.productArrow}>→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STACKS
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.stacksSection} ref={stacksRef.ref}>
        <div className="container-lg">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Abonnements</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <h2 className={styles.sectionTitle}>Stacks prêts à l'emploi.</h2>
              <Link href="/stacks" className={styles.seeAll}>Tous les stacks →</Link>
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 8, maxWidth: 520 }}>
              Les Stacks fonctionnent sur une logique d'abonnement mensuel — les prix affichés ici sont des <strong style={{ color: 'var(--text-2)' }}>références par mois</strong>, différents des prix unitaires des fiches produit.
            </p>
          </div>

          <div className={`${styles.stacksGrid} ${stacksRef.visible ? styles.revealed : ''}`}>
            {stacks.length === 0 ? (
              // Fallback si l'API n'est pas encore chargée
              [{
                slug: 'stack-premium',
                title: 'Stack Nootropique Premium',
                subtitle: 'Plasticité, Synaptogenèse, Régulation, Cognition',
                description: '',
                products: [],
              }].map((s, i) => (
                <Link key={s.slug} href={`/stacks/${s.slug}`} className={styles.stackCard} style={{ '--delay': `${i * 0.1}s` } as any}>
                  <div className={styles.stackCardGlow} />
                  <div className={styles.stackBadge}>Abonnement mensuel</div>
                  <h3 className={styles.stackTitle}>{s.title}</h3>
                  <p className={styles.stackSubtitle}>{s.subtitle}</p>
                  <div className={styles.stackCta}>Voir le stack →</div>
                </Link>
              ))
            ) : stacks.map((s, i) => {
              const total = s.products.reduce((sum, sp) => sum + (sp.product_price_month_eur ?? 0), 0)
              return (
                <Link key={s.slug} href={`/stacks/${s.slug}`} className={styles.stackCard} style={{ '--delay': `${i * 0.1}s` } as any}>
                  <div className={styles.stackCardGlow} />
                  <div className={styles.stackBadge}>Abonnement mensuel</div>
                  <h3 className={styles.stackTitle}>{s.title}</h3>
                  <p className={styles.stackSubtitle}>{s.subtitle}</p>
                  <div className={styles.stackProducts}>
                    {s.products.slice(0, 4).map(sp => (
                      <span key={sp.product_slug} className={styles.stackProduct}>
                        {sp.product_name}
                      </span>
                    ))}
                    {s.products.length > 4 && (
                      <span className={styles.stackProduct}>+{s.products.length - 4}</span>
                    )}
                  </div>
                  {total > 0 && (
                    <div className={styles.stackPrice}>
                      <span>~€{total.toFixed(0)}</span>
                      <span className={styles.stackPriceLabel}>/mois (réf.)</span>
                    </div>
                  )}
                  <div className={styles.stackCta}>Voir le stack →</div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          RÈGLE LIVRAISON — ferme et visible
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.shippingBanner}>
        <div className="container-lg">
          <div className={styles.shippingInner}>
            <div className={styles.shippingItem}>
              <span className={styles.shippingIcon}>🚚</span>
              <div>
                <strong>Livraison 10€</strong>
                <span>sur toute commande inférieure à 30€</span>
              </div>
            </div>
            <div className={styles.shippingDivider} />
            <div className={styles.shippingItem}>
              <span className={styles.shippingIcon}>✓</span>
              <div>
                <strong>Livraison offerte</strong>
                <span>automatiquement dès 30€ de panier</span>
              </div>
            </div>
            <div className={styles.shippingDivider} />
            <div className={styles.shippingItem}>
              <span className={styles.shippingIcon}>📦</span>
              <div>
                <strong>3 variantes par produit</strong>
                <span>1 mois · 3 mois · 1 an</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.ctaSection} ref={ctaRef.ref}>
        <div className="container-sm">
          <div className={`${styles.ctaBlock} ${ctaRef.visible ? styles.revealed : ''}`}>
            <div className={styles.ctaGlow} />
            <span className={styles.sectionLabel}>Commencer</span>
            <h2 className={styles.ctaTitle}>
              Votre cerveau mérite<br />
              <span style={{ color: 'var(--accent)' }}>une sélection sérieuse.</span>
            </h2>
            <p className={styles.ctaBody}>
              Parcourez les actifs, comparez les stacks, ou créez votre compte pour suivre vos commandes.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/products" className="btn btn-primary btn-lg">
                Explorer le catalogue
              </Link>
              <Link href="/register" className="btn btn-ghost btn-lg">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
