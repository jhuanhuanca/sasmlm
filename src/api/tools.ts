import { api } from '@/api/client'
import type {
  CompanyAvailableToolsPayload,
  CompanyMediaPayload,
  CompanyToolsPayload,
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
