'use client'

import { useState } from 'react'
import { addressApi } from '@/services/api'
import type { Address, AddressIn } from '@/types'

interface Props {
  initial?: Address
  onSuccess: (address: Address) => void
  onCancel?: () => void
}

const COUNTRIES = ['FR', 'DE', 'GB', 'ES', 'IT', 'BE', 'NL', 'PT', 'CH', 'AT', 'US', 'CA']

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

  const handleSubmit = async () => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="form-group">
        <label className="form-label">Libellé (ex. Domicile, Bureau)</label>
        <input className="input" value={form.label} onChange={set('label')} placeholder="Domicile" />
      </div>
      <div className="form-group">
        <label className="form-label">Nom complet</label>
        <input className="input" value={form.full_name} onChange={set('full_name')} placeholder="Jean Dupont" />
      </div>
      <div className="form-group">
        <label className="form-label">Adresse ligne 1</label>
        <input className="input" value={form.line1} onChange={set('line1')} placeholder="123 rue de la Paix" />
      </div>
      <div className="form-group">
        <label className="form-label">Adresse ligne 2 (optionnel)</label>
        <input className="input" value={form.line2} onChange={set('line2')} placeholder="Apt, Bâtiment, etc." />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Ville</label>
          <input className="input" value={form.city} onChange={set('city')} placeholder="Paris" />
        </div>
        <div className="form-group">
          <label className="form-label">Code postal</label>
          <input className="input" value={form.postal_code} onChange={set('postal_code')} placeholder="75001" />
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Pays</label>
          <select className="select" value={form.country} onChange={set('country')}>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Téléphone (optionnel)</label>
          <input className="input" value={form.phone} onChange={set('phone')} placeholder="+33 6 00 00 00 00" />
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div style={{ display: 'flex', gap: 10 }}>
        {onCancel && (
          <button className="btn btn-ghost" onClick={onCancel} type="button">Annuler</button>
        )}
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || !form.label || !form.full_name || !form.line1 || !form.city || !form.postal_code}
        >
          {loading ? 'Enregistrement…' : initial ? 'Modifier l\'adresse' : 'Enregistrer l\'adresse'}
        </button>
      </div>
    </div>
  )
}
