import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>◆ Élixir</span>
          <p>Science-backed supplements, expertly curated for performance and longevity.</p>
        </div>
        <div className={styles.links}>
          <div>
            <h4>Shop</h4>
            <Link href="/products">All Products</Link>
            <Link href="/stacks">Stacks</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link href="/account/orders">My Orders</Link>
            <Link href="/account/addresses">Addresses</Link>
          </div>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} Élixir. All rights reserved.</span>
      </div>
    </footer>
  )
}
