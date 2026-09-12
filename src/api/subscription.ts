import type { AuthUser } from '@/types/auth'
import type { Plan } from '@/types/mlm'
import type { LaravelData } from '@/utils/http'
import { api } from '@/api/client'
import { unwrapData } from '@/utils/http'

export async function fetchPlans(): Promise<Plan[]> {
  const payload = await api<Plan[] | LaravelData<Plan[]>>('/plans')

  if (Array.isArray(payload)) {
    return payload
  }

  const data = unwrapData(payload)

  return Array.isArray(data) ? data : []
}

export async function subscribeAsLeader(
  planId: number,
): Promise<{ user?: AuthUser; promoted?: boolean; offline?: boolean; checkout_url?: string }> {
  const payload = await api<{
    user?: AuthUser | LaravelData<AuthUser>
    promoted?: boolean
    offline?: boolean
    checkout_url?: string
  }>('/subscriptions', {
    method: 'POST',
    body: { plan_id: planId },
  })

  return {
    ...payload,
    user: payload.user ? unwrapData(payload.user) : undefined,
  }
}
