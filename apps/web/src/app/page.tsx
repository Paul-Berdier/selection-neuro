'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { productApi, stackApi } from '@/services/api'
import type { Product, Stack } from '@/types'
import styles from './page.module.css'

function formatPrice(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—'
  return `€${value.toFixed(2)}`
}

function getVariantByMonths(product: Product, months: number) {
  return product.variants?.find((variant) => variant.months === months) ?? null
}

function getFirstVariant(product: Product) {
  return product.variants?.[0] ?? null
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [stacks, setStacks] = useState<Stack[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    productApi
      .list({ limit: 6 } as any)
      .then((response: any) => {
        setProducts((response.items ?? response).slice(0, 6))
      })
      .finally(() => setLoadingProducts(false))

    stackApi
      .list()
      .then((response: any) => {
        setStacks((response.items ?? response).slice(0, 2))
      })
      .catch(() => setStacks([]))
  }, [])

  const featuredProduct = useMemo(() => products[0] ?? null, [products])
  const productCards = useMemo(() => products.slice(0, 4), [products])
  const featuredStacks = useMemo(() => stacks.slice(0, 2), [stacks])

  return (
    <div className={styles.page}>
      <div className="container-lg">
        <section className={styles.mobileHero}>
          <div className={styles.visualPanel}>
            <div className={styles.visualTopBar}>
              <span className={styles.visualTag}>Sélection neuro</span>
              <span className={styles.visualTagSoft}>Formules documentées</span>
            </div>

            <div className={styles.visualStage}>
              <div className={styles.visualGlow} />
              {featuredProduct?.image_url ? (
                <img
                  src={`/api${featuredProduct.image_url}`}
                  alt={featuredProduct.name}
                  className={styles.heroImage}
                />
              ) : (
                <div className={styles.heroImageFallback}>
                  <span>Catalogue</span>
                  <strong>formes actives · dosages lisibles · sourcing cadré</strong>
                </div>
              )}

              <div className={styles.floatingCardPrimary}>
                <span className={styles.floatingEyebrow}>Référence du moment</span>
                <strong>{featuredProduct?.name ?? 'Stack cognition quotidien'}</strong>
                <p>
                  {featuredProduct?.short_desc ??
                    'Une lecture claire des usages, des quantités et des arbitrages de formulation.'}
                </p>
              </div>

              <div className={styles.floatingCardSecondary}>
                <span className={styles.metricLabel}>Lecture rapide</span>
                <strong>{featuredProduct ? '3 niveaux de lecture' : 'Catalogue éditorialisé'}</strong>
                <p>fiche produit, variantes de dosage, logique stack</p>
              </div>
            </div>
          </div>

          <div className={styles.storyPanel}>
            <div className={styles.storyHead}>
              <span className={styles.storyKicker}>Accueil mobile</span>
              <h1 className={styles.storyTitle}>
                Une vitrine pensée comme un laboratoire premium, lisible d’abord sur téléphone.
              </h1>
              <p className={styles.storyLead}>
                La page d’accueil présente immédiatement la logique du site&nbsp;: des produits unitaires
                avec leurs variantes réelles, des stacks pour l’abonnement mensuel, et une lecture éditoriale
                qui explique à quoi sert chaque actif sans noyer l’utilisateur.
              </p>
            </div>

            <div className={styles.storyGrid}>
              <article className={styles.infoCard}>
                <span className={styles.infoIndex}>01</span>
                <h2>Catalogue lisible</h2>
                <p>
                  Chaque fiche met en avant le nom de l’actif, le positionnement, les variantes et une
                  description exploitable tout de suite.
                </p>
              </article>
              <article className={styles.infoCard}>
                <span className={styles.infoIndex}>02</span>
                <h2>Stacks séparés</h2>
                <p>
                  L’espace stacks garde sa propre logique de mensualisation afin d’éviter toute confusion entre
                  achat ponctuel et abonnement.
                </p>
              </article>
              <article className={styles.infoCard}>
                <span className={styles.infoIndex}>03</span>
                <h2>Ton éditorial crédible</h2>
                <p>
                  Le contenu de l’accueil sert à orienter l’utilisateur, pas à décrire le design du site ni à
                  afficher des blocs vides.
                </p>
              </article>
            </div>
          </div>

          <div className={styles.ctaPanel}>
            <div>
              <span className={styles.ctaEyebrow}>Entrée rapide</span>
              <h2 className={styles.ctaTitle}>Choisir un produit ou comparer directement les stacks.</h2>
            </div>
            <div className={styles.ctaButtons}>
              <Link href="/products" className="btn btn-primary btn-lg">
                Explorer le catalogue
              </Link>
              <Link href="/stacks" className="btn btn-secondary btn-lg">
                Voir les stacks
              </Link>
            </div>
          </div>

          <div className={styles.lowerGrid}>
            <section className={styles.catalogPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.panelEyebrow}>Produits</span>
                  <h2>Unitaires utiles pour construire un protocole clair.</h2>
                </div>
                <Link href="/products" className={styles.inlineLink}>
                  Tout voir
                </Link>
              </div>

              <div className={styles.productGrid}>
                {loadingProducts && (
                  <div className={styles.loadingState}>Chargement du catalogue…</div>
                )}

                {!loadingProducts && productCards.map((product) => {
                  const preferredVariant = getVariantByMonths(product, 1) ?? getFirstVariant(product)
                  return (
                    <Link key={product.slug} href={`/products/${product.slug}`} className={styles.productCard}>
                      <div className={styles.productCardMedia}>
                        {product.image_url ? (
                          <img src={`/api${product.image_url}`} alt={product.name} className={styles.productImage} />
                        ) : (
                          <div className={styles.productFallback}>Actif</div>
                        )}
                      </div>
                      <div className={styles.productCardBody}>
                        <span className={styles.productCategory}>{product.category || 'Catalogue'}</span>
                        <h3>{product.name}</h3>
                        <p>{product.short_desc || 'Description détaillée disponible sur la fiche produit.'}</p>
                        <div className={styles.productMeta}>
                          <span>{formatPrice(preferredVariant?.price ?? product.price_month_eur)}</span>
                          <small>
                            {preferredVariant ? `${preferredVariant.qty_g} g` : 'fiche complète'}
                          </small>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>

            <aside className={styles.sidePanel}>
              <section className={styles.miniPanel}>
                <span className={styles.panelEyebrow}>Méthode</span>
                <h2>Trois niveaux d’information sur mobile.</h2>
                <ul className={styles.bulletList}>
                  <li>nom et rôle du produit dès le premier écran,</li>
                  <li>variante principale lisible sans scroller longtemps,</li>
                  <li>accès immédiat aux stacks quand l’utilisateur veut raisonner en mois.</li>
                </ul>
              </section>

              <section className={styles.miniPanelTall}>
                <div className={styles.panelHeaderCompact}>
                  <div>
                    <span className={styles.panelEyebrow}>Stacks</span>
                    <h2>Une logique d’abonnement distincte et cohérente.</h2>
                  </div>
                  <Link href="/stacks" className={styles.inlineLink}>
                    Comparer
                  </Link>
                </div>

                <div className={styles.stackList}>
                  {featuredStacks.length === 0 && (
                    <div className={styles.emptyStackState}>
                      Les stacks publiés apparaîtront ici dès qu’ils seront exposés par l’API.
                    </div>
                  )}

                  {featuredStacks.map((stack) => {
                    const monthlyTotal = stack.products.reduce(
                      (sum, item) => sum + (item.product_price_month_eur ?? 0),
                      0,
                    )

                    return (
                      <Link key={stack.slug} href={`/stacks/${stack.slug}`} className={styles.stackCard}>
                        <span className={styles.stackBadge}>{stack.products.length} actifs</span>
                        <h3>{stack.title}</h3>
                        <p>{stack.subtitle || stack.description}</p>
                        <div className={styles.stackFooter}>
                          <span>{monthlyTotal > 0 ? `${formatPrice(monthlyTotal)}/mois` : 'composition détaillée'}</span>
                          <small>ouvrir</small>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}
