'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/services/api'
import styles from '../login/page.module.css'

const PASSWORD_MIN = 8

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    password.length >= PASSWORD_MIN,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const colors = ['#ff7c8d', '#ffd666', '#ffd666', '#52d0a8']
  const labels = ['Faible', 'Moyen', 'Bon', 'Fort']
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? colors[score - 1] : 'var(--border)',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      {password && (
        <span style={{ fontSize: 11, color: colors[score - 1] || 'var(--text-3)' }}>
          {labels[score - 1] || 'Trop court'}
        </span>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validate = (): string | null => {
    if (!email.trim()) return 'Veuillez saisir votre email.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Adresse email invalide.'
    if (password.length < PASSWORD_MIN) return `Le mot de passe doit faire au moins ${PASSWORD_MIN} caractères.`
    if (password !== confirm) return 'Les mots de passe ne correspondent pas.'
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    setError('')
    try {
      await authApi.register(email.trim().toLowerCase(), password)
      setSuccess(true)
      setTimeout(() => router.push('/login?registered=1'), 1800)
    } catch (e: any) {
      const msg = e.message || ''
      if (msg.includes('409') || msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered')) {
        setError('Cette adresse email est déjà utilisée.')
      } else if (msg.includes('422')) {
        setError('Données invalides. Vérifiez votre email et votre mot de passe.')
      } else {
        setError(msg || 'Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.successIcon}>✓</div>
        <h1 className={styles.title}>Compte créé !</h1>
        <p className={styles.subtitle}>Redirection vers la connexion…</p>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>◆ Sélection Neuro</div>
        <h1 className={styles.title}>Créer un compte</h1>
        <p className={styles.subtitle}>Accédez à votre espace personnel</p>

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
              <label className="form-label" style={{ marginBottom: 0 }}>
                Mot de passe <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(min. {PASSWORD_MIN} car.)</span>
              </label>
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
              placeholder="Au moins 8 caractères"
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmer le mot de passe</label>
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError('') }}
              placeholder="••••••••"
              autoComplete="new-password"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            {confirm && password && confirm !== password && (
              <span style={{ fontSize: 11, color: 'var(--error)', marginTop: 4, display: 'block' }}>
                Les mots de passe ne correspondent pas.
              </span>
            )}
            {confirm && password && confirm === password && (
              <span style={{ fontSize: 11, color: 'var(--success)', marginTop: 4, display: 'block' }}>
                ✓ Correspond
              </span>
            )}
          </div>

          {error && (
            <div className={styles.errorBox}>
              <span>⚠</span> {error}
            </div>
          )}

          <button
            className="btn btn-primary w-full"
            onClick={handleSubmit}
            disabled={loading || !email || !password || !confirm}
            style={{ height: 48, fontSize: 15 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span className={styles.spinner} /> Création…
              </span>
            ) : 'Créer le compte'}
          </button>
        </div>

        <div className={styles.dividerRow}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>déjà inscrit ?</span>
          <span className={styles.dividerLine} />
        </div>

        <Link href="/login" className={`btn btn-ghost w-full ${styles.registerBtn}`}>
          Se connecter
        </Link>
      </div>
    </div>
  )
}
