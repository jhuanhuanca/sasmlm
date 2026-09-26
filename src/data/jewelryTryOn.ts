export type JewelryKind = 'anillo' | 'aretes' | 'collar' | 'pulsera'

export type CatalogJewelryProduct = {
  id: number | string | null
  name: string
  image: string
  category?: string | null
  stock?: number | null
  catalog_company_id?: number | null
  kind: JewelryKind
}

export const JEWELRY_KINDS: Array<{ key: JewelryKind; label: string }> = [
  { key: 'anillo', label: 'Anillo' },
  { key: 'aretes', label: 'Aretes' },
  { key: 'collar', label: 'Collar' },
  { key: 'pulsera', label: 'Pulsera' },
]

export function inferJewelryKind(name: string, category?: string | null): JewelryKind {
  const hay = `${name} ${category ?? ''}`.toLowerCase()

  if (/arete|earring|zarcillo|pendiente/.test(hay)) {
    return 'aretes'
  }
  if (/collar|necklace|cadena|gargantilla|choker/.test(hay)) {
    return 'collar'
  }
  if (/pulsera|bracelet|brazalete|bangle/.test(hay)) {
    return 'pulsera'
  }
  if (/anillo|ring|sortija|alianza|dije/.test(hay)) {
    return 'anillo'
  }

  return 'anillo'
}
