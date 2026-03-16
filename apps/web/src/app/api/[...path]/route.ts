import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000'

async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname, search } = req.nextUrl
  const backendPath = pathname.replace(/^\/api/, '')
  const url = `${API_URL}${backendPath}${search}`

  const headers = new Headers(req.headers)
  headers.delete('host')

  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      // @ts-ignore
      duplex: 'half',
    })

    return new NextResponse(res.body, {
      status: res.status,
      headers: new Headers(res.headers),
    })
  } catch {
    return NextResponse.json({ error: 'Backend unreachable' }, { status: 502 })
  }
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy