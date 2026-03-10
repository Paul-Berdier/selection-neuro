'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/services/api'
import styles from '../login/page.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      await authApi.register(email, password)
      router.push('/login')
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>◆ Élixir</div>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Join Élixir today</p>

        <div className={styles.form}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            className="btn btn-primary w-full"
            onClick={handleSubmit}
            disabled={loading || !email || !password || !confirm}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </div>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link href="/login" className="text-accent">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
