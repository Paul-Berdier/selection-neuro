import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname, search } = req.nextUrl
  const backendPath = pathname.replace(/^\/api/, '')
  const url = `${API_URL}${backendPath}${search}`

  // Construire les headers proprement
  const headers = new Headers()
  req.headers.forEach((value, key) => {
    // Exclure les headers qui posent problème
    if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  // S'assurer que Content-Type est bien présent pour les requêtes avec body
  const isBodyMethod = !['GET', 'HEAD'].includes(req.method)
  if (isBodyMethod && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  try {
    let body: BodyInit | undefined
    if (isBodyMethod) {
      const contentType = headers.get('content-type') || ''
      if (contentType.includes('multipart/form-data')) {
        // FormData — laisser fetch gérer le boundary
        headers.delete('content-type')
        body = await req.formData()
      } else {
        body = await req.text()
      }
    }

    const res = await fetch(url, {
      method: req.method,
      headers,
      body,
    })

    const resHeaders = new Headers()
    res.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        resHeaders.set(key, value)
      }
    })

    return new NextResponse(res.body, {
      status: res.status,
      headers: resHeaders,
    })
  } catch (err) {
    console.error('Proxy error:', err)
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 })
  }
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
