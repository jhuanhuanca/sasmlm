import type { Product, Store } from '@/types/store'
import type { ShopProduct } from '@/types/shop'
import { SHOP_CATEGORIES } from '@/types/shop'

const PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1458538977777-0549b2370168?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1547887538-e3a2f32cbade?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1590736969955-71cc94901354?auto=format&fit=crop&w=900&q=80',
]

const DEMO: Array<Omit<ShopProduct, 'id'>> = [
  {
    slug: 'black-daily',
    name: 'Black Daily',
    subtitle: 'Edición nocturna',
    description: 'Fragancia intensa de maderas y ámbar. Pensada para uso diario con persistencia de 8 horas.',
    price: 89,
    compareAt: 102,
    currency: 'USD',
    stock: 18,
    image: PLACEHOLDERS[0],
    category: 'Daily',
    rating: 4.5,
    ratingCount: 12,
    salePercent: 13,
    demo: true,
    sku: 'SKU_1401',
    tags: ['cool', 'men', 'modern'],
  },
  {
    slug: 'casual-odour',
    name: 'Casual Odour',
    subtitle: 'Limited Edition',
    description: 'Cítricos suaves y almizcle limpio. Una firma ligera para clima cálido.',
    price: 72,
    currency: 'USD',
    stock: 24,
    image: PLACEHOLDERS[1],
    category: 'Casual',
    rating: 4.2,
    ratingCount: 8,
    demo: true,
    sku: 'SKU_1402',
    tags: ['casual', 'unisex'],
  },
  {
    slug: 'cool-perfume',
    name: 'Cool Perfume',
    subtitle: 'Sport fresh',
    description: 'Notas acuáticas y menta. El clásico fresco de la línea Cool.',
    price: 118,
    currency: 'USD',
    stock: 73,
    image: PLACEHOLDERS[2],
    category: 'Cool',
    rating: 4.5,
    ratingCount: 4,
    demo: true,
    sku: 'SKU_1418',
    tags: ['cool', 'men', 'sport'],
  },
  {
    slug: 'empire-black',
    name: 'Empire Black',
    subtitle: 'Exclusive',
    description: 'Cuero, incienso y vainilla ahumada. Presencia de gala.',
    price: 49,
    compareAt: 59,
    currency: 'USD',
    stock: 11,
    image: PLACEHOLDERS[3],
    category: 'Exclusive',
    rating: 5,
    ratingCount: 21,
    salePercent: 17,
    demo: true,
    sku: 'SKU_1404',
    tags: ['exclusive', 'night'],
  },
  {
    slug: 'lady-daily',
    name: 'Lady Daily',
    subtitle: 'Floral suave',
    description: 'Rosa, peonía y sándalo. Una estela elegante para el día a día.',
    price: 64,
    currency: 'USD',
    stock: 30,
    image: PLACEHOLDERS[6],
    category: 'Daily',
    rating: 4.8,
    ratingCount: 16,
    demo: true,
    sku: 'SKU_1405',
    tags: ['daily', 'floral'],
  },
  {
    slug: 'odour-of-soul',
    name: 'Odour of Soul',
    subtitle: 'Limited Edition',
    description: 'Neroli, incienso y almizcle blanco. Edición limitada numerada.',
    price: 96,
    compareAt: 120,
    currency: 'USD',
    stock: 7,
    image: PLACEHOLDERS[5],
    category: 'Exclusive',
    rating: 4.7,
    ratingCount: 9,
    salePercent: 20,
    demo: true,
    sku: 'SKU_1406',
    tags: ['exclusive', 'limited'],
  },
  {
    slug: 'pink-sport',
    name: 'Pink Sport',
    subtitle: 'Energía',
    description: 'Pomelo, jengibre y cedro. Ligera, para después del entrenamiento.',
    price: 25,
    currency: 'USD',
    stock: 40,
    image: PLACEHOLDERS[6],
    category: 'Sport',
    rating: 4,
    ratingCount: 6,
    demo: true,
    sku: 'SKU_1407',
    tags: ['sport', 'fresh'],
  },
  {
    slug: 'red-cologne',
    name: 'Red Cologne',
    subtitle: 'Clásico',
    description: 'Bergamota, canela y vetiver. Una colonia con carácter.',
    price: 79,
    currency: 'USD',
    stock: 15,
    image: PLACEHOLDERS[1],
    category: 'Casual',
    rating: 4.3,
    ratingCount: 11,
    demo: true,
    sku: 'SKU_1408',
    tags: ['casual', 'cologne'],
  },
  {
    slug: 'sport-night',
    name: 'Sport Night',
    subtitle: 'After dark',
    description: 'Pimienta, ámbar y cacao. Para salidas después del gym.',
    price: 54,
    currency: 'USD',
    stock: 22,
    image: PLACEHOLDERS[4],
    category: 'Sport',
    rating: 4.1,
    ratingCount: 5,
    demo: true,
    sku: 'SKU_1409',
    tags: ['sport', 'night'],
  },
]

function hashCategory(value: string): string {
  let total = 0
  for (const char of value) {
    total += char.charCodeAt(0)
  }

  return SHOP_CATEGORIES[total % SHOP_CATEGORIES.length]
}

export function leaderDisplayName(store: Store): string {
  const branded = store.identity?.title?.trim()
  if (branded) {
    return branded
  }

  const owner = store.owner_name?.trim()
  if (owner) {
    return owner
  }

  return store.name.replace(/\s+store$/i, '').trim() || store.name
}

export function shopBrandLogo(store: Store | null | undefined): string {
  const custom = store?.identity?.logo?.trim()
  if (custom) {
    return custom
  }

  return store?.company?.logo || ''
}

export function mapApiProduct(product: Product, index: number): ShopProduct {
  const price = Number(product.price)
  const category = product.category?.name?.trim() || hashCategory(product.name)

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    subtitle: product.description?.split(/[.!\n]/)[0]?.slice(0, 42) || 'Edición actual',
    description: product.description || product.technical_sheet || 'Producto de la tienda del líder.',
    price,
    currency: product.currency || 'USD',
    stock: product.stock,
    image: product.image || PLACEHOLDERS[index % PLACEHOLDERS.length],
    category,
    rating: 4.5,
    ratingCount: 4,
    demo: false,
    sku: product.dropship_sku || `SKU_${product.id}`,
    tags: [category.toLowerCase()],
    technicalSheet: product.technical_sheet,
    fulfillment: product.fulfillment,
    incentive: product.incentive?.name
      ? {
          name: product.incentive.name,
          image: product.incentive.image || null,
          qty: Number(product.incentive.qty || product.incentive_qty || 1),
        }
      : null,
  }
}

export function buildCatalog(store: Store): ShopProduct[] {
  const real = (store.products ?? []).map((product, index) => mapApiProduct(product, index))

  if (real.length > 0) {
    return real
  }

  return DEMO.map((item, index) => ({
    ...item,
    id: -(index + 1),
  }))
}

export function categoriesFrom(products: ShopProduct[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>()

  for (const product of products) {
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }))
}
