import type { Invitation, InvitationCreated } from '@/types/mlm'
import type { LaravelData } from '@/utils/http'
import { api } from '@/api/client'
import { unwrapData } from '@/utils/http'

export async function fetchInvitation(token: string): Promise<Invitation> {
  const payload = await api<Invitation | LaravelData<Invitation>>(`/invitations/${token}`)
  return unwrapData(payload)
}

export async function createInvitation(email: string): Promise<InvitationCreated> {
  const payload = await api<
    LaravelData<Invitation> & { token: string; email_sent?: boolean; resent?: boolean }
  >('/invitations', {
    method: 'POST',
    body: { email },
  })

  return {
    ...unwrapData(payload),
    token: payload.token,
    email_sent: payload.email_sent,
    resent: payload.resent,
  }
}
