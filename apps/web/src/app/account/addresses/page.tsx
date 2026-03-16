'use client'

import { useState, useEffect } from 'react'
import { addressApi } from '@/services/api'
import type { Address } from '@/types'
import AddressForm from '@/components/address/AddressForm'
import styles from './page.module.css'

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Address | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = () => addressApi.list().then((a: any) => { setAddresses(a); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleDelete = async (id: number) => {
    setDeleting(id)
    try { await addressApi.delete(id); setAddresses(prev => prev.filter(a => a.id !== id)) }
    finally { setDeleting(null) }
  }

  return (
    <div className="container-sm" style={{ paddingTop: 60, paddingBottom: 80 }}>
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Mes adresses</h1>
          <p className="page-subtitle">Gérez vos adresses enregistrées</p>
        </div>
        <button className="btn btn-secondary" onClick={() => { setCreating(true); setEditing(null) }}>
          + Ajouter une adresse
        </button>
      </div>

      {creating && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Nouvelle adresse</h3></div>
          <div className="card-body">
            <AddressForm
              onSuccess={a => { setAddresses(prev => [a, ...prev]); setCreating(false) }}
              onCancel={() => setCreating(false)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 4 }} />
          ))}
        </div>
      ) : addresses.length === 0 && !creating ? (
        <div className={styles.empty}>
          <p>Aucune adresse enregistrée.</p>
          <button className="btn btn-primary" onClick={() => setCreating(true)}>Ajouter une adresse</button>
        </div>
      ) : (
        <div className={styles.list}>
          {addresses.map(a => (
            <div key={a.id} className="card">
              {editing?.id === a.id ? (
                <>
                  <div className="card-header"><h3>Modifier l&apos;adresse</h3></div>
                  <div className="card-body">
                    <AddressForm
                      initial={a}
                      onSuccess={updated => { setAddresses(prev => prev.map(x => x.id === updated.id ? updated : x)); setEditing(null) }}
                      onCancel={() => setEditing(null)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="card-body">
                    <div className={styles.addressCard}>
                      <div>
                        <span className={styles.addressLabel}>{a.label}</span>
                        <p className={styles.addressName}>{a.full_name}</p>
                        <p className={styles.addressLines}>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                        <p className={styles.addressLines}>{a.postal_code} {a.city}, {a.country}</p>
                        {a.phone && <p className={styles.addressLines}>{a.phone}</p>}
                      </div>
                      <div className={styles.addressActions}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(a)}>Modifier</button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(a.id)}
                          disabled={deleting === a.id}
                        >
                          {deleting === a.id ? '…' : 'Supprimer'}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
