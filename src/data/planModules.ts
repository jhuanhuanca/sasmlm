import type { PlanEntitlements } from '@/types/auth'
import type { CompanyToolKey } from '@/data/companyTools'

export type PlanModuleKey = 'store' | 'tools' | 'landing' | 'team' | 'closing' | 'whatsapp_chatbot'

export const PLAN_MODULE_COPY: Record<
  PlanModuleKey,
  { title: string; includedIn: string; benefit: string }
> = {
  store: {
    title: 'Tienda',
    includedIn: 'Intermedio o Premium',
    benefit: 'Inventario, pedidos, POS y venta de tu red.',
  },
  tools: {
    title: 'Herramientas',
    includedIn: 'Intermedio o Premium',
    benefit: 'IMC, bienestar, material descargable y medidor de anillos.',
  },
  landing: {
    title: 'Landing',
    includedIn: 'todos los planes',
    benefit: 'Página pública para captar clientes y socios.',
  },
  team: {
    title: 'Equipo e invitaciones',
    includedIn: 'todos los planes',
    benefit: 'Armar y seguir tu red.',
  },
  closing: {
    title: 'Cierre de mes',
    includedIn: 'Intermedio o Premium',
    benefit: 'Metas, reportes y lectura de tu mes.',
  },
  whatsapp_chatbot: {
    title: 'Chatbot WhatsApp',
    includedIn: 'Premium',
    benefit: 'Vendedor Live: ingresar, configurar o pedir ayuda a soporte.',
  },
}

export const ALL_PLAN_FEATURES: { key: PlanModuleKey; label: string }[] = [
  { key: 'team', label: 'Equipo e invitaciones' },
  { key: 'landing', label: 'Landing pública' },
  { key: 'store', label: 'Tienda, inventario y POS' },
  { key: 'tools', label: 'Herramientas (IMC, bienestar, material, anillos)' },
  { key: 'closing', label: 'Cierre de mes y reportes' },
  { key: 'whatsapp_chatbot', label: 'Chatbot WhatsApp (Vendedor Live)' },
]

export function planHasFeature(
  entitlements: Record<string, unknown> | null | undefined,
  key: PlanModuleKey,
): boolean {
  return entitlements?.[key] === true
}

export function planCatalogRows(
  entitlements: Record<string, unknown> | null | undefined,
): { key: PlanModuleKey; label: string; included: boolean }[] {
  return ALL_PLAN_FEATURES.map((row) => ({
    ...row,
    included: planHasFeature(entitlements, row.key),
  }))
}

export function toolNeedsPlan(key: CompanyToolKey): PlanModuleKey {
  if (key === 'whatsapp_chatbot') {
    return 'whatsapp_chatbot'
  }

  return 'tools'
}

export function featureAllowed(flags: PlanEntitlements | null | undefined, feature: PlanModuleKey): boolean {
  if (!flags) {
    return true
  }

  if (feature === 'whatsapp_chatbot') {
    return flags.whatsapp_chatbot === true
  }

  const value = flags[feature]
  return value !== false
}
