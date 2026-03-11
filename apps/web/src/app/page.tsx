import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <div>
      {/* Bento Hero */}
      <section className={styles.bentoSection}>
        <div className="container-lg">
          <div className={styles.bento}>

            {/* Cell 1 — Main hero (spans 2 cols) */}
            <div className={`${styles.bentoCell} ${styles.bentoHero}`}>
              <span className={styles.eyebrow}>Sélection Neuro — Blagnac</span>
              <h1 className={styles.heroTitle}>
                Cognition<br />
                <em>optimisée.</em>
              </h1>
              <p className={styles.heroDesc}>
                Une sélection des meilleurs produits de soutien cognitif non médicamenteux — formes actives, dosages fonctionnels.
              </p>
              <div className={styles.heroActions}>
                <Link href="/products" className="btn btn-primary btn-lg">Explorer les produits</Link>
                <Link href="/stacks" className="btn btn-secondary btn-lg">Voir les stacks →</Link>
              </div>
            </div>

            {/* Cell 2 — Stats tall (right, spans 2 rows) */}
            <div className={`${styles.bentoCell} ${styles.bentoStats}`}>
              <span className={styles.cellLabel}>Social proof</span>
              <div className={styles.statBlock}>
                <span className={styles.statStars}>★★★★★</span>
                <span className={styles.statNum}>4.8</span>
                <span className={styles.statDesc}>sur 5 · 12 utilisateurs</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statBlock}>
                <span className={styles.statNum}>16</span>
                <span className={styles.statDesc}>produits disponibles</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statBlock}>
                <span className={styles.statNum}>21</span>
                <span className={styles.statDesc}>études scientifiques référencées</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statBlock}>
                <span className={styles.statAccent}>–63%</span>
                <span className={styles.statDesc}>vs prix en commerce (stack premium)</span>
              </div>
            </div>

            {/* Cell 3 — Prix */}
            <div className={`${styles.bentoCell} ${styles.bentoPrix}`}>
              <span className={styles.cellLabel}>Stack Premium / mois</span>
              <div className={styles.priceCompare}>
                <div className={styles.priceOld}>
                  <span className={styles.priceVal}>~184€</span>
                  <span className={styles.priceTag}>commerce</span>
                </div>
                <div className={styles.priceArrow}>→</div>
                <div className={styles.priceNew}>
                  <span className={styles.priceVal}>68,7€</span>
                  <span className={styles.priceTag}>ici</span>
                </div>
              </div>
              <Link href="/stacks" className={styles.cellLink}>Voir la composition →</Link>
            </div>

            {/* Cell 4 — Approach */}
            <div className={`${styles.bentoCell} ${styles.bentoApproach}`}>
              <span className={styles.cellLabel}>Notre approche</span>
              <ul className={styles.approachList}>
                <li><span className={styles.approachDot} />Formes actives à biodisponibilité maximale</li>
                <li><span className={styles.approachDot} />Dosages alignés sur les essais cliniques</li>
                <li><span className={styles.approachDot} />Zéro intermédiaire — prix coûtant</li>
                <li><span className={styles.approachDot} />Études scientifiques accessibles par produit</li>
              </ul>
            </div>

            {/* Cell 5 — Stack preview */}
            <div className={`${styles.bentoCell} ${styles.bentoStackPreview}`}>
              <span className={styles.cellLabel}>Stack Nootropique Premium</span>
              <div className={styles.stackPills}>
                {['Citicoline 1g', 'DHA 600mg', "Lion's Mane 2g", 'Bacopa 300mg', 'Créatine 5g', 'Cordyceps 2g', 'Vit B9/B12'].map(p => (
                  <span key={p} className={styles.pill}>{p}</span>
                ))}
              </div>
              <Link href="/stacks" className={styles.cellLink}>Voir les stacks →</Link>
            </div>

            {/* Cell 6 — Voie Kennedy */}
            <div className={`${styles.bentoCell} ${styles.bentoKennedy}`}>
              <span className={styles.kennedyLabel}>Voie Kennedy</span>
              <div className={styles.kennedyFlow}>
                <span className={styles.kennedyNode}>Citicoline</span>
                <span className={styles.kennedyArrow}>+</span>
                <span className={styles.kennedyNode}>DHA</span>
                <span className={styles.kennedyArrow}>+</span>
                <span className={styles.kennedyNode}>Uridine</span>
              </div>
              <p className={styles.kennedyDesc}>Synaptogenèse & membranes neuronales</p>
            </div>

          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className={`section ${styles.features}`}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {[
              { icon: '⚡', title: 'Attention & vitesse', desc: 'Citicoline, L-Tyrosine, Créatine — réactivité et concentration soutenue.' },
              { icon: '🧠', title: 'Mémoire & consolidation', desc: 'Bacopa, Magnésium L-thréonate, DHA — encodage et rappel.' },
              { icon: '🌱', title: 'Neuroplasticité', desc: "Lion's Mane (NGF), Uridine, Ginkgo — plasticité et régénération." },
              { icon: '🛡', title: 'Neuroprotection', desc: 'Vitamines B, Spiruline, Magnésium — protection long terme.' },
            ].map(f => (
              <div key={f.title} className={styles.feature}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`section ${styles.cta}`}>
        <div className="container-sm">
          <div className={styles.ctaCard}>
            <span className={styles.ctaEyebrow}>Blagnac · Toulouse · Vente directe</span>
            <h2>Prêt à optimiser votre cognition ?</h2>
            <p>Explorez nos stacks formulés à partir de la littérature scientifique — ou composez le vôtre.</p>
            <div className={styles.ctaActions}>
              <Link href="/stacks" className="btn btn-primary">Explorer les stacks</Link>
              <Link href="/products" className="btn btn-secondary">Tous les produits</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
