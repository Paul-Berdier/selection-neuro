'use client'

import { Suspense } from 'react'
import { useUTMCapture } from '@/hooks/useUTM'

function UTMCaptureInner() {
  useUTMCapture()
  return null
}

export default function UTMCapture() {
  return (
    <Suspense fallback={null}>
      <UTMCaptureInner />
    </Suspense>
  )
}
