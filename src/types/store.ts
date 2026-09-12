import type { CompanyBrand, LandingPalette } from '@/types/auth'

export interface Store {
  id: number
  name: string
  slug: string
  theme: string
  settings: Record<string, unknown> | null
  is_active: boolean
  owner_name?: string
  whatsapp?: string | null
  dropshipping?: Record<string, unknown> | null
  payments?: Record<string, unknown> | null
  currency?: string
  inventory?: {
    low_stock_below: number
    expiry_warning_days: number
    target_margin_percent?: number | null
  }
  company?: CompanyBrand | null
  identity?: {
    title?: string | null
    logo?: string | null
    palette?: LandingPalette | null
  } | null
  products?: Product[]
}

export interface StoreCategory {
  id: number
  store_id?: number
  name: string
  slug: string
  sort?: number
  products_count?: number
}

export interface Product {
  id: number
  store_id: number
  source?: 'personal' | 'company' | 'incentive'
  catalog_company_id?: number | null
  catalog_product_id?: number | null
  store_category_id?: number | null
  category?: Pick<StoreCategory, 'id' | 'name' | 'slug'> | null
  name: string
  slug: string
  description: string | null
  technical_sheet?: string | null
  price: number | string
  purchase_cost?: number | string
  incentive_product_id?: number | null
  incentive_qty?: number
  incentive_cost?: number | string
  unit_cost?: number | string
  unit_profit?: number | string
  margin_percent?: number | null
  incentive?: {
    id: number
    name: string
    image?: string | null
    qty?: number
    purchase_cost?: number | string
    stock?: number
  } | null
  currency: string
  stock: number
  image: string | null
  is_active: boolean
  is_published?: boolean
  fulfillment?: 'stock' | 'dropship'
  expires_at?: string | null
  dropship_url?: string | null
  dropship_sku?: string | null
  is_expired?: boolean
  is_low_stock?: boolean
  is_expiring_soon?: boolean
  days_until_expiry?: number | null
  allocated_remaining?: number
}

export interface OrderItem {
  id: number
  product_id: number
  name: string
  quantity: number
  unit_price: number | string
  line_total: number | string
}

export interface Order {
  id: number
  status: string
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  shipping_fee?: number | string
  shipping_country?: string | null
  shipping_department?: string | null
  shipping_area?: string | null
  shipping_address?: string | null
  shipping_zone?: string | null
  shipping_eta_days?: number | null
  total: number | string
  currency: string
  paid_at: string | null
  created_at: string
  channel?: 'ecommerce' | 'pos' | string
  delivery?: 'shipping' | 'pickup' | string
  payment_method?: 'qr' | 'qr_binance' | 'deposit' | 'transfer' | string | null
  has_payment_voucher?: boolean
  payment_voucher_url?: string | null
  payment_voucher_document_id?: number | null
  partner_user_id?: number | null
  partner?: {
    id: number
    name: string
    email: string
  } | null
  items?: OrderItem[]
}

export interface ProductPayload {
  name: string
  description?: string | null
  technical_sheet?: string | null
  price: number
  purchase_cost?: number
  source?: 'personal' | 'incentive'
  incentive_product_id?: number | null
  incentive_qty?: number
  currency?: string
  stock: number
  image?: string | null
  is_active?: boolean
  is_published?: boolean
  fulfillment?: 'stock' | 'dropship'
  expires_at?: string | null
  dropship_url?: string | null
  dropship_sku?: string | null
  store_category_id?: number | null
}

export interface PlaceOrderPayload {
  customer_name: string
  customer_email: string
  customer_phone?: string
  items: Array<{ product_id: number; quantity: number }>
  partner_user_id?: number
  shipping_country?: string
  shipping_department?: string
  shipping_area?: string
  shipping_address?: string
  payment_method?: 'qr' | 'qr_binance' | 'deposit' | 'transfer'
}

export interface PlacePosOrderPayload {
  customer_name: string
  customer_email?: string
  customer_phone?: string
  items: Array<{ product_id: number; quantity: number }>
  delivery: 'pickup' | 'shipping'
  mark_paid?: boolean
  shipping_country?: string
  shipping_department?: string
  shipping_area?: string
  shipping_address?: string
}

export interface StoreSalesBucket {
  currency: string
  personal_total: number
  team_total: number
  total: number
  personal_month: number
  team_month: number
  personal_orders: number
  team_orders: number
}

export interface StoreSales extends StoreSalesBucket {
  by_currency?: StoreSalesBucket[]
}

export type OrderSource = 'all' | 'personal' | 'team'

export interface InventoryAllocation {
  id: number
  product_id: number
  partner_user_id: number
  qty_assigned: number
  qty_sold: number
  qty_remaining: number
  notes?: string | null
  product?: {
    id: number
    name: string
    stock: number
    currency?: string
    price?: number | string
  }
  partner?: {
    id: number
    name: string
    email: string
  }
}

export interface TeamInventoryRow {
  partner_user_id: number
  name?: string | null
  email?: string | null
  qty_assigned: number
  qty_sold: number
  qty_remaining: number
  orders_count: number
  sales_total: number
  sales_by_currency?: Array<{ currency: string; total: number; orders_count: number }>
}
