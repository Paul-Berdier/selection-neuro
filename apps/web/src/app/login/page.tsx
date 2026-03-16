'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { useAuth } from '@/hooks/useAuth'
import styles from './page.module.css'

function LoginContent() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      await login(email, password)

      const redirectTo = searchParams.get('next')
      router.push(redirectTo || '/')
    } catch (e: any) {
      setError(e.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>Selection Neuro</div>
        <h1 className={styles.title}>Bon retour</h1>
        <p className={styles.subtitle}>Connexion au compte</p>

        <div className={styles.form}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            className="btn btn-primary w-full"
            onClick={handleSubmit}
            disabled={loading || !email || !password}
          >
            {loading ? 'Inscription…' : 'Connexion'}
          </button>
        </div>

        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

function LoginFallback() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>Sélection neuro</div>
        <h1 className={styles.title}>Bon retour</h1>
        <p className={styles.subtitle}>Chargement…</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  )
}