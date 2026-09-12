import type {
  PlaceOrderPayload,
  PlacePosOrderPayload,
  Order,
  OrderSource,
  Product,
  ProductPayload,
  Store,
  StoreCategory,
  StoreSales,
  InventoryAllocation,
  TeamInventoryRow,
} from '@/types/store'
import type { Paginated } from '@/types/mlm'
import type { LaravelData } from '@/utils/http'
import { api } from '@/api/client'
import { unwrapData } from '@/utils/http'
import type { ShippingQuote } from '@/data/shipping'

export async function fetchStoreCategories(): Promise<StoreCategory[]> {
  const payload = await api<StoreCategory[] | LaravelData<StoreCategory[]>>('/my-store/categories')
  return unwrapData(payload)
}

export async function createStoreCategory(name: string): Promise<StoreCategory> {
  const payload = await api<StoreCategory | LaravelData<StoreCategory>>('/my-store/categories', {
    method: 'POST',
    body: { name },
  })
  return unwrapData(payload)
}

export async function updateStoreCategory(id: number, name: string): Promise<StoreCategory> {
  const payload = await api<StoreCategory | LaravelData<StoreCategory>>(`/my-store/categories/${id}`, {
    method: 'PUT',
    body: { name },
  })
  return unwrapData(payload)
}

export async function deleteStoreCategory(id: number): Promise<void> {
  await api(`/my-store/categories/${id}`, { method: 'DELETE' })
}

export async function fetchMyStore(): Promise<Store> {
  const payload = await api<Store | LaravelData<Store>>('/my-store')
  return unwrapData(payload)
}

export async function updateMyStore(
  body: Partial<Pick<Store, 'name' | 'theme' | 'is_active' | 'settings'>>,
): Promise<Store> {
  const payload = await api<Store | LaravelData<Store>>('/my-store', { method: 'PUT', body })
  return unwrapData(payload)
}

export async function applyTargetMargin(): Promise<{
  message: string
  updated: number
  margin: number
  data: Product[]
}> {
  return api('/my-store/apply-target-margin', { method: 'POST' })
}

export async function uploadStorePaymentAsset(kind: 'qr' | 'binance_qr', file: File): Promise<Store> {
  const body = new FormData()
  body.append('kind', kind)
  body.append('file', file)

  const payload = await api<Store | LaravelData<Store>>('/my-store/payment-assets', {
    method: 'POST',
    body,
  })
  return unwrapData(payload)
}

export async function fetchProducts(
  page = 1,
  source?: 'personal' | 'company',
): Promise<Paginated<Product>> {
  return api<Paginated<Product>>('/products', {
    query: {
      page,
      per_page: 100,
      ...(source ? { source } : {}),
    },
  })
}

export async function createProduct(body: ProductPayload): Promise<Product> {
  const payload = await api<Product | LaravelData<Product>>('/products', { method: 'POST', body })
  return unwrapData(payload)
}

export async function updateProduct(id: number, body: Partial<ProductPayload>): Promise<Product> {
  const payload = await api<Product | LaravelData<Product>>(`/products/${id}`, { method: 'PUT', body })
  return unwrapData(payload)
}

export async function deleteProduct(id: number): Promise<void> {
  await api(`/products/${id}`, { method: 'DELETE' })
}

export async function importProducts(
  file: File,
  source: 'personal' | 'incentive' = 'personal',
): Promise<{ imported: number; skipped: number; data: Product[] }> {
  const body = new FormData()
  body.append('file', file)
  body.append('source', source)

  return api('/products/import', { method: 'POST', body })
}

export async function fetchOrders(
  page = 1,
  source: OrderSource = 'all',
  partnerUserId?: number,
): Promise<Paginated<Order> & { sales?: StoreSales }> {
  return api<Paginated<Order> & { sales?: StoreSales }>('/my-store/orders', {
    query: {
      page,
      ...(source !== 'all' ? { source } : {}),
      ...(partnerUserId ? { partner_user_id: partnerUserId } : {}),
    },
  })
}

export async function markOrderPaid(id: number): Promise<Order> {
  const payload = await api<Order | LaravelData<Order>>(`/my-store/orders/${id}/pay`, { method: 'POST' })
  return unwrapData(payload)
}

export async function fetchPublicProduct(storeSlug: string, productSlug: string): Promise<Product> {
  const payload = await api<Product | LaravelData<Product>>(`/store/${storeSlug}/products/${productSlug}`)
  return unwrapData(payload)
}

export async function fetchPublicStore(slug: string): Promise<Store> {
  const payload = await api<Store | LaravelData<Store>>(`/store/${slug}`)
  return unwrapData(payload)
}

export async function fetchShippingQuote(
  slug: string,
  query: { country: string; department?: string; area?: string; subtotal?: number },
): Promise<ShippingQuote> {
  const payload = await api<ShippingQuote | LaravelData<ShippingQuote>>(`/store/${slug}/shipping-quote`, { query })
  return unwrapData(payload)
}

export async function placePublicOrder(slug: string, body: PlaceOrderPayload, voucher?: File | null): Promise<Order> {
  if (voucher) {
    const form = new FormData()
    form.append('customer_name', body.customer_name)
    form.append('customer_email', body.customer_email)
    if (body.customer_phone) {
      form.append('customer_phone', body.customer_phone)
    }
    if (body.partner_user_id) {
      form.append('partner_user_id', String(body.partner_user_id))
    }
    if (body.payment_method) {
      form.append('payment_method', body.payment_method)
    }
    if (body.shipping_country) {
      form.append('shipping_country', body.shipping_country)
    }
    if (body.shipping_department) {
      form.append('shipping_department', body.shipping_department)
    }
    if (body.shipping_area) {
      form.append('shipping_area', body.shipping_area)
    }
    if (body.shipping_address) {
      form.append('shipping_address', body.shipping_address)
    }
    form.append('items', JSON.stringify(body.items))
    form.append('voucher', voucher)

    const payload = await api<Order | LaravelData<Order>>(`/store/${slug}/orders`, { method: 'POST', body: form })
    return unwrapData(payload)
  }

  const payload = await api<Order | LaravelData<Order>>(`/store/${slug}/orders`, { method: 'POST', body })
  return unwrapData(payload)
}

export async function fetchMyShippingQuote(query: {
  country: string
  department?: string
  area?: string
  subtotal?: number
}): Promise<ShippingQuote> {
  const payload = await api<ShippingQuote | LaravelData<ShippingQuote>>('/my-store/shipping-quote', { query })
  return unwrapData(payload)
}

export async function placePosOrder(body: PlacePosOrderPayload): Promise<Order> {
  const payload = await api<Order | LaravelData<Order>>('/my-store/orders', { method: 'POST', body })
  return unwrapData(payload)
}

export async function fetchInventoryAllocations(): Promise<{
  data: InventoryAllocation[]
  team: TeamInventoryRow[]
}> {
  return api<{ data: InventoryAllocation[]; team: TeamInventoryRow[] }>('/my-store/inventory/allocations')
}

export async function assignInventory(body: {
  product_id: number
  partner_user_id: number
  quantity: number
  notes?: string
}): Promise<InventoryAllocation> {
  const payload = await api<InventoryAllocation | LaravelData<InventoryAllocation>>(
    '/my-store/inventory/allocations',
    { method: 'POST', body },
  )
  return unwrapData(payload)
}

export async function returnInventory(id: number, quantity: number): Promise<InventoryAllocation | void> {
  const payload = await api<InventoryAllocation | LaravelData<InventoryAllocation> | { message: string }>(
    `/my-store/inventory/allocations/${id}/return`,
    { method: 'POST', body: { quantity } },
  )
  if (payload && 'data' in payload) {
    return unwrapData(payload as LaravelData<InventoryAllocation>)
  }
}

export async function fetchOrderVoucherBlob(orderId: number): Promise<Blob> {
  return api<Blob, 'blob'>(`/my-store/orders/${orderId}/voucher`, { responseType: 'blob' })
}
