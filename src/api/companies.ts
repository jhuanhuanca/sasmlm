import type { AuthUser } from '@/types/auth'
import type { LaravelData } from '@/utils/http'
import { api } from '@/api/client'
import { unwrapData } from '@/utils/http'

export async function addSecondaryCompany(body: {
  catalog_company_id: number
  catalog_rank_id?: number
  catalog_rank_name?: string
}): Promise<AuthUser> {
  const payload = await api<(AuthUser | LaravelData<AuthUser>) & { checkout_url?: string }>('/my-companies', {
    method: 'POST',
    body,
  })

  if (payload.checkout_url) {
    window.location.assign(payload.checkout_url)
    return unwrapData(payload)
  }

  return unwrapData(payload)
}

export async function switchActiveCompany(catalogCompanyId: number): Promise<AuthUser> {
  const payload = await api<AuthUser | LaravelData<AuthUser>>('/my-companies/active', {
    method: 'PUT',
    body: { catalog_company_id: catalogCompanyId },
  })
  return unwrapData(payload)
}
