import type { LandingContent, LandingSummary } from '@/types/auth'
import type { LaravelData } from '@/utils/http'
import { api } from '@/api/client'
import { unwrapData } from '@/utils/http'

export async function fetchMyLanding(): Promise<LandingSummary> {
  const payload = await api<LandingSummary | LaravelData<LandingSummary>>('/my-landing')
  return unwrapData(payload)
}

export async function updateMyLanding(body: {
  title?: string
  template?: string
  content?: LandingContent
}): Promise<LandingSummary> {
  const payload = await api<LandingSummary | LaravelData<LandingSummary>>('/my-landing', {
    method: 'PUT',
    body,
  })
  return unwrapData(payload)
}

export async function toggleLandingPublish(): Promise<LandingSummary> {
  const payload = await api<LandingSummary | LaravelData<LandingSummary>>('/my-landing/toggle-publish', {
    method: 'POST',
  })
  return unwrapData(payload)
}

export async function fetchPublicLanding(slug: string): Promise<LandingSummary> {
  const payload = await api<LandingSummary | LaravelData<LandingSummary>>(`/landing/${slug}`)
  return unwrapData(payload)
}

export async function uploadLandingAsset(
  kind: 'photo' | 'logo' | 'background' | 'reasons',
  file: File,
): Promise<LandingSummary> {
  const body = new FormData()
  body.append('kind', kind)
  body.append('file', file)

  const payload = await api<LandingSummary | LaravelData<LandingSummary>>('/my-landing/assets', {
    method: 'POST',
    body,
  })

  return unwrapData(payload)
}
