export type RingGender = 'mujer' | 'hombre'

export type RingSizeRow = {
  diameter: number
  circumference: number
  eu: number
  us: string
  uk: string
  bo: number | null
  use: 'mujer' | 'hombre' | 'ambos'
}

const UK_FROM_US_3: string[] = [
  'F', 'F½', 'G½', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
  'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
  'Y', 'Z', 'Z+1', 'Z+2', 'Z+3', 'Z+4', 'Z+5',
]

function ukForUs(us: number): string {
  const index = Math.round((us - 3) * 2)
  return UK_FROM_US_3[Math.max(0, Math.min(UK_FROM_US_3.length - 1, index))] ?? '—'
}

function formatUs(us: number): string {
  return Number.isInteger(us) ? String(us) : us.toFixed(1)
}

function useForUs(us: number): RingSizeRow['use'] {
  if (us <= 7) {
    return 'mujer'
  }
  if (us >= 10) {
    return 'hombre'
  }

  return 'ambos'
}

function boForDiameter(diameter: number): number | null {
  if (diameter < 16.8) {
    return null
  }

  return Math.max(1, Math.round((diameter - 17.2) / 0.8) + 1)
}

export const RING_SIZE_CHART: RingSizeRow[] = Array.from({ length: 27 }, (_, step) => {
  const us = 3 + step * 0.5
  const diameter = Number((14 + (us - 3) * 0.8).toFixed(2))
  const circumference = Number((diameter * Math.PI).toFixed(2))
  const eu = Math.round(44 + (us - 3) * 2)

  return {
    diameter,
    circumference,
    eu,
    us: formatUs(us),
    uk: ukForUs(us),
    bo: boForDiameter(diameter),
    use: useForUs(us),
  }
})

export const RING_RANGE: Record<RingGender, { min: number; max: number; initial: number }> = {
  mujer: { min: 13.2, max: 18.8, initial: 16.4 },
  hombre: { min: 17.2, max: 23.6, initial: 19.6 },
}

export function nearestRingSize(diameter: number): RingSizeRow {
  let best = RING_SIZE_CHART[0]
  let delta = Math.abs(diameter - best.diameter)

  for (const row of RING_SIZE_CHART) {
    const next = Math.abs(diameter - row.diameter)
    if (next < delta) {
      best = row
      delta = next
    }
  }

  return {
    ...best,
    diameter: Number(diameter.toFixed(2)),
    circumference: Number((diameter * Math.PI).toFixed(2)),
  }
}

export function chartForGender(gender: RingGender): RingSizeRow[] {
  return RING_SIZE_CHART.filter((row) => row.use === gender || row.use === 'ambos')
}

export const CREDIT_CARD_WIDTH_MM = 85.6
export const CREDIT_CARD_HEIGHT_MM = 53.98
