import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { defaultPaletteId, findPalette, palettePresets, type PaletteTokens } from '@/data/palettes'
import { mixHex, normalizeHex, onColor } from '@/utils/color'

const THEME_KEY = 'rexmlm.theme'
const PALETTE_KEY = 'rexmlm.palette'

export type ThemeMode = 'light' | 'dark'

export type PaletteState = {
  presetId: string
  custom: {
    light: PaletteTokens
    dark: PaletteTokens
  } | null
}

const rex = findPalette(defaultPaletteId)

function readTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return 'dark'
}

function readPalette(): PaletteState {
  try {
    const stored = JSON.parse(localStorage.getItem(PALETTE_KEY) ?? '') as PaletteState
    if (stored && typeof stored.presetId === 'string') {
      return stored
    }
  } catch {
    /* ignore */
  }

  return { presetId: defaultPaletteId, custom: null }
}

function tokensFor(state: PaletteState, mode: ThemeMode): PaletteTokens {
  if (state.presetId === 'custom' && state.custom) {
    return state.custom[mode]
  }

  return findPalette(state.presetId)[mode]
}

function applyThemeClass(mode: ThemeMode): void {
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

function applyTokens(tokens: PaletteTokens, mode: ThemeMode): void {
  const root = document.documentElement
  const primary = normalizeHex(tokens.primary, rex[mode].primary)
  const secondary = normalizeHex(tokens.secondary, rex[mode].secondary)
  const background = normalizeHex(tokens.background, rex[mode].background)
  const card = normalizeHex(tokens.card, rex[mode].card)
  const text = normalizeHex(tokens.text, rex[mode].text)
  const muted = mixHex(text, background, mode === 'dark' ? 0.42 : 0.48)
  const line = mixHex(text, background, mode === 'dark' ? 0.78 : 0.86)
  const canvas = mixHex(background, secondary, mode === 'dark' ? 0.18 : 0.22)
  const yellowSoft = mixHex(primary, background, mode === 'dark' ? 0.78 : 0.72)
  const task = mixHex(secondary, '#000000', 0.28)
  const stripeA = mixHex(background, text, mode === 'dark' ? 0.08 : 0.06)
  const stripeB = background

  const vars: Record<string, string> = {
    '--rex-yellow': primary,
    '--rex-yellow-soft': yellowSoft,
    '--rex-charcoal': secondary,
    '--rex-shell': background,
    '--rex-card': card,
    '--rex-ink': text,
    '--rex-muted': muted,
    '--rex-line': line,
    '--rex-canvas': canvas,
    '--rex-gray-mid': mixHex(text, background, 0.5),
    '--rex-task': task,
    '--rex-stripe-a': stripeA,
    '--rex-stripe-b': stripeB,
    '--rex-on-yellow': onColor(primary, text, card),
    '--rex-on-charcoal': onColor(secondary, text, card),
  }

  Object.entries(vars).forEach(([name, value]) => {
    root.style.setProperty(name, value)
  })
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(readTheme())
  const palette = ref<PaletteState>(readPalette())

  const tokens = computed(() => tokensFor(palette.value, mode.value))
  const presets = palettePresets
  const isCustom = computed(() => palette.value.presetId === 'custom')

  function persistPalette(): void {
    localStorage.setItem(PALETTE_KEY, JSON.stringify(palette.value))
    applyTokens(tokens.value, mode.value)
  }

  function setMode(next: ThemeMode): void {
    mode.value = next
    localStorage.setItem(THEME_KEY, next)
    applyThemeClass(next)
    applyTokens(tokens.value, next)
  }

  function toggle(): void {
    setMode(mode.value === 'dark' ? 'light' : 'dark')
  }

  function setPreset(id: string): void {
    palette.value = { presetId: id, custom: null }
    persistPalette()
  }

  function setToken(key: keyof PaletteTokens, value: string): void {
    const nextValue = normalizeHex(value, tokens.value[key])
    const custom = palette.value.custom ?? {
      light: { ...findPalette(palette.value.presetId === 'custom' ? defaultPaletteId : palette.value.presetId).light },
      dark: { ...findPalette(palette.value.presetId === 'custom' ? defaultPaletteId : palette.value.presetId).dark },
    }

    custom[mode.value] = { ...custom[mode.value], [key]: nextValue }
    palette.value = { presetId: 'custom', custom }
    persistPalette()
  }

  function resetPalette(): void {
    setPreset(defaultPaletteId)
  }

  applyThemeClass(mode.value)
  applyTokens(tokens.value, mode.value)

  return {
    mode,
    palette,
    tokens,
    presets,
    isCustom,
    setMode,
    toggle,
    setPreset,
    setToken,
    resetPalette,
  }
})
