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
  line1?: string
  line2?: string
  city: string
  postal_code: string
  country: string
  phone?: string
}

/** Variante de vente — prix et quantité réels issus du backend */
export interface ProductVariant {
  price: number   // prix TTC pour cette variante
  qty_g: number   // quantité en grammes
  label: string   // "1 mois", "3 mois", "1 an"
  months: number  // 1, 3, 12
}

export interface Product {
  id: number
  slug: string
  name: string
  short_desc: string
  description: string
  category: string
  /** Prix mensuel de référence — affiché sur la page Stack uniquement */
  price_month_eur: number | null
  image_url: string | null
  stock_qty?: number | null
  is_active?: boolean
  /** Variantes de vente renvoyées par l'API */
  variants: ProductVariant[]
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
  product_id?: number
  product_slug: string
  product_name: string
  product_short_desc: string
  product_category: string
  product_price_month_eur?: number | null
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
