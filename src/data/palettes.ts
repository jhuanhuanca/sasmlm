export type PaletteTokens = {
  primary: string
  secondary: string
  background: string
  card: string
  text: string
}

export type PalettePreset = {
  id: string
  name: string
  hint: string
  light: PaletteTokens
  dark: PaletteTokens
}

export const defaultPaletteId = 'rex'

export const palettePresets: PalettePreset[] = [
  {
    id: 'rex',
    name: 'REXmlm',
    hint: 'Amarillo y carbón',
    light: {
      primary: '#ffd452',
      secondary: '#252525',
      background: '#f7f5ed',
      card: '#fffdf7',
      text: '#202020',
    },
    dark: {
      primary: '#ffd452',
      secondary: '#0e0e10',
      background: '#17161c',
      card: '#222129',
      text: '#f3efe6',
    },
  },
  {
    id: 'ocean',
    name: 'Océano',
    hint: 'Azul y noche',
    light: {
      primary: '#3db9f5',
      secondary: '#123047',
      background: '#eef6fb',
      card: '#ffffff',
      text: '#12202c',
    },
    dark: {
      primary: '#5cc8ff',
      secondary: '#071018',
      background: '#0c141c',
      card: '#15202b',
      text: '#e8f3fa',
    },
  },
  {
    id: 'forest',
    name: 'Bosque',
    hint: 'Verde y musgo',
    light: {
      primary: '#7dce82',
      secondary: '#1b3a2a',
      background: '#f3f7f2',
      card: '#fbfffa',
      text: '#163024',
    },
    dark: {
      primary: '#8ad990',
      secondary: '#0b1610',
      background: '#101612',
      card: '#18231c',
      text: '#e7f3ea',
    },
  },
  {
    id: 'ruby',
    name: 'Rubí',
    hint: 'Coral y vino',
    light: {
      primary: '#f07167',
      secondary: '#3a1518',
      background: '#fbf4f2',
      card: '#fff8f7',
      text: '#2a1416',
    },
    dark: {
      primary: '#ff8a7a',
      secondary: '#14090a',
      background: '#1a1112',
      card: '#26181a',
      text: '#f8ecea',
    },
  },
  {
    id: 'violet',
    name: 'Violeta',
    hint: 'Lila y uva',
    light: {
      primary: '#c4a0ff',
      secondary: '#2a1b3d',
      background: '#f6f2fb',
      card: '#fdfbff',
      text: '#221833',
    },
    dark: {
      primary: '#d2b4ff',
      secondary: '#120c1a',
      background: '#16121c',
      card: '#221b2c',
      text: '#f3ecfb',
    },
  },
  {
    id: 'amber',
    name: 'Ámbar',
    hint: 'Naranja y café',
    light: {
      primary: '#ffb020',
      secondary: '#2a1f0e',
      background: '#fbf6ea',
      card: '#fffaf0',
      text: '#24190c',
    },
    dark: {
      primary: '#ffc14d',
      secondary: '#120e08',
      background: '#16130e',
      card: '#221c14',
      text: '#f7eedc',
    },
  },
  {
    id: 'slate',
    name: 'Pizarra',
    hint: 'Turquesa y gris',
    light: {
      primary: '#2dd4bf',
      secondary: '#1e293b',
      background: '#f1f5f9',
      card: '#ffffff',
      text: '#0f172a',
    },
    dark: {
      primary: '#5eead4',
      secondary: '#0b1220',
      background: '#0f172a',
      card: '#1e293b',
      text: '#e2e8f0',
    },
  },
]

export function findPalette(id: string): PalettePreset {
  return palettePresets.find((preset) => preset.id === id) ?? palettePresets[0]
}
