'use client'

import { useState } from 'react'
import { addressApi } from '@/services/api'
import type { Address, AddressIn } from '@/types'

interface Props {
  initial?: Address
  onSuccess: (address: Address) => void
  onCancel?: () => void
}

const COUNTRIES: { code: string; label: string }[] = [
  { code: 'FR', label: '🇫🇷 France' },
  { code: 'BE', label: '🇧🇪 Belgique' },
  { code: 'CH', label: '🇨🇭 Suisse' },
  { code: 'LU', label: '🇱🇺 Luxembourg' },
  { code: 'DE', label: '🇩🇪 Allemagne' },
  { code: 'ES', label: '🇪🇸 Espagne' },
  { code: 'IT', label: '🇮🇹 Italie' },
  { code: 'PT', label: '🇵🇹 Portugal' },
  { code: 'NL', label: '🇳🇱 Pays-Bas' },
  { code: 'AT', label: '🇦🇹 Autriche' },
  { code: 'GB', label: '🇬🇧 Royaume-Uni' },
  { code: 'US', label: '🇺🇸 États-Unis' },
  { code: 'CA', label: '🇨🇦 Canada' },
]

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span style={{ color: 'var(--accent)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export default function AddressForm({ initial, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<AddressIn>({
    label: initial?.label || '',
    full_name: initial?.full_name || '',
    line1: initial?.line1 || '',
    line2: initial?.line2 || '',
    city: initial?.city || '',
    postal_code: initial?.postal_code || '',
    country: initial?.country || 'FR',
    phone: initial?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof AddressIn) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const isValid = form.label && form.full_name && form.line1 && form.city && form.postal_code && form.country

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true)
    setError('')
    try {
      let addr: Address
      if (initial) {
        addr = await addressApi.update(initial.id, form) as Address
      } else {
        addr = await addressApi.create(form) as Address
      }
      onSuccess(addr)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Libellé */}
      <Field label="Libellé" required>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Domicile', 'Bureau', 'Autre'].map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setForm(p => ({ ...p, label: preset }))}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: form.label === preset ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                background: form.label === preset ? 'rgba(255,214,102,0.08)' : 'transparent',
                color: form.label === preset ? 'var(--accent)' : 'var(--text-2)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: form.label === preset ? 600 : 400,
              }}
            >
              {preset}
            </button>
          ))}
        </div>
        <input
          className="input"
          style={{ marginTop: 8 }}
          value={form.label}
          onChange={set('label')}
          placeholder="ou saisir un libellé personnalisé"
        />
      </Field>

      {/* Nom complet */}
      <Field label="Nom complet" required>
        <input className="input" value={form.full_name} onChange={set('full_name')} placeholder="Jean Dupont" />
      </Field>

      {/* Adresses */}
      <Field label="Adresse" required>
        <input
          className="input"
          value={form.line1}
          onChange={set('line1')}
          placeholder="123 rue de la Paix"
          style={{ marginBottom: 8 }}
        />
        <input
          className="input"
          value={form.line2}
          onChange={set('line2')}
          placeholder="Appartement, bâtiment, étage (optionnel)"
        />
      </Field>

      {/* Ville / CP */}
      <div className="form-grid">
        <Field label="Code postal" required>
          <input
            className="input"
            value={form.postal_code}
            onChange={set('postal_code')}
            placeholder="75001"
            maxLength={10}
            inputMode="numeric"
          />
        </Field>
        <Field label="Ville" required>
          <input className="input" value={form.city} onChange={set('city')} placeholder="Paris" />
        </Field>
      </div>

      {/* Pays / Téléphone */}
      <div className="form-grid">
        <Field label="Pays" required>
          <select className="select" value={form.country} onChange={set('country')}>
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Téléphone">
          <input
            className="input"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+33 6 00 00 00 00"
            inputMode="tel"
          />
        </Field>
      </div>

      {/* Règle livraison — rappel ferme */}
      <div style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        fontSize: 12,
        color: 'var(--text-3)',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start',
      }}>
        <span>🚚</span>
        <span>
          <strong style={{ color: 'var(--text-2)' }}>Livraison 10€</strong> sur toute commande inférieure à 30€.
          Offerte automatiquement dès 30€ de panier.
        </span>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        {onCancel && (
          <button className="btn btn-ghost" onClick={onCancel} type="button">Annuler</button>
        )}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !isValid}
          style={{ flex: 1 }}
        >
          {loading ? 'Enregistrement…' : initial ? 'Mettre à jour l\'adresse' : 'Enregistrer l\'adresse'}
        </button>
      </div>
    </div>
  )
}
