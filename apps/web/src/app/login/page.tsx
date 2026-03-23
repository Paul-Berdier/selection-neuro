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
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const registered = searchParams.get('registered') === '1'

  const validate = (): string | null => {
    if (!email.trim()) return 'Veuillez saisir votre email.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email invalide.'
    if (!password) return 'Veuillez saisir votre mot de passe.'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    setError('')
    try {
      await login(email.trim().toLowerCase(), password)
      const redirectTo = searchParams.get('next')
      router.push(redirectTo || '/')
    } catch (e: any) {
      const msg = e.message || ''
      if (msg.includes('401') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
        setError('Email ou mot de passe incorrect.')
      } else {
        setError(msg || 'Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>◆ Sélection Neuro</div>
        <h1 className={styles.title}>Bon retour</h1>
        <p className={styles.subtitle}>Connexion à votre compte</p>
        {registered && (
          <div style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(82,208,168,0.08)', border: '1px solid rgba(82,208,168,0.25)', color: 'var(--success)', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>
            ✓ Compte créé avec succès — connectez-vous.
          </div>
        )}

        <div className={styles.form}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="vous@exemple.com"
              autoComplete="email"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Mot de passe</label>
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              autoComplete="current-password"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && (
            <div className={styles.errorBox}>
              <span>⚠</span> {error}
            </div>
          )}

          <button
            className="btn btn-primary w-full"
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            style={{ height: 48, fontSize: 15 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span className={styles.spinner} /> Connexion…
              </span>
            ) : 'Se connecter'}
          </button>
        </div>

        <div className={styles.dividerRow}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>nouveau ici ?</span>
          <span className={styles.dividerLine} />
        </div>

        <Link href="/register" className={`btn btn-ghost w-full ${styles.registerBtn}`}>
          Créer un compte
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
