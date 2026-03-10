// apps/web/src/lib/types.ts

export type Money = number;

/** --- Products --- */
export interface Product {
  id: number;
  slug: string;
  name: string;

  short_desc?: string;
  description_md?: string;

  category?: string;

  price_month_eur?: Money | null;

  image_media_id?: number | null;
  image_url?: string | null;

  is_active?: boolean;

  // inventory
  stock_qty?: number | null;
}

/** --- Stacks --- */
export interface StackProduct {
  id?: number;
  stack_id?: number;

  product_id: number;
  dosage?: number | null;
  unit?: string | null;
  note?: string | null;

  // often joined by API in stack details
  product?: Product;
}

export interface Stack {
  id: number;
  slug: string;
  name: string;

  short_desc?: string;
  description_md?: string;
  category?: string;

  items?: StackProduct[];
}

/** --- Cart --- */
export interface CartItemOut {
  id: number;
  product_id: number;
  quantity: number;

  product_name: string;
  unit_price: Money;

  image_url?: string | null;
}

export interface CartOut {
  id: number;
  items: CartItemOut[];
  total_items: number;
  subtotal: Money;
}

/** --- Orders --- */
export interface OrderItemOut {
  id: number;
  product_id: number;

  product_name: string;
  unit_price: Money;
  quantity: number;
  line_total: Money;
}

export interface OrderOut {
  id: number;
  status: string;
  payment_status: string;
  currency: string;

  // compatibility + current total
  total_amount: Money;

  // professional breakdown (if enabled in API)
  subtotal_amount?: Money;
  shipping_amount?: Money;
  tax_amount?: Money;
  grand_total_amount?: Money;

  shipping_method?: string;
  tax_rate?: number;

  shipping_address_id?: number | null;
  billing_address_id?: number | null;

  items: OrderItemOut[];
}

export interface OrderListOut {
  items: OrderOut[];
}

/** --- Admin list wrappers (if your API returns these shapes) --- */
export interface AdminListOut<T> {
  ok: boolean;
  total: number;
  limit: number;
  offset: number;
  items: T[];
}

/** --- Stripe checkout response --- */
export interface StripeCheckoutSessionOut {
  ok: boolean;
  order_id: number;
  session_id: string;
  checkout_url: string;
}