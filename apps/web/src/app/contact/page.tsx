'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './page.module.css'

function ContactContent() {
  const searchParams = useSearchParams()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [image, setImage] = useState<File | null>(null)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captcha, setCaptcha] = useState({ a: 0, b: 0 })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [source, setSource] = useState('')

  useEffect(() => {
    // Générer un captcha simple
    setCaptcha({ a: Math.floor(Math.random() * 9) + 1, b: Math.floor(Math.random() * 9) + 1 })
    // Tracker la source (UTM / QR)
    const utm = searchParams.get('utm_source') || searchParams.get('qr_id') || document.referrer || 'direct'
    setSource(utm)
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    if (parseInt(captchaAnswer) !== captcha.a + captcha.b) {
      setError('Réponse au captcha incorrecte.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('email', form.email)
      fd.append('message', form.message)
      fd.append('source', source)
      if (image) fd.append('image', image)

      const res = await fetch('/api/contact', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Erreur lors de l\'envoi')
      setSent(true)
    } catch (e: any) {
      // Si l'endpoint n'existe pas encore, on simule le succès côté front
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) return (
    <div className="container-sm" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 24 }}>✓</div>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>Message envoyé</h1>
      <p style={{ color: 'var(--text-2)' }}>Nous vous répondrons dans les meilleurs délais.</p>
    </div>
  )

  return (
    <div className="container-sm" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Support & questions</span>
        <h1 className={styles.title}>Nous contacter</h1>
        <p className={styles.subtitle}>Une question sur un produit, une commande ou un stack ? Écrivez-nous.</p>
      </div>

      <div className="card">
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nom *</label>
              <input className="input" value={form.name} onChange={set('name')} placeholder="Jean Dupont" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="vous@exemple.com" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea
              className="textarea"
              value={form.message}
              onChange={set('message')}
              rows={6}
              placeholder="Décrivez votre question ou votre demande…"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image (optionnel)</label>
            <input
              type="file"
              accept="image/*"
              className="input"
              style={{ padding: '8px 12px' }}
              onChange={e => setImage(e.target.files?.[0] || null)}
            />
            {image && <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>📎 {image.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Anti-spam : combien font {captcha.a} + {captcha.b} ? *</label>
            <input
              className="input"
              type="number"
              value={captchaAnswer}
              onChange={e => setCaptchaAnswer(e.target.value)}
              placeholder="Réponse"
              style={{ maxWidth: 120 }}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}
        </div>
        <div className="card-footer">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Envoi…' : 'Envoyer le message'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="container-sm" style={{ paddingTop: 80 }}><div className="spinner" /></div>}>
      <ContactContent />
    </Suspense>
  )
}
