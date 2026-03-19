const BASE = '/api'

type ApiErrorPayload = {
  detail?: string
  message?: string
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

function setToken(token: string | null): void {
  if (typeof window === 'undefined') return

  if (token) {
    localStorage.setItem('access_token', token)
  } else {
    localStorage.removeItem('access_token')
  }
}

async function extractError(res: Response): Promise<string> {
  const fallback = `HTTP ${res.status}`

  try {
    const data = (await res.json()) as ApiErrorPayload
    return data.detail || data.message || fallback
  } catch {
    return fallback
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers = new Headers(options.headers || {})

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getToken()
    if (!token) {
      throw new Error('Not authenticated')
    }
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    if (res.status === 401 && auth) {
      setToken(null)
    }
    throw new Error(await extractError(res))
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

async function requestForm<T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH',
  body: FormData,
  auth = true,
): Promise<T> {
  const headers = new Headers()

  if (auth) {
    const token = getToken()
    if (!token) {
      throw new Error('Not authenticated')
    }
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body,
  })

  if (!res.ok) {
    if (res.status === 401 && auth) {
      setToken(null)
    }
    throw new Error(await extractError(res))
  }

  return res.json() as Promise<T>
}

function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v != null)
    .map(([k, v]) => [k, String(v)])

  return entries.length ? `?${new URLSearchParams(entries).toString()}` : ''
}

type LoginResponse = {
  access_token: string
  token_type: string
}

export const authApi = {
  async login(email: string, password: string) {
    const data = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    setToken(data.access_token)
    return data
  },

  register(email: string, password: string, full_name?: string) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    })
  },

  me() {
    return request('/auth/me', {}, true)
  },

  logout() {
    setToken(null)
  },
}

export const productApi = {
  list: (params?: Record<string, string | number | null | undefined>) =>
    request(`/products${qs(params || {})}`),
  get: (slug: string) => request(`/products/${slug}`),
}

export const stackApi = {
  list: () => request('/stacks'),
  get: (slug: string) => request(`/stacks/${slug}`),
}

export const cartApi = {
  get: () => request('/cart', {}, true),
  addItem: (product_id: number, quantity: number) =>
    request('/cart/items', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }, true),
  updateItem: (item_id: number, quantity: number) =>
    request(`/cart/items/${item_id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }, true),
  deleteItem: (item_id: number) =>
    request(`/cart/items/${item_id}`, { method: 'DELETE' }, true),
  removeItem: (item_id: number) =>
    request(`/cart/items/${item_id}`, { method: 'DELETE' }, true),
}

export const orderApi = {
  create: () => request('/orders', { method: 'POST' }, true),
  list: () => request('/orders', {}, true),
  get: (id: number) => request(`/orders/${id}`, {}, true),
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

export const addressApi = {
  list: () => request('/addresses', {}, true),
  create: (data: unknown) =>
    request('/addresses', { method: 'POST', body: JSON.stringify(data) }, true),
  update: (id: number, data: unknown) =>
    request(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  delete: (id: number) =>
    request(`/addresses/${id}`, { method: 'DELETE' }, true),
}

export const shippingApi = {
  getRates: (addressId: number) =>
    request(`/shipping/rates?address_id=${addressId}`, {}, true),
}

export const paymentApi = {
  createCheckoutSession: (orderId: number) =>
    request('/payments/stripe/checkout-session', { method: 'POST', body: JSON.stringify({ order_id: orderId }) }, true),
  createSession: (orderId: number) =>
    request('/payments/stripe/checkout-session', { method: 'POST', body: JSON.stringify({ order_id: orderId }) }, true),
}

export const adminOrderApi = {
  list: (limit = 50, offset = 0) =>
    request(`/admin/orders${qs({ limit, offset })}`, {}, true),
  get: (id: number) => request(`/admin/orders/${id}`, {}, true),
  update: (id: number, data: { status?: string; payment_status?: string }) =>
    request(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, true),
}

export const adminProductApi = {
  list: (params?: { q?: string | null | undefined; limit?: number; offset?: number; is_active?: boolean }) =>
    request(`/admin/products${qs(params || {})}`, {}, true),
  get: (slug: string) => request(`/admin/products/${slug}`, {}, true),
  create: (fd: FormData) => requestForm('/admin/products', 'POST', fd, true),
  update: (slug: string, fd: FormData) => requestForm(`/admin/products/${slug}`, 'PUT', fd, true),
  softDelete: (slug: string) => request(`/admin/products/${slug}`, { method: 'DELETE' }, true),
}

export const adminInventoryApi = {
  setStock: (productId: number, qty: number | null) =>
    request(
      `/admin/inventory/products/${productId}`,
      { method: 'PUT', body: JSON.stringify({ stock_qty: qty }) },
      true,
    ),
}