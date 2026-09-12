import type { MonthlyClosing, PeriodGoalsBundle, Plan } from '@/types/mlm'
import type { LaravelData } from '@/utils/http'
import { api } from '@/api/client'
import { unwrapData } from '@/utils/http'

export async function fetchPlans(): Promise<Plan[]> {
  const payload = await api<Plan[] | LaravelData<Plan[]>>('/plans')
  return unwrapData(payload)
}

export async function fetchMonthlyClosing(period?: string): Promise<MonthlyClosing> {
  return api<MonthlyClosing>('/reports/monthly-closing', {
    query: period ? { period } : undefined,
  })
}

export function upsertPeriodGoals(payload: {
  period: string
  goals: Array<{ metric: string; target: number | null }>
  next_goals?: Array<{ metric: string; target: number | null }>
}): Promise<PeriodGoalsBundle> {
  return api<PeriodGoalsBundle>('/reports/monthly-closing/goals', {
    method: 'PUT',
    body: payload,
  })
}

export type LeaderConnection = {
  driver: string
  name: string
  status: string
  last_synced_at?: string | null
  sources?: Array<{ kind: string; label: string; last_count: number }>
  latest_sync?: { message?: string | null } | null
}

export async function fetchConnectionStatus() {
  return api<{
    organization: { id: number; name: string; slug: string } | null
    official: LeaderConnection[]
    network_imports: LeaderConnection[]
  }>('/reports/connections')
}

export function importNetworkFile(file: File, name?: string) {
  const form = new FormData()
  form.append('file', file)
  if (name) {
    form.append('name', name)
  }
  return api('/reports/connections/import', { method: 'POST', body: form })
}

export async function downloadMonthlyReport(period?: string): Promise<void> {
  const blob = await api<Blob, 'blob'>('/reports/download', {
    query: period ? { period } : undefined,
    responseType: 'blob',
  })

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `reporte_${period ?? 'mes'}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
