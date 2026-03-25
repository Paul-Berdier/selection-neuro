import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.9"/>
              <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.5"/>
              <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.5"/>
              <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.2"/>
            </svg>
            <span>Labstock</span>
          </div>
          <p>Actifs nootropiques à doses cliniques. Prix au kilo transparent. Zéro intermédiaire.</p>
          <p className={styles.disclaimer}>
            Informations à titre informatif uniquement — pas un avis médical.
            Consultez un professionnel de santé avant toute supplémentation.
          </p>
        </div>
        <div className={styles.links}>
          <div>
            <h4>Catalogue</h4>
            <Link href="/products">Tous les actifs</Link>
            <Link href="/stacks">Stacks</Link>
          </div>
          <div>
            <h4>Compte</h4>
            <Link href="/account/orders">Commandes</Link>
            <Link href="/account/addresses">Adresses</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} Labstock — Blagnac, Haute-Garonne</span>
      </div>
    </footer>
  )
}
