export type MediaKind = 'flyer' | 'pdf' | 'video' | 'audio'

export type MediaRouteKind = 'flyers' | 'pdfs' | 'videos' | 'audios'

export type MediaFormat = 'pdf' | 'image' | 'video' | 'audio'

export type MediaItem = {
  id: string
  kind: MediaKind
  format: MediaFormat
  title: string
  url: string
  filename: string
  thumb?: string
  player?: string
  embedUrl?: string
  description?: string
}

export const mediaLibrary: MediaItem[] = [
  {
    id: 'flyer-ceo',
    kind: 'flyer',
    format: 'image',
    title: 'Dra. Deming Li',
    url: '/media/flyers/dra-deming-li.png',
    filename: 'dra-deming-li.png',
    thumb: '/media/flyers/dra-deming-li.png',
  },
  {
    id: 'flyer-logo-hgw',
    kind: 'flyer',
    format: 'image',
    title: 'Logo Health Green World',
    url: 'https://static.wixstatic.com/media/d00cad_a73297e5a2a34f55a3233e9a439edaf1~mv2.png',
    filename: 'logo-hgw.png',
    thumb: 'https://static.wixstatic.com/media/d00cad_a73297e5a2a34f55a3233e9a439edaf1~mv2.png',
  },
]

export const mediaKindMeta: Record<
  MediaKind,
  { title: string; hint: string; empty: string; formats: MediaFormat[] }
> = {
  flyer: {
    title: 'Flyers',
    hint: 'Imágenes listas para ver o descargar.',
    empty: 'Aún no hay flyers. El administrador los registra en el catálogo de la empresa.',
    formats: ['image'],
  },
  pdf: {
    title: 'PDFs',
    hint: 'Documentos PDF para ver o descargar.',
    empty: 'Aún no hay PDFs. El administrador los registra en el catálogo de la empresa.',
    formats: ['pdf'],
  },
  video: {
    title: 'Videos',
    hint: 'Videos descargables para capacitación y ventas.',
    empty: 'Aún no hay videos. El administrador los registra en el catálogo de la empresa.',
    formats: ['video'],
  },
  audio: {
    title: 'Audios',
    hint: 'Audios descargables para compartir con tu red.',
    empty: 'Aún no hay audios. El administrador los registra en el catálogo de la empresa.',
    formats: ['audio'],
  },
}

export function mediaByKind(kind: MediaKind): MediaItem[] {
  return mediaLibrary.filter((item) => item.kind === kind)
}

export function isMediaRouteKind(value: string): value is MediaRouteKind {
  return value === 'flyers' || value === 'pdfs' || value === 'videos' || value === 'audios'
}

export function kindFromRoute(value: string): MediaKind {
  if (value === 'pdfs') {
    return 'pdf'
  }
  if (value === 'videos') {
    return 'video'
  }
  if (value === 'audios') {
    return 'audio'
  }

  return 'flyer'
}
