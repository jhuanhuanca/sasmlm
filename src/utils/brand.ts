import type { CompanyBrand, LandingPalette } from '@/types/auth'
import { mixHex, onColor, parseBrandHex } from '@/utils/color'

function isHex(value?: string | null): value is string {
  return parseBrandHex(value) !== null
}

function firstHex(...values: Array<string | null | undefined>): string | undefined {
  for (const value of values) {
    const parsed = parseBrandHex(value)
    if (parsed) {
      return parsed
    }
  }

  return undefined
}

export function companyThemeVars(
  brand: CompanyBrand | null | undefined,
  surface: 'shop' | 'landing' | 'app',
): Record<string, string> {
  const palette = brand?.color_palette
  const hasPalette = isHex(palette?.primary) || isHex(palette?.secondary) || isHex(palette?.accent)

  if (!hasPalette) {
    return {}
  }

  const primary = isHex(palette?.primary) ? palette.primary : '#ffd452'
  const secondary = isHex(palette?.secondary) ? palette.secondary : '#111111'
  const accent = isHex(palette?.accent) ? palette.accent : '#ffffff'

  if (surface === 'shop') {
    return {
      '--shop-gold': primary,
      '--shop-bar': secondary,
      '--shop-panel': accent,
      '--shop-ink': secondary,
    }
  }

  if (surface === 'app') {
    return {
      '--rex-yellow': primary,
      '--rex-yellow-soft': mixHex(primary, accent, 0.72),
      '--rex-charcoal': secondary,
      '--rex-on-yellow': onColor(primary),
      '--rex-on-charcoal': onColor(secondary),
    }
  }

  return {
    '--lp-yellow': primary,
    '--lp-ink': secondary,
    '--lp-white': accent,
    '--lp-on-yellow': onColor(primary),
  }
}

export function landingThemeVars(
  brand: CompanyBrand | null | undefined,
  leaderPalette?: LandingPalette | null,
): Record<string, string> {
  const company = brand?.color_palette
  const principal1 = firstHex(leaderPalette?.principal?.[0], leaderPalette?.primary, company?.primary)
  const principal2 = firstHex(leaderPalette?.principal?.[1], principal1, company?.accent)
  const complement1 = firstHex(leaderPalette?.complementarios?.[0], leaderPalette?.secondary, company?.secondary)
  const complement2 = firstHex(leaderPalette?.complementarios?.[1], principal2, principal1)
  const complement3 = firstHex(leaderPalette?.complementarios?.[2], principal1, complement1)

  if (!principal1 && !complement1) {
    return companyThemeVars(brand, 'landing')
  }

  const primary = principal1 ?? '#ffd452'
  const ink = complement1 ?? '#111111'

  return {
    '--lp-yellow': primary,
    '--lp-principal-2': principal2 ?? primary,
    '--lp-ink': ink,
    '--lp-complement-2': complement2 ?? primary,
    '--lp-complement-3': complement3 ?? ink,
    '--lp-white': '#ffffff',
    '--lp-on-yellow': onColor(primary),
    '--lp-on-complement-2': onColor(complement2 ?? primary),
  }
}

export function shopThemeVars(
  brand: CompanyBrand | null | undefined,
  leaderPalette?: LandingPalette | null,
): Record<string, string> {
  const landing = landingThemeVars(brand, leaderPalette)
  const companyShop = companyThemeVars(brand, 'shop')

  if (!landing['--lp-yellow'] && !companyShop['--shop-gold']) {
    return {}
  }

  const gold = landing['--lp-yellow'] ?? companyShop['--shop-gold'] ?? '#ffd452'
  const ink = landing['--lp-ink'] ?? companyShop['--shop-ink'] ?? '#111111'
  const soft = landing['--lp-principal-2'] ?? gold

  return {
    ...companyShop,
    '--shop-gold': gold,
    '--shop-bar': soft,
    '--shop-ink': ink,
    '--shop-panel': mixHex(soft, '#ffffff', 0.82),
  }
}
