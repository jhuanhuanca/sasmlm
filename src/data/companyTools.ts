import type { IconName } from '@/components/ui/AppIcon.vue'
import type { ClayTone } from '@/components/ui/ClayTile.vue'

export const COMPANY_TOOL_KEYS = [
  'wellness',
  'imc',
  'wellness_consult',
  'flyers',
  'pdfs',
  'videos',
  'audios',
  'ring_sizer',
] as const

export type CompanyToolKey = (typeof COMPANY_TOOL_KEYS)[number]

export type CompanyToolCard = {
  key: CompanyToolKey
  to: string
  title: string
  hint: string
  icon: IconName
  tone: ClayTone
}

export const COMPANY_TOOL_CARDS: CompanyToolCard[] = [
  {
    key: 'wellness',
    to: '/app/tools/wellness',
    title: 'Bienestar y salud',
    hint: 'Elige una dolencia y arma la recomendación con productos de tu empresa.',
    icon: 'heart',
    tone: 'mint',
  },
  {
    key: 'imc',
    to: '/app/tools/imc',
    title: 'Calculadora IMC',
    hint: 'Mide el índice de masa corporal y abre el paquete para bajar o subir de peso.',
    icon: 'star',
    tone: 'yellow',
  },
  {
    key: 'wellness_consult',
    to: '/app/tools/wellness/consulta',
    title: 'Consulta personalizada',
    hint: 'Cuestionario de hábitos e historial. Las recomendaciones de productos salen del catálogo de tu empresa.',
    icon: 'clipboard',
    tone: 'lavender',
  },
  {
    key: 'flyers',
    to: '/app/tools/flyers',
    title: 'Flyers',
    hint: 'Imágenes descargables para compartir.',
    icon: 'folder',
    tone: 'sky',
  },
  {
    key: 'pdfs',
    to: '/app/tools/pdfs',
    title: 'PDFs',
    hint: 'Documentos PDF para ver y descargar.',
    icon: 'file',
    tone: 'mint',
  },
  {
    key: 'videos',
    to: '/app/tools/videos',
    title: 'Videos',
    hint: 'Videos para ver y descargar.',
    icon: 'play',
    tone: 'coral',
  },
  {
    key: 'audios',
    to: '/app/tools/audios',
    title: 'Audios',
    hint: 'Audios para escuchar y descargar.',
    icon: 'alarm',
    tone: 'orange',
  },
  {
    key: 'ring_sizer',
    to: '/app/tools/anillos',
    title: 'Medidor de anillos',
    hint: 'Averigua la talla (mujer u hombre) y prueba anillo, aretes, collar o pulsera en AR.',
    icon: 'star',
    tone: 'coral',
  },
]

export function mediaKindToToolKey(kind: string): CompanyToolKey {
  if (kind === 'pdf' || kind === 'pdfs') {
    return 'pdfs'
  }
  if (kind === 'video' || kind === 'videos') {
    return 'videos'
  }
  if (kind === 'audio' || kind === 'audios') {
    return 'audios'
  }

  return 'flyers'
}
