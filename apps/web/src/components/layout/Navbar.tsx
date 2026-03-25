'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const pathname = usePathname()
  const totalItems = cart?.total_items ?? 0

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.logoIcon}>
            <rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.9"/>
            <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.5"/>
            <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.5"/>
            <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.2"/>
          </svg>
          <span className={styles.logoName}>Labstock</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/products" className={pathname.startsWith('/products') ? styles.active : ''}>Actifs</Link>
          <Link href="/stacks" className={pathname.startsWith('/stacks') ? styles.active : ''}>Stacks</Link>
          <Link href="/contact" className={pathname.startsWith('/contact') ? styles.active : ''}>Contact</Link>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <>
              <Link href="/account/orders" className={styles.iconBtn} title="Commandes">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 10h8M8 14h5"/>
                </svg>
              </Link>
              {user.is_admin && (
                <Link href="/admin/products" className={styles.iconBtn} title="Admin">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </Link>
              )}
              <button onClick={logout} className={styles.iconBtn} title="Déconnexion">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </>
          ) : (
            <Link href="/login" className={`btn btn-secondary btn-sm ${styles.loginBtn}`}>Connexion</Link>
          )}

          <Link href="/cart" className={styles.cartBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </Link>
        </div>
      </div>
    </header>
  )
}
