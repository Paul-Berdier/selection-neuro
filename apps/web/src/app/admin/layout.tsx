'use client'

import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { useAuth } from '@/hooks/useAuth'
import styles from './layout.module.css'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/login')
      return
    }

    if (!user.is_admin) {
      router.replace('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authLogo}>◆ Admin</div>
          <h2>Loading…</h2>
        </div>
      </div>
    )
  }

  if (!user || !user.is_admin) {
    return null
  }

  const nav = [
    { href: '/admin/orders', label: 'Orders', icon: '◈' },
    { href: '/admin/products', label: 'Products', icon: '◉' },
    { href: '/admin/inventory', label: 'Inventory', icon: '◌' },
  ]

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>◆ Admin</div>

        <nav className={styles.sidebarNav}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname.startsWith(item.href) ? styles.navActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className={styles.logoutBtn}
          onClick={() => {
            logout()
            router.replace('/login')
          }}
        >
          Sign out
        </button>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  )
}