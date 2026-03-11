'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import styles from './page.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      router.push('/')
    } catch (e: any) {
      setError(e.message || 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>◆ Élixir</div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        <div className={styles.form}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            className="btn btn-primary w-full"
            onClick={handleSubmit}
            disabled={loading || !email || !password}
          >
            {loading ? 'Signing in…' : 'Connexion'}
          </button>
        </div>

        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent">Create one</Link>
        </p>
      </div>
    </div>
  )
}
