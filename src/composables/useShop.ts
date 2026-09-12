import { computed, inject, provide, type InjectionKey, type Ref } from 'vue'
import type { ShopProduct } from '@/types/shop'
import type { Store } from '@/types/store'

export interface ShopContext {
  store: Ref<Store | null>
  catalog: Ref<ShopProduct[]>
  loading: Ref<boolean>
  message: Ref<string>
  slug: Ref<string>
  categoriesOpen: Ref<boolean>
  partnerRef: Ref<number | null>
}

export const shopContextKey: InjectionKey<ShopContext> = Symbol('shop-context')

export function provideShop(context: ShopContext): void {
  provide(shopContextKey, context)
}

export function useShop(): ShopContext {
  const context = inject(shopContextKey)

  if (!context) {
    throw new Error('La tienda pública debe usarse dentro de ShopLayout')
  }

  return context
}

export function useShopProduct(slug: Ref<string>): Ref<ShopProduct | undefined> {
  const { catalog } = useShop()

  return computed(() => catalog.value.find((item) => item.slug === slug.value))
}
