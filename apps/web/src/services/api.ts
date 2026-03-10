const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Request failed')
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Auth ───────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

  login: async (email: string, password: string): Promise<{ access_token: string }> => {
    const data = await request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access_token)
    }
    return data
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('access_token')
  },

  me: () => request('/auth/me', {}, true),
}

// ─── Addresses ──────────────────────────────────────────
export const addressApi = {
  list: () => request('/addresses', {}, true),
  create: (payload: object) => request('/addresses', { method: 'POST', body: JSON.stringify(payload) }, true),
  get: (id: number) => request(`/addresses/${id}`, {}, true),
  update: (id: number, payload: object) => request(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, true),
  delete: (id: number) => request(`/addresses/${id}`, { method: 'DELETE' }, true),
}

// ─── Products ───────────────────────────────────────────
export const productApi = {
  list: (params?: { q?: string; is_active?: boolean }) => {
    const qs = new URLSearchParams()
    if (params?.q) qs.set('q', params.q)
    if (params?.is_active !== undefined) qs.set('is_active', String(params.is_active))
    return request(`/products?${qs}`)
  },
  get: (slug: string) => request(`/products/${slug}`),
}

// ─── Cart ────────────────────────────────────────────────
export const cartApi = {
  get: () => request('/cart', {}, true),
  addItem: (product_id: number, quantity: number) =>
    request('/cart/items', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }, true),
  updateItem: (item_id: number, quantity: number) =>
    request(`/cart/items/${item_id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }, true),
  deleteItem: (item_id: number) =>
    request(`/cart/items/${item_id}`, { method: 'DELETE' }, true),
}

// ─── Orders ──────────────────────────────────────────────
export const orderApi = {
  list: () => request('/orders', {}, true),
  get: (id: number) => request(`/orders/${id}`, {}, true),
  create: () => request('/orders', { method: 'POST' }, true),
  setAddresses: (id: number, shipping_address_id: number, billing_address_id?: number) =>
    request(`/orders/${id}/addresses`, {
      method: 'PUT',
      body: JSON.stringify({ shipping_address_id, billing_address_id }),
    }, true),
  setShipping: (id: number, shipping_method: string) =>
    request(`/orders/${id}/shipping`, { method: 'PUT', body: JSON.stringify({ shipping_method }) }, true),
}

// ─── Shipping ────────────────────────────────────────────
export const shippingApi = {
  getRates: (address_id?: number) => {
    const qs = address_id ? `?address_id=${address_id}` : ''
    return request(`/shipping/rates${qs}`, {}, true)
  },
}

// ─── Stacks ──────────────────────────────────────────────
export const stackApi = {
  list: () => request('/stacks'),
  get: (slug: string) => request(`/stacks/${slug}`),
}

// ─── Payments ────────────────────────────────────────────
export const paymentApi = {
  createCheckoutSession: (order_id: number) =>
    request('/payments/stripe/checkout-session', {
      method: 'POST',
      body: JSON.stringify({ order_id }),
    }, true),
}

// ─── Admin ───────────────────────────────────────────────
function getAdminToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('admin_token') || ''
}

async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Admin-Token': getAdminToken(),
    ...(options.headers as Record<string, string>),
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const adminOrderApi = {
  list: (limit = 50, offset = 0) => adminRequest(`/admin/orders?limit=${limit}&offset=${offset}`),
  get: (id: number) => adminRequest(`/admin/orders/${id}`),
  update: (id: number, payload: { status?: string; payment_status?: string }) =>
    adminRequest(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
}

export const adminInventoryApi = {
  setStock: (product_id: number, stock_qty: number | null) =>
    adminRequest(`/admin/inventory/products/${product_id}`, {
      method: 'PUT',
      body: JSON.stringify({ stock_qty }),
    }),
}

export const adminProductApi = {
  list: (params?: { q?: string; is_active?: boolean; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams()
    if (params?.q) qs.set('q', params.q)
    if (params?.is_active !== undefined) qs.set('is_active', String(params.is_active))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.offset) qs.set('offset', String(params.offset))
    return adminRequest(`/admin/products?${qs}`)
  },
  get: (slug: string) => adminRequest(`/admin/products/${slug}`),
  create: (formData: FormData) => {
    const token = getAdminToken()
    return fetch(`${BASE_URL}/admin/products`, {
      method: 'POST',
      headers: { 'X-Admin-Token': token },
      body: formData,
    }).then(r => r.json())
  },
  update: (slug: string, formData: FormData) => {
    const token = getAdminToken()
    return fetch(`${BASE_URL}/admin/products/${slug}`, {
      method: 'PUT',
      headers: { 'X-Admin-Token': token },
      body: formData,
    }).then(r => r.json())
  },
  softDelete: (slug: string) => adminRequest(`/admin/products/${slug}`, { method: 'DELETE' }),
}
