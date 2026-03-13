import Link from 'next/link'
import styles from './page.module.css'

const pillars = [
  {
    title: 'Focus stack',
    desc: 'Citicoline, L-Tyrosine et créatine pour une interface pensée pour la clarté, la vitesse et les décisions nettes.',
  },
  {
    title: 'Mémoire & récupération',
    desc: 'Bacopa, DHA et magnésium pour soutenir l’encodage, la stabilité cognitive et la récupération mentale.',
  },
  {
    title: 'Neuroplasticité',
    desc: 'Lion’s Mane, uridine et cofacteurs pour une logique de stack orientée adaptation, structure et continuité.',
  },
]

const proof = [
  { value: '44+', label: 'cibles tactiles confortables' },
  { value: '3', label: 'actions max par zone clé' },
  { value: '1.618', label: 'rythme de proportions bento / CTA' },
]

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <div className="container-lg">
          <div className={styles.heroShell}>
            <div className={styles.heroIntro}>
              <span className={styles.kicker}>Sélection Neuro · mobile first · glass bento</span>
              <h1 className={styles.title}>
                Une vitrine <span>premium</span>
                <br /> pensée d’abord pour le téléphone.
              </h1>
              <p className={styles.lead}>
                Refonte vers une UI bento en panneaux de verre, centrée sur une lecture mobile rapide,
                des parcours courts et une hiérarchie visuelle plus nette autour d’un bleu électrique
                avec accents jaunes.
              </p>

              <div className={styles.actionRow}>
                <Link href="/products" className="btn btn-primary btn-lg">Explorer les produits</Link>
                <Link href="/stacks" className="btn btn-secondary btn-lg">Voir les stacks</Link>
              </div>

              <div className={styles.signalRow}>
                <span className={styles.signal}>Mobile-first layout</span>
                <span className={styles.signal}>Glass depth</span>
                <span className={styles.signal}>Fast scanning</span>
              </div>
            </div>

            <div className={styles.phoneStage}>
              <div className={styles.orbOne} />
              <div className={styles.orbTwo} />
              <div className={styles.phoneFrame}>
                <div className={styles.phoneTopBar}>
                  <span className={styles.phoneDot} />
                  <span className={styles.phoneStatus}>09:41</span>
                  <span className={styles.phoneMiniPill}>Live</span>
                </div>

                <div className={styles.phoneHeroCard}>
                  <div>
                    <span className={styles.cardEyebrow}>Stack recommandé</span>
                    <h2>Performance Cognitive</h2>
                    <p>Lisible en 3 secondes, actionnable en 1 geste.</p>
                  </div>
                  <div className={styles.heroGauge}>
                    <span>68,7€</span>
                    <small>/ mois</small>
                  </div>
                </div>

                <div className={styles.miniGrid}>
                  <div className={styles.miniCardTall}>
                    <span className={styles.cardEyebrow}>Bénéfices</span>
                    <ul>
                      <li>Focus</li>
                      <li>Mémoire</li>
                      <li>Énergie</li>
                    </ul>
                  </div>
                  <div className={styles.miniCard}>
                    <span className={styles.cardEyebrow}>Score</span>
                    <strong>4.8/5</strong>
                  </div>
                  <div className={styles.miniCard}>
                    <span className={styles.cardEyebrow}>Actifs</span>
                    <strong>7</strong>
                  </div>
                </div>

                <div className={styles.bottomTray}>
                  <div className={styles.tabActive}>Accueil</div>
                  <div className={styles.tab}>Catalogue</div>
                  <div className={styles.tab}>Compte</div>
                </div>
              </div>
            </div>

            <div className={styles.sideStack}>
              <div className={styles.infoCard}>
                <span className={styles.cardEyebrow}>UX intent</span>
                <h3>Hiérarchie simple</h3>
                <p>Une zone dominante, deux actions principales, puis des cartes secondaires compactes.</p>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.cardEyebrow}>Color system</span>
                <h3>Bleu verre + halo jaune</h3>
                <p>Base sombre, panneaux translucides, reflets cobalt et points d’accent pour guider l’œil.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.metricsSection}>
        <div className="container-lg">
          <div className={styles.metricsGrid}>
            {proof.map((item) => (
              <div key={item.label} className={styles.metricCard}>
                <span>{item.value}</span>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.bentoSection}>
        <div className="container-lg">
          <div className={styles.bentoGrid}>
            <div className={`${styles.panel} ${styles.panelLarge}`}>
              <span className={styles.cardEyebrow}>Architecture produit</span>
              <h2>Une home structurée comme une fiche premium.</h2>
              <p>
                Le bloc principal pousse la proposition de valeur, la maquette téléphone sert de preuve visuelle,
                et les cartes autour raccourcissent le temps de compréhension.
              </p>
              <div className={styles.panelTags}>
                <span>Scan rapide</span>
                <span>Contraste maîtrisé</span>
                <span>CTA visible</span>
                <span>Sections courtes</span>
              </div>
            </div>

            <div className={`${styles.panel} ${styles.panelTall}`}>
              <span className={styles.cardEyebrow}>Parcours mobile</span>
              <div className={styles.timeline}>
                <div>
                  <strong>01</strong>
                  <p>Promesse claire en tête de page</p>
                </div>
                <div>
                  <strong>02</strong>
                  <p>Preuve visuelle + prix immédiatement visibles</p>
                </div>
                <div>
                  <strong>03</strong>
                  <p>Navigation courte vers produits et stacks</p>
                </div>
              </div>
            </div>

            {pillars.map((item) => (
              <div key={item.title} className={styles.panel}>
                <span className={styles.cardEyebrow}>Stack logic</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container-sm">
          <div className={styles.ctaCard}>
            <span className={styles.kicker}>Sélection Neuro · glass mobile storefront</span>
            <h2>Une base plus forte pour continuer tout le site.</h2>
            <p>
              La home pose désormais une direction cohérente pour décliner catalogue, fiches produit,
              panier et checkout avec le même langage visuel.
            </p>
            <div className={styles.actionRowCenter}>
              <Link href="/products" className="btn btn-primary">Ouvrir le catalogue</Link>
              <Link href="/stacks" className="btn btn-secondary">Comparer les stacks</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
