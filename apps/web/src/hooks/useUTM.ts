'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Capture les paramètres UTM et QR dès la première visite
 * et les persiste dans localStorage pour attribution jusqu'à la conversion.
 */
export function useUTMCapture() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const params = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'qr_id']
    const captured: Record<string, string> = {}

    params.forEach(key => {
      const val = searchParams.get(key)
      if (val) captured[key] = val
    })

    if (Object.keys(captured).length > 0) {
      // Ne pas écraser si déjà capturé (first-touch attribution)
      const existing = localStorage.getItem('sn_attribution')
      if (!existing) {
        captured['captured_at'] = new Date().toISOString()
        captured['landing_page'] = window.location.pathname
        localStorage.setItem('sn_attribution', JSON.stringify(captured))
      }
    }
  }, [searchParams])
}

export function getAttribution(): Record<string, string> | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('sn_attribution')
  return raw ? JSON.parse(raw) : null
}
