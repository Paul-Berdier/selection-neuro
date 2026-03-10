export interface User {
  id: number
  email: string
  is_admin: boolean
  is_active: boolean
}

export interface Address {
  id: number
  label: string
  full_name: string
  line1: string
  line2: string
  city: string
  postal_code: string
  country: string
  phone: string
}

export interface AddressIn {
  label: string
  full_name: string
  line1: string
  line2?: string
  city: string
  postal_code: string
  country: string
  phone?: string
}

export interface Product {
  slug: string
  name: string
  short_desc: string
  description_md: string
  category: string
  price_month_eur: number | null
  image_url: string | null
  id?: number
  stock_qty?: number | null
  is_active?: boolean
}

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  product_name: string
  unit_price: number
  image_url: string | null
}

export interface Cart {
  id: number
  items: CartItem[]
  total_items: number
  subtotal: number
}

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  unit_price: number
  quantity: number
  line_total: number
}

export interface Order {
  id: number
  status: string
  payment_status: string
  currency: string
  total_amount: number
  subtotal_amount: number
  shipping_amount: number
  tax_amount: number
  grand_total_amount: number
  shipping_method: string | null
  tax_rate: number
  shipping_address_id: number | null
  billing_address_id: number | null
  items: OrderItem[]
  created_at?: string
  updated_at?: string
  paid_at?: string | null
  stripe_session_id?: string | null
  stripe_payment_intent_id?: string | null
  user_id?: number
}

export interface StackProduct {
  product_slug: string
  product_name: string
  product_short_desc: string
  product_category: string
  dosage_value: number | null
  dosage_unit: string
  note: string
}

export interface Stack {
  slug: string
  title: string
  subtitle: string
  description: string
  products: StackProduct[]
}

export interface ShippingRate {
  method: string
  label: string
  amount: number
}
