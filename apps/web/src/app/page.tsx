import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>Premium Supplements</span>
            <h1 className={styles.heroTitle}>
              Elevate your<br />
              <em>performance</em>
            </h1>
            <p className={styles.heroDesc}>
              Science-backed formulations, meticulously sourced. Every product in our collection is chosen for efficacy, purity, and purpose.
            </p>
            <div className={styles.heroActions}>
              <Link href="/products" className="btn btn-primary btn-lg">Shop Now</Link>
              <Link href="/stacks" className="btn btn-secondary btn-lg">View Stacks</Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.orb} />
            <div className={styles.orbInner} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={`section ${styles.features}`}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {[
              { icon: '◈', title: 'Third-Party Tested', desc: 'Every batch verified by independent labs for purity and potency.' },
              { icon: '◉', title: 'Expert Curated', desc: 'Stacks designed with precision based on clinical research.' },
              { icon: '◌', title: 'Transparent Sourcing', desc: 'Full traceability from ingredient origin to finished product.' },
              { icon: '◍', title: 'Subscription Ready', desc: 'Monthly plans with full flexibility — pause, skip, or cancel.' },
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
            <h2>Ready to begin?</h2>
            <p>Explore our curated stacks built for specific goals — sleep, performance, cognition, longevity.</p>
            <Link href="/stacks" className="btn btn-primary">Explore Stacks</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
