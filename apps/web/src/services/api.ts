// ─────────────────────────────────────────────────────────────────────────────
// API client — uses /api proxy (rewrites in next.config.js) so the browser
// ALWAYS calls the same origin (HTTPS). No mixed-content errors.
//
// Railway setup:
//   • Set  API_URL  (server-side, NOT NEXT_PUBLIC) = internal URL of your
//     FastAPI service, e.g.  http://selection-neuro.railway.internal:8080
//   • Do NOT set NEXT_PUBLIC_API_URL anymore.
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

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, full_name?: string) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    }),
  me: () => request('/auth/me', {}, true),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/products${q}`)
  },
  get: (slug: string) => request(`/products/${slug}`),
  create: (data: unknown) =>
    request('/products', { method: 'POST', body: JSON.stringify(data) }, true),
  update: (id: number, data: unknown) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  delete: (id: number) =>
    request(`/products/${id}`, { method: 'DELETE' }, true),
  uploadImage: async (productId: number, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    const token = getToken()
    const res = await fetch(`${BASE}/products/${productId}/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    })
    if (!res.ok) throw new Error('Upload échoué')
    return res.json()
  },
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
    request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id, quantity }),
    }, true),
  updateItem: (itemId: number, quantity: number) =>
    request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }, true),
  removeItem: (itemId: number) =>
    request(`/cart/items/${itemId}`, { method: 'DELETE' }, true),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderApi = {
  create: () => request('/orders', { method: 'POST' }, true),
  list: () => request('/orders', {}, true),
  get: (id: number) => request(`/orders/${id}`, {}, true),
  updateStatus: (id: number, status: string) =>
    request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, true),
  updatePayment: (id: number, status: string) =>
    request(`/orders/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status: status }),
    }, true),
  adminList: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/admin/orders${q}`, {}, true)
  },
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
    request(`/orders/${orderId}/shipping`, {
      method: 'PUT',
      body: JSON.stringify({ method }),
    }, true),
}

// ── Payment ───────────────────────────────────────────────────────────────────
export const paymentApi = {
  createSession: (orderId: number) =>
    request(`/payment/session`, {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    }, true),
}

// ── Inventory (admin) ─────────────────────────────────────────────────────────
export const inventoryApi = {
  list: () => request('/admin/inventory', {}, true),
  update: (productId: number, qty: number) =>
    request(`/admin/inventory/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ stock_qty: qty }),
    }, true),
}

// ── Admin aliases (backward-compatible exports) ───────────────────────────────
export const adminOrderApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/admin/orders${q}`, {}, true)
  },
  updateStatus: (id: number, status: string) =>
    request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, true),
  updatePayment: (id: number, status: string) =>
    request(`/orders/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status: status }),
    }, true),
}

export const adminProductApi = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/products${q}`, {}, true)
  },
  get: (slug: string) => request(`/products/${slug}`, {}, true),
  create: (data: unknown) =>
    request('/products', { method: 'POST', body: JSON.stringify(data) }, true),
  update: (id: number, data: unknown) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  delete: (id: number) =>
    request(`/products/${id}`, { method: 'DELETE' }, true),
  uploadImage: async (productId: number, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    const token = getToken()
    const res = await fetch(`/api/products/${productId}/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    })
    if (!res.ok) throw new Error('Upload échoué')
    return res.json()
  },
}

export const adminInventoryApi = {
  list: () => request('/admin/inventory', {}, true),
  update: (productId: number, qty: number) =>
    request(`/admin/inventory/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ stock_qty: qty }),
    }, true),
}
