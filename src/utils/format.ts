const moneyFormatters = new Map<string, Intl.NumberFormat>()

export function money(value: number | string | null | undefined, currency = 'USD'): string {
  const amount = Number(value ?? 0)
  const key = String(currency || 'USD').toUpperCase()

  try {
    if (!moneyFormatters.has(key)) {
      moneyFormatters.set(
        key,
        new Intl.NumberFormat('es-DO', {
          style: 'currency',
          currency: key,
          maximumFractionDigits: 2,
        }),
      )
    }

    return moneyFormatters.get(key)!.format(amount)
  } catch {
    return `${amount.toFixed(2)} ${key}`
  }
}

export function compactNumber(value: number | string | null | undefined): string {
  return new Intl.NumberFormat('es-DO', { maximumFractionDigits: 0 }).format(Number(value ?? 0))
}

export function signedPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'sin base'
  }

  const sign = value > 0 ? '+' : ''
  return `${sign}${new Intl.NumberFormat('es-DO', { maximumFractionDigits: 1 }).format(value)}%`
}

export function firstName(fullName: string | null | undefined): string {
  if (!fullName) {
    return 'Rex'
  }

  return fullName.trim().split(/\s+/)[0] ?? fullName
}

export function initials(fullName: string | null | undefined): string {
  if (!fullName) {
    return 'RX'
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function crmStageLabel(stage: string | null | undefined): string {
  const labels: Record<string, string> = {
    new: 'Nuevo',
    contacted: 'Contactado',
    active: 'Activo',
    follow_up: 'Seguimiento',
    needs_support: 'Necesita apoyo',
    independent: 'Independiente',
  }

  return labels[stage ?? ''] ?? 'Nuevo'
}

export function roleLabel(role: string): string {
  if (role === 'leader') {
    return 'Líder de red'
  }
  if (role === 'partner') {
    return 'Socio'
  }
  if (role === 'admin') {
    return 'Administración'
  }

  return role
}

export function countryLabel(code: string | null | undefined): string {
  if (!code) {
    return '—'
  }

  if (code === 'XX') {
    return 'Otro'
  }

  try {
    return new Intl.DisplayNames(['es'], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}
