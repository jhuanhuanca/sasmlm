export function parseBrandHex(value?: string | null): string | null {
  const raw = (value ?? '').trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw.split('').map((char) => char + char).join('').toLowerCase()}`
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw.toLowerCase()}`
  }

  return null
}

export function normalizeHex(value: string, fallback = '#ffd452'): string {
  return parseBrandHex(value) ?? fallback
}

export function hexToRgb(hex: string): [number, number, number] {
  const value = normalizeHex(hex).slice(1)

  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')}`
}

export function mixHex(from: string, to: string, amount: number): string {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  const t = Math.max(0, Math.min(1, amount))

  return rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)
}

export function relativeLuminance(hex: string): number {
  const channel = (value: number) => {
    const srgb = value / 255

    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  }

  const [r, g, b] = hexToRgb(hex)

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function onColor(hex: string, light = '#202020', dark = '#fffdf7'): string {
  return relativeLuminance(hex) > 0.42 ? light : dark
}
