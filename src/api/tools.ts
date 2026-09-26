import { api } from '@/api/client'
import { fetchProducts } from '@/api/store'
import type {
  CompanyAvailableToolsPayload,
  CompanyMediaPayload,
  CompanyToolsPayload,
  ToolCatalogProduct,
  ToolCatalogProductsPayload,
} from '@/types/tools'

export function fetchImcPackages(): Promise<CompanyToolsPayload> {
  return api<CompanyToolsPayload>('/tools/imc-packages')
}

export function fetchWellnessNeeds(): Promise<CompanyToolsPayload> {
  return api<CompanyToolsPayload>('/tools/wellness-needs')
}

export function fetchCompanyDocuments(kind?: string): Promise<CompanyMediaPayload> {
  return api<CompanyMediaPayload>('/tools/documents', {
    query: kind ? { kind } : {},
  })
}

export function fetchAvailableCompanyTools(): Promise<CompanyAvailableToolsPayload> {
  return api<CompanyAvailableToolsPayload>('/tools/available')
}

export function fetchToolCatalogProducts(): Promise<ToolCatalogProductsPayload> {
  return api<ToolCatalogProductsPayload>('/tools/catalog-products')
}

function mapInventoryRow(row: {
  id: number
  name: string
  image: string | null
  is_active: boolean
  stock?: number
  catalog_company_id?: number | null
  category?: { name: string } | null
}): ToolCatalogProduct | null {
  const image = (row.image ?? '').trim()
  if (!row.is_active || image === '') {
    return null
  }

  return {
    id: row.id,
    name: row.name,
    image,
    category: row.category?.name ?? null,
    stock: row.stock ?? 0,
    catalog_company_id: row.catalog_company_id ?? null,
  }
}

export async function fetchToolTryOnProducts(): Promise<ToolCatalogProductsPayload> {
  try {
    const items: ToolCatalogProduct[] = []
    let page = 1
    let lastPage = 1

    do {
      const payload = await fetchProducts(page)
      lastPage = payload.meta?.last_page ?? 1
      for (const row of payload.data ?? []) {
        const mapped = mapInventoryRow(row)
        if (mapped) {
          items.push(mapped)
        }
      }
      page += 1
    } while (page <= lastPage && page <= 10)

    return { company: null, data: items }
  } catch {
    try {
      return await api<ToolCatalogProductsPayload>('/tools/inventory-products')
    } catch {
      return fetchToolCatalogProducts()
    }
  }
}
