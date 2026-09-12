import type { TeamActivity, TeamMemberDetail } from '@/types/mlm'
import { api } from '@/api/client'

export function fetchTeamMember(id: number): Promise<TeamMemberDetail> {
  return api<TeamMemberDetail>(`/dashboard/team/${id}`)
}

export function updateTeamMember(
  id: number,
  body: {
    crm_stage?: string
    notes?: string | null
    follow_up_at?: string | null
  },
): Promise<TeamMemberDetail> {
  return api<TeamMemberDetail>(`/dashboard/team/${id}`, { method: 'PUT', body })
}

export function addTeamActivity(
  id: number,
  body: { type?: string; body: string; due_at?: string | null },
): Promise<TeamActivity> {
  return api<TeamActivity>(`/dashboard/team/${id}/activities`, { method: 'POST', body })
}
