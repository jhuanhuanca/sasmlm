import type { LandingPhotoFrame } from '@/types/auth'

export type { LandingPhotoFrame }

export const LANDING_PHOTO_FRAMES: Array<{
  id: LandingPhotoFrame
  label: string
  hint: string
}> = [
  { id: 'phone', label: 'Celular', hint: 'Foto dentro de un teléfono' },
  { id: 'emerge', label: 'Círculo', hint: 'La foto sale de un círculo' },
  { id: 'circle', label: 'Redonda', hint: 'Recorte circular' },
  { id: 'arch', label: 'Arco', hint: 'Ventana redondeada arriba' },
  { id: 'blob', label: 'Orgánica', hint: 'Silueta irregular' },
]

export function isLandingPhotoFrame(value: unknown): value is LandingPhotoFrame {
  return LANDING_PHOTO_FRAMES.some((item) => item.id === value)
}
