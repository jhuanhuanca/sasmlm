import type { PlacePosOrderPayload, Order, Product, Store } from '@/types/store'
import type { Paginated } from '@/types/mlm'
import type { LaravelData } from '@/utils/http'
import { api } from '@/api/client'
import { unwrapData } from '@/utils/http'

export type PartnerSalesCatalog = {
  store: Store
  leader_name: string | null
  products: Product[]
}

export type PartnerSalesTotals = {
  currency: string
  total: number
  month: number
  orders_count: number
}

export async function fetchPartnerSalesCatalog(): Promise<PartnerSalesCatalog> {
  const payload = await api<PartnerSalesCatalog | LaravelData<PartnerSalesCatalog>>('/partner-sales')
  return unwrapData(payload)
}

export async function fetchPartnerSalesOrders(page = 1): Promise<Paginated<Order> & { sales?: PartnerSalesTotals }> {
  return api<Paginated<Order> & { sales?: PartnerSalesTotals }>('/partner-sales/orders', { query: { page } })
}

export async function placePartnerPosOrder(body: PlacePosOrderPayload): Promise<Order> {
  const payload = await api<Order | LaravelData<Order>>('/partner-sales/orders', { method: 'POST', body })
  return unwrapData(payload)
}
