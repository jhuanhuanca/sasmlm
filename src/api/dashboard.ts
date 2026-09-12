import type {
  CommissionRow,
  DashboardSummary,
  Invitation,
  InvitationCreated,
  Paginated,
  ReferralRow,
  TeamRoster,
  WithdrawalBalance,
  WithdrawalRequest,
} from '@/types/mlm'
import type { LaravelData } from '@/utils/http'
import { api } from '@/api/client'
import { unwrapData } from '@/utils/http'

export function fetchDashboard(): Promise<DashboardSummary> {
  return api<DashboardSummary>('/dashboard')
}

export function fetchTeam(): Promise<ReferralRow[]> {
  return api<ReferralRow[]>('/dashboard/team')
}

export async function fetchTeamRoster(): Promise<TeamRoster> {
  return api<TeamRoster>('/dashboard/team/roster')
}

export async function registerCompanyPartner(body: {
  name: string
  email?: string
  phone?: string
  code?: string
  rank_name?: string
}): Promise<{ id: number; name: string; email: string | null; company_code: string | null; rank_name: string | null }> {
  const payload = await api<
    LaravelData<{
      id: number
      name: string
      email: string | null
      company_code: string | null
      rank_name: string | null
    }>
  >('/dashboard/team/company-partners', { method: 'POST', body })
  return unwrapData(payload)
}

export async function convertCompanyPartner(id: number): Promise<InvitationCreated> {
  const payload = await api<LaravelData<Invitation> & { token: string }>('/dashboard/team/company-partners/' + id + '/convert', {
    method: 'POST',
  })

  return {
    ...unwrapData(payload),
    token: payload.token,
  }
}

export function fetchCommissions(page = 1): Promise<Paginated<CommissionRow>> {
  return api<Paginated<CommissionRow>>('/dashboard/commissions', { query: { page } })
}

export function fetchWithdrawalBalance(): Promise<WithdrawalBalance> {
  return api<WithdrawalBalance>('/dashboard/withdrawals/balance')
}

export function fetchWithdrawals(page = 1): Promise<Paginated<WithdrawalRequest>> {
  return api<Paginated<WithdrawalRequest>>('/dashboard/withdrawals', { query: { page } })
}

export function requestWithdrawal(body: {
  amount?: number
  collect_all?: boolean
  whatsapp?: string
  password: string
}): Promise<WithdrawalRequest> {
  return api<WithdrawalRequest>('/dashboard/withdrawals', { method: 'POST', body })
}
