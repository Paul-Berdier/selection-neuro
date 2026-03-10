'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './layout.module.css'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [token, setToken] = useState('')
  const [authed, setAuthed] = useState(false)
  const [input, setInput] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('admin_token') || ''
    if (t) { setToken(t); setAuthed(true) }
  }, [])

  if (!authed) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authLogo}>◆ Admin</div>
          <h2>Admin Access</h2>
          <input
            className="input"
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Admin token"
            onKeyDown={e => {
              if (e.key === 'Enter' && input) {
                localStorage.setItem('admin_token', input)
                setToken(input)
                setAuthed(true)
              }
            }}
          />
          <button
            className="btn btn-primary w-full"
            onClick={() => { if (input) { localStorage.setItem('admin_token', input); setToken(input); setAuthed(true) } }}
          >Enter</button>
        </div>
      </div>
    )
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
          {nav.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className={`${styles.navItem} ${pathname.startsWith(n.href) ? styles.navActive : ''}`}
            >
              <span className={styles.navIcon}>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={() => { localStorage.removeItem('admin_token'); setAuthed(false) }}>
          Sign out
        </button>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
