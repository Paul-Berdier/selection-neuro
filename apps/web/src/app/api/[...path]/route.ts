import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname, search } = req.nextUrl
  const backendPath = pathname.replace(/^\/api/, '')
  const url = `${API_URL}${backendPath}${search}`

  const isBodyMethod = !['GET', 'HEAD'].includes(req.method)

  // Construire les headers en excluant ceux qui causent des problèmes
  const headers = new Headers()
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (['host', 'connection', 'transfer-encoding', 'content-length'].includes(lower)) return
    headers.set(key, value)
  })

  try {
    let body: BodyInit | undefined
    if (isBodyMethod) {
      const contentType = req.headers.get('content-type') || ''
      if (contentType.includes('multipart/form-data')) {
        // FormData — laisser fetch recalculer le content-length et boundary
        headers.delete('content-type')
        body = await req.formData()
      } else {
        body = await req.text()
        if (body) {
          headers.set('content-type', 'application/json')
        }
      }
    }

    const res = await fetch(url, { method: req.method, headers, body })

    const resHeaders = new Headers()
    res.headers.forEach((value, key) => {
      if (['transfer-encoding', 'connection'].includes(key.toLowerCase())) return
      resHeaders.set(key, value)
    })

    return new NextResponse(res.body, { status: res.status, headers: resHeaders })
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