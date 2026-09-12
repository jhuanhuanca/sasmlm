import type { SupportTicket } from '@/types/support'
import type { LaravelData } from '@/utils/http'
import { api } from '@/api/client'
import { unwrapData } from '@/utils/http'

export async function sendMarketingContact(body: {
  name: string
  email: string
  subject?: string
  message: string
}): Promise<SupportTicket> {
  const payload = await api<SupportTicket | LaravelData<SupportTicket>>('/support/contact', {
    method: 'POST',
    body,
  })
  return unwrapData(payload)
}

export async function fetchMyTickets(page = 1) {
  return api<{ data: SupportTicket[]; meta?: { current_page: number; last_page: number; total: number } }>(
    '/support/tickets',
    { query: { page } },
  )
}

export async function createSupportTicket(body: { subject: string; message: string }): Promise<SupportTicket> {
  const payload = await api<SupportTicket | LaravelData<SupportTicket>>('/support/tickets', {
    method: 'POST',
    body,
  })
  return unwrapData(payload)
}

export async function fetchSupportTicket(id: number): Promise<SupportTicket> {
  const payload = await api<SupportTicket | LaravelData<SupportTicket>>(`/support/tickets/${id}`)
  return unwrapData(payload)
}

export async function replySupportTicket(id: number, message: string): Promise<SupportTicket> {
  const payload = await api<SupportTicket | LaravelData<SupportTicket>>(`/support/tickets/${id}/replies`, {
    method: 'POST',
    body: { message },
  })
  return unwrapData(payload)
}
