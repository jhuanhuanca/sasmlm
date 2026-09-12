export interface ShopProduct {
  id: number
  slug: string
  name: string
  subtitle: string
  description: string
  price: number
  compareAt?: number
  currency: string
  stock: number
  image: string
  category: string
  rating: number
  ratingCount: number
  salePercent?: number
  demo: boolean
  sku: string
  tags: string[]
  technicalSheet?: string | null
  fulfillment?: 'stock' | 'dropship'
  incentive?: {
    name: string
    image: string | null
    qty: number
  } | null
}

export interface ShopCartLine {
  product: ShopProduct
  quantity: number
}

export const SHOP_CATEGORIES = ['Casual', 'Cool', 'Exclusive', 'Sport', 'Daily'] as const

export const FREE_SHIPPING_FROM = 999
