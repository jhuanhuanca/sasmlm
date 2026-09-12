export type ShippingZone = {
  country: string
  department: string
  area: string
  fee: number
  eta_days: number | null
  label: string
}

export type DropshippingSettings = {
  enabled: boolean
  origin_country: string
  origin_department: string
  origin_area: string
  handling_fee: number
  free_shipping_from: number | null
  local_fee: number
  department_fee: number
  national_fee: number
  international_fee: number
  local_days: number
  department_days: number
  national_days: number
  international_days: number
  notes: string
  zones: ShippingZone[]
}

export type ShippingQuote = {
  applies: boolean
  fee: number
  handling_fee: number
  shipping_fee: number
  eta_days: number | null
  zone: string | null
  free: boolean
  currency: string
}

export const emptyDropshipping = (): DropshippingSettings => ({
  enabled: false,
  origin_country: 'BO',
  origin_department: '',
  origin_area: '',
  handling_fee: 0,
  free_shipping_from: null,
  local_fee: 0,
  department_fee: 0,
  national_fee: 0,
  international_fee: 0,
  local_days: 1,
  department_days: 2,
  national_days: 4,
  international_days: 10,
  notes: '',
  zones: [],
})

export const SHIPPING_COUNTRIES: Array<{ code: string; name: string }> = [
  { code: 'BO', name: 'Bolivia' },
  { code: 'PE', name: 'Perú' },
  { code: 'CO', name: 'Colombia' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'CL', name: 'Chile' },
  { code: 'AR', name: 'Argentina' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'BR', name: 'Brasil' },
  { code: 'MX', name: 'México' },
  { code: 'PA', name: 'Panamá' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'ES', name: 'España' },
]

export const SHIPPING_DEPARTMENTS: Record<string, string[]> = {
  BO: ['Chuquisaca', 'La Paz', 'Cochabamba', 'Oruro', 'Potosí', 'Tarija', 'Santa Cruz', 'Beni', 'Pando'],
  PE: ['Lima', 'Arequipa', 'Cusco', 'Piura', 'La Libertad', 'Lambayeque', 'Puno', 'Junín', 'Ancash', 'Ica'],
  CO: ['Bogotá D.C.', 'Antioquia', 'Valle del Cauca', 'Cundinamarca', 'Atlántico', 'Santander', 'Bolívar', 'Nariño'],
  EC: ['Pichincha', 'Guayas', 'Azuay', 'Manabí', 'El Oro', 'Tungurahua'],
  CL: ['Región Metropolitana', 'Valparaíso', 'Biobío', 'Araucanía', 'Los Lagos', 'Antofagasta'],
  AR: ['Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Salta'],
  PY: ['Asunción', 'Central', 'Alto Paraná', 'Itapúa', 'Caaguazú'],
  UY: ['Montevideo', 'Canelones', 'Maldonado', 'Colonia', 'Salto'],
  VE: ['Distrito Capital', 'Miranda', 'Zulia', 'Carabobo', 'Lara', 'Aragua'],
  MX: ['CDMX', 'Estado de México', 'Jalisco', 'Nuevo León', 'Puebla', 'Guanajuato', 'Veracruz'],
}

export function departmentsOf(country: string): string[] {
  return SHIPPING_DEPARTMENTS[country] ?? []
}

export function hydrateDropshipping(raw: unknown): DropshippingSettings {
  const base = emptyDropshipping()
  if (!raw || typeof raw !== 'object') {
    return base
  }
  const data = raw as Record<string, unknown>
  const zones = Array.isArray(data.zones)
    ? data.zones
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((zone) => ({
          country: String(zone.country ?? ''),
          department: String(zone.department ?? ''),
          area: String(zone.area ?? ''),
          fee: Number(zone.fee ?? 0),
          eta_days: zone.eta_days === null || zone.eta_days === undefined || zone.eta_days === '' ? null : Number(zone.eta_days),
          label: String(zone.label ?? ''),
        }))
    : []

  return {
    ...base,
    enabled: Boolean(data.enabled),
    origin_country: String(data.origin_country || base.origin_country).toUpperCase(),
    origin_department: String(data.origin_department ?? ''),
    origin_area: String(data.origin_area ?? ''),
    handling_fee: Number(data.handling_fee ?? 0),
    free_shipping_from:
      data.free_shipping_from === null || data.free_shipping_from === '' || data.free_shipping_from === undefined
        ? null
        : Number(data.free_shipping_from),
    local_fee: Number(data.local_fee ?? 0),
    department_fee: Number(data.department_fee ?? 0),
    national_fee: Number(data.national_fee ?? 0),
    international_fee: Number(data.international_fee ?? 0),
    local_days: Number(data.local_days ?? 1),
    department_days: Number(data.department_days ?? 2),
    national_days: Number(data.national_days ?? 4),
    international_days: Number(data.international_days ?? 10),
    notes: String(data.notes ?? ''),
    zones,
  }
}
