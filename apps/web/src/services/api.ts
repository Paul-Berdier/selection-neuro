// ─────────────────────────────────────────────────────────────────────────────
// API client — utilise le proxy /api/* (next.config.js rewrites)
// Le browser appelle toujours le même domaine HTTPS → zéro mixed-content.
//
// Railway : définir  API_URL  (server-side, PAS NEXT_PUBLIC_)
//   ex: http://selection-neuro.railway.internal:8080
// ─────────────────────────────────────────────────────────────────────────────

const BASE = '/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

// ── Requête générique ─────────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Requête échouée' }))
    throw new Error(err.detail || 'Requête échouée')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// Requête FormData (multipart) — sans Content-Type (laissé au browser)
async function requestForm<T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH',
  body: FormData,
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { method, headers, body })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Requête échouée' }))
    throw new Error(err.detail || 'Requête échouée')
  }
  return res.json()
}

// Construit un query-string en ignorant les valeurs null/undefined
function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v != null)
    .map(([k, v]) => [k, String(v)])
  return entries.length ? '?' + new URLSearchParams(entries).toString() : ''
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, full_name?: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, full_name }) }),
  me: () => request('/auth/me', {}, true),
}

// ── Products (public) ─────────────────────────────────────────────────────────
export const productApi = {
  list: (params?: Record<string, string | number | null | undefined>) =>
    request(`/products${qs(params || {})}`),
  get: (slug: string) => request(`/products/${slug}`),
}

// ── Stacks ────────────────────────────────────────────────────────────────────
export const stackApi = {
  list: () => request('/stacks'),
  get: (slug: string) => request(`/stacks/${slug}`),
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => request('/cart', {}, true),
  addItem: (product_id: number, quantity: number) =>
    request('/cart/items', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }, true),
  updateItem: (itemId: number, quantity: number) =>
    request(`/cart/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }, true),
  removeItem: (itemId: number) =>
    request(`/cart/items/${itemId}`, { method: 'DELETE' }, true),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  create: () => request('/orders', { method: 'POST' }, true),
  list: () => request('/orders', {}, true),
  get: (id: number) => request(`/orders/${id}`, {}, true),
  updateStatus: (id: number, status: string) =>
    request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }, true),
  updatePayment: (id: number, status: string) =>
    request(`/orders/${id}/payment`, { method: 'PUT', body: JSON.stringify({ payment_status: status }) }, true),
}

// ── Addresses ────────────────────────────────────────────────────────────────
export const addressApi = {
  list: () => request('/addresses', {}, true),
  create: (data: unknown) =>
    request('/addresses', { method: 'POST', body: JSON.stringify(data) }, true),
  update: (id: number, data: unknown) =>
    request(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  delete: (id: number) =>
    request(`/addresses/${id}`, { method: 'DELETE' }, true),
}

// ── Shipping ──────────────────────────────────────────────────────────────────
export const shippingApi = {
  getRates: (addressId: number) =>
    request(`/shipping/rates?address_id=${addressId}`, {}, true),
  setMethod: (orderId: number, method: string) =>
    request(`/orders/${orderId}/shipping`, { method: 'PUT', body: JSON.stringify({ method }) }, true),
}

// ── Payment ───────────────────────────────────────────────────────────────────
export const paymentApi = {
  createSession: (orderId: number) =>
    request('/payment/session', { method: 'POST', body: JSON.stringify({ order_id: orderId }) }, true),
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN APIs
// Chaque méthode correspond exactement aux appels dans les pages admin/
// ─────────────────────────────────────────────────────────────────────────────

// admin/orders/page.tsx utilise :
//   adminOrderApi.list(limit, offset)
//   adminOrderApi.update(id, { status?, payment_status? })
export const adminOrderApi = {
  list: (limit = 50, offset = 0) =>
    request(`/admin/orders${qs({ limit, offset })}`, {}, true),
  update: (id: number, data: { status?: string; payment_status?: string }) =>
    request(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, true),
}

// admin/products/page.tsx utilise :
//   adminProductApi.list({ q?: string|undefined, limit?: number })
//   adminProductApi.create(fd: FormData)
//   adminProductApi.update(slug: string, fd: FormData)
//   adminProductApi.softDelete(slug: string)
export const adminProductApi = {
  list: (params?: { q?: string | null | undefined; limit?: number; offset?: number; is_active?: boolean }) =>
    request(`/admin/products${qs(params || {})}`, {}, true),
  get: (slug: string) => request(`/admin/products/${slug}`, {}, true),
  create: (fd: FormData) => requestForm('/admin/products', 'POST', fd),
  update: (slug: string, fd: FormData) => requestForm(`/admin/products/${slug}`, 'PUT', fd),
  softDelete: (slug: string) => request(`/admin/products/${slug}`, { method: 'DELETE' }, true),
}

// admin/inventory/page.tsx utilise :
//   adminInventoryApi.setStock(id: number, qty: number | null)
//   (uses adminProductApi.list too, already above)
export const adminInventoryApi = {
  setStock: (productId: number, qty: number | null) =>
    request(
      `/admin/inventory/products/${productId}`,
      { method: 'PUT', body: JSON.stringify({ stock_qty: qty }) },
      true,
    ),
}
