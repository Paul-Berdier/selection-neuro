// ─────────────────────────────────────────────────────────────────────────────
// API client — proxy /api/* (next.config.js rewrites)
// Railway : définir API_URL (server-side, sans NEXT_PUBLIC_)
// ─────────────────────────────────────────────────────────────────────────────

const BASE = '/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

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
  // useAuth.tsx:46 appelle authApi.logout()
  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('access_token')
  },
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
  updateItem: (item_id: number, quantity: number) =>
    request(`/cart/items/${item_id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }, true),
  // useCart.tsx:66 appelle cartApi.deleteItem (alias de removeItem)
  deleteItem: (item_id: number) =>
    request(`/cart/items/${item_id}`, { method: 'DELETE' }, true),
  removeItem: (item_id: number) =>
    request(`/cart/items/${item_id}`, { method: 'DELETE' }, true),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  create: () => request('/orders', { method: 'POST' }, true),
  list: () => request('/orders', {}, true),
  get: (id: number) => request(`/orders/${id}`, {}, true),
  // checkout/page.tsx:69 — lie les adresses à une commande
  setAddresses: (orderId: number, shippingAddressId: number, billingAddressId?: number) =>
    request(
      `/orders/${orderId}/addresses`,
      {
        method: 'PUT',
        body: JSON.stringify({
          shipping_address_id: shippingAddressId,
          billing_address_id: billingAddressId ?? shippingAddressId,
        }),
      },
      true,
    ),
  // checkout/page.tsx:82 — choisit le mode de livraison
  setShipping: (orderId: number, method: string) =>
    request(
      `/orders/${orderId}/shipping`,
      { method: 'PUT', body: JSON.stringify({ shipping_method: method }) },
      true,
    ),
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
}

// ── Payment ───────────────────────────────────────────────────────────────────
export const paymentApi = {
  // checkout/page.tsx:94 appelle createCheckoutSession
  createCheckoutSession: (orderId: number) =>
    request('/payment/session', { method: 'POST', body: JSON.stringify({ order_id: orderId }) }, true),
  createSession: (orderId: number) =>
    request('/payment/session', { method: 'POST', body: JSON.stringify({ order_id: orderId }) }, true),
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN APIs
// ─────────────────────────────────────────────────────────────────────────────

// admin/orders/page.tsx : list(limit, offset) + update(id, patch)
export const adminOrderApi = {
  list: (limit = 50, offset = 0) =>
    request(`/admin/orders${qs({ limit, offset })}`, {}, true),
  update: (id: number, data: { status?: string; payment_status?: string }) =>
    request(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, true),
}

// admin/products/page.tsx : list(params) + create(fd) + update(slug, fd) + softDelete(slug)
export const adminProductApi = {
  list: (params?: { q?: string | null | undefined; limit?: number; offset?: number; is_active?: boolean }) =>
    request(`/admin/products${qs(params || {})}`, {}, true),
  get: (slug: string) => request(`/admin/products/${slug}`, {}, true),
  create: (fd: FormData) => requestForm('/admin/products', 'POST', fd),
  update: (slug: string, fd: FormData) => requestForm(`/admin/products/${slug}`, 'PUT', fd),
  softDelete: (slug: string) => request(`/admin/products/${slug}`, { method: 'DELETE' }, true),
}

// admin/inventory/page.tsx : setStock(id, qty | null)
export const adminInventoryApi = {
  setStock: (productId: number, qty: number | null) =>
    request(
      `/admin/inventory/products/${productId}`,
      { method: 'PUT', body: JSON.stringify({ stock_qty: qty }) },
      true,
    ),
}
