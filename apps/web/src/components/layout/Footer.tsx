import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoMark} />
            <div>
              <span className={styles.logoName}>Sélection Neuro</span>
              <span className={styles.logoSub}>Blagnac — Vente directe</span>
            </div>
          </div>
          <p>Soutien cognitif non médicamenteux — formes actives, dosages fonctionnels, zéro intermédiaire.</p>
          <p className={styles.disclaimer}>
            Les informations présentes sont à titre informatif et ne constituent pas un avis médical.
            Consultez un professionnel de santé qualifié avant toute supplémentation.
          </p>
        </div>
        <div className={styles.links}>
          <div>
            <h4>Catalogue</h4>
            <Link href="/products">Tous les produits</Link>
            <Link href="/stacks">Stacks</Link>
          </div>
          <div>
            <h4>Mon compte</h4>
            <Link href="/account/orders">Mes commandes</Link>
            <Link href="/account/addresses">Adresses</Link>
          </div>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} Sélection Neuro — Blagnac</span>
        <span className={styles.bottomRight}>Toulouse · Haute-Garonne</span>
      </div>
    </footer>
  )
}
