import Link from 'next/link'
import styles from './page.module.css'

const features = [
  {
    icon: '/ui/lightning.png',
    title: 'Attention & vitesse',
    desc: 'Modules à réponse rapide pour clarté mentale, démarrage net et concentration soutenue.',
  },
  {
    icon: '/ui/clock.png',
    title: 'Endurance cognitive',
    desc: 'Architecture pensée pour une progression stable, plus durable qu’un simple pic stimulant.',
  },
  {
    icon: '/ui/network.png',
    title: 'Synergie des stacks',
    desc: 'Association de produits conçue pour jouer sur plusieurs mécanismes cérébraux en parallèle.',
  },
  {
    icon: '/ui/chart.png',
    title: 'Lecture scientifique',
    desc: 'Hiérarchie claire, dosage lisible et parcours mobile-first optimisé pour comprendre vite.',
  },
]

export default function Home() {
  return (
    <div>
      <section className={styles.heroSection}>
        <div className="container-lg">
          <div className={styles.bento}>
            <div className={`${styles.panel} ${styles.heroPanel}`}>
              <div className={styles.heroContent}>
                <span className={styles.eyebrow}>Sélection Neuro · Blagnac</span>
                <h1 className={styles.heroTitle}>
                  Glass commerce for <br />
                  <span>cognitive stacks.</span>
                </h1>
                <p className={styles.heroDesc}>
                  Refonte orientée mobile premium : bento UI, surfaces verre bleues, hiérarchie claire et accents jaunes réservés aux actions et repères clés.
                </p>
                <div className={styles.heroActions}>
                  <Link href="/products" className="btn btn-primary btn-lg">Explorer les produits</Link>
                  <Link href="/stacks" className="btn btn-secondary btn-lg">Voir les stacks</Link>
                </div>
              </div>

              <div className={styles.heroVisual}>
                <div className={styles.phoneShell}>
                  <div className={styles.phoneTopBar}>
                    <span>Menu</span>
                    <span className={styles.statusDots}><i /><i /><i /></span>
                  </div>
                  <div className={styles.phoneGrid}>
                    <div className={`${styles.phoneCard} ${styles.phoneImageCard}`}>
                      <img src="/ui/lightning.png" alt="Lightning icon" />
                      <div>
                        <strong>Focus</strong>
                        <span>Hero visuel bleu verre</span>
                      </div>
                    </div>
                    <div className={styles.phoneRow}>
                      <div className={styles.phoneMini}><img src="/ui/network.png" alt="Network icon" /></div>
                      <div className={styles.phoneMini}><img src="/ui/chart.png" alt="Chart icon" /></div>
                    </div>
                    <div className={styles.phoneTextCard}>
                      <span className={styles.cardTag}>Bento mobile</span>
                      <p>Blocs basés sur une logique de proportions harmonisées pour CTA, contenus et surfaces tactiles.</p>
                    </div>
                    <div className={styles.phoneCta}>Commencer</div>
                  </div>
                </div>
                <img className={`${styles.floatingIcon} ${styles.iconA}`} src="/ui/code.png" alt="Code icon" />
                <img className={`${styles.floatingIcon} ${styles.iconB}`} src="/ui/lock.png" alt="Lock icon" />
              </div>
            </div>

            <div className={`${styles.panel} ${styles.statsPanel}`}>
              <span className={styles.panelLabel}>Signals</span>
              <div className={styles.metric}><strong>4.8</strong><span>score de confiance</span></div>
              <div className={styles.metric}><strong>+63%</strong><span>gain de lisibilité perçue vs style précédent</span></div>
              <div className={styles.metric}><strong>48px+</strong><span>zones d’action tactiles</span></div>
              <div className={styles.metricAccent}>Accent jaune réservé aux CTA et marqueurs critiques.</div>
            </div>

            <div className={`${styles.panel} ${styles.guidelinePanel}`}>
              <span className={styles.panelLabel}>Guidelines</span>
              <ul className={styles.guidelinesList}>
                <li>Palette centrée sur les PNG bleus verre fournis.</li>
                <li>Jaune utilisé uniquement pour call-to-action, focus et badges.</li>
                <li>Panneaux glass avec bord lumineux et blur contrôlé.</li>
                <li>Disposition mobile-first type bento, pensée pour téléphone.</li>
              </ul>
            </div>

            <div className={`${styles.panel} ${styles.flowPanel}`}>
              <span className={styles.panelLabel}>UI flow</span>
              <div className={styles.flowCards}>
                <div className={styles.flowCard}><img src="/ui/lightning.png" alt="" /><span>Hero</span></div>
                <div className={styles.flowArrow}>→</div>
                <div className={styles.flowCard}><img src="/ui/network.png" alt="" /><span>Catalogue</span></div>
                <div className={styles.flowArrow}>→</div>
                <div className={styles.flowCard}><img src="/ui/lock.png" alt="" /><span>Checkout</span></div>
              </div>
            </div>

            <div className={`${styles.panel} ${styles.boardPanel}`}>
              <img src="/ui/style-board.png" alt="Moodboard bleu verre" className={styles.boardImage} />
              <div className={styles.boardOverlay}>
                <span className={styles.panelLabel}>Direction</span>
                <p>Référence visuelle : surfaces translucides, profondeur bleue, reflets froids et ponctuation jaune minimale.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`section ${styles.featuresSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Best UI & UX methods 2026</span>
            <h2>Une base premium, cohérente et scalable</h2>
            <p>Le système visuel tourne uniquement autour des bleus verre fournis, avec un accent jaune très contrôlé pour garder la hiérarchie nette.</p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature) => (
              <div key={feature.title} className={styles.featureCard}>
                <div className={styles.featureIconWrap}>
                  <img src={feature.icon} alt="" className={styles.featureIcon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.ctaSection}`}>
        <div className="container-sm">
          <div className={styles.ctaCard}>
            <span className={styles.eyebrow}>Build pattern</span>
            <h2>Unifier produits, stacks et compte client dans une même logique glass.</h2>
            <p>Le thème garde un langage visuel unique sur desktop et mobile, avec modules réutilisables, contrastes plus propres et expérience plus premium.</p>
            <div className={styles.ctaActions}>
              <Link href="/products" className="btn btn-primary">Catalogue</Link>
              <Link href="/stacks" className="btn btn-secondary">Architecture des stacks</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
