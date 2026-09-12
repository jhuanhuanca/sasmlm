<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import ShopGiftBadge from '@/components/shop/ShopGiftBadge.vue'
import { useShop } from '@/composables/useShop'
import { useShopCartStore } from '@/stores/shopCart'
import type { ShopProduct } from '@/types/shop'
import { money } from '@/utils/format'
import { useToast } from '@/composables/useToast'
import { categoriesFrom, leaderDisplayName } from '@/utils/shopCatalog'

const { store, catalog, slug } = useShop()
const cart = useShopCartStore()
const toast = useToast()
const route = useRoute()

function addToCart(product: ShopProduct): void {
  const error = cart.add(product)
  if (error) {
    toast.error(error, 'Moneda del carrito')
    return
  }
  cart.open = true
}

const perPage = ref(9)
const page = ref(1)
const minPrice = ref(0)
const maxPrice = ref(500)

const leader = computed(() => (store.value ? leaderDisplayName(store.value) : ''))
const activeCat = computed(() => (typeof route.query.cat === 'string' ? route.query.cat : ''))
const query = computed(() => (typeof route.query.q === 'string' ? route.query.q.toLowerCase() : ''))
const categories = computed(() => categoriesFrom(catalog.value))

const bounds = computed(() => {
  const prices = catalog.value.map((item) => item.price)
  return {
    min: Math.floor(Math.min(...prices, 0)),
    max: Math.ceil(Math.max(...prices, 100)),
  }
})

watch(
  catalog,
  (items) => {
    if (!items.length) {
      return
    }

    minPrice.value = bounds.value.min
    maxPrice.value = bounds.value.max
  },
  { immediate: true },
)

const filtered = computed(() =>
  catalog.value.filter((item) => {
    if (activeCat.value && item.category !== activeCat.value) {
      return false
    }

    if (query.value && !item.name.toLowerCase().includes(query.value)) {
      return false
    }

    return item.price >= minPrice.value && item.price <= maxPrice.value
  }),
)

const visible = computed(() => filtered.value.slice(0, page.value * perPage.value))
const others = computed(() => catalog.value.slice(0, 3))
const sample = computed(() => catalog.value.some((item) => item.demo))

function productTo(product: ShopProduct) {
  return { name: 'public-product', params: { slug: slug.value, productSlug: product.slug } }
}
</script>

<template>
  <div>
    <div class="shop-crumb hidden lg:block">
      <div class="shop-wrap flex items-center gap-2 py-2 text-sm">
        <AppIcon name="home" :size="14" />
        <span>»</span>
        <span>Productos</span>
      </div>
    </div>

    <div class="shop-catalog shop-wrap py-8">
      <section class="min-w-0">
        <h1 class="font-display text-4xl font-bold md:text-6xl">Tienda</h1>
        <p v-if="sample" class="mt-2 hidden text-sm text-[var(--shop-muted)] lg:block">
          Catálogo de muestra de {{ leader }}. Cuando cargues productos reales, reemplazan esta vitrina.
        </p>
        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--shop-muted)]">
          <p>Mostrando 1–{{ visible.length }} de {{ filtered.length }} resultados</p>
          <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <select class="border border-[var(--shop-line)] bg-transparent px-3 py-2">
              <option>Predeterminado</option>
            </select>
            <select v-model.number="perPage" class="border border-[var(--shop-line)] bg-transparent px-3 py-2">
              <option :value="9">9 productos</option>
              <option :value="12">12 productos</option>
            </select>
          </div>
        </div>

        <div class="mt-5 flex min-w-0 gap-3 overflow-x-auto pb-2">
          <RouterLink
            :to="{ name: 'public-store', params: { slug }, query: {} }"
            class="shop-cat inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-3 text-sm"
            :class="{ 'is-active': !activeCat }"
          >
            <AppIcon name="folder" :size="14" />
            Todos los productos · {{ catalog.length }} artículos
          </RouterLink>
          <RouterLink
            v-for="category in categories"
            :key="category.name"
            :to="{ name: 'public-store', params: { slug }, query: { cat: category.name } }"
            class="shop-cat inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-3 text-sm"
            :class="{ 'is-active': activeCat === category.name }"
          >
            <AppIcon name="folder" :size="14" />
            {{ category.name }} · {{ category.count }} artículos
          </RouterLink>
        </div>

        <div class="shop-product-grid mt-8">
          <article v-for="product in visible" :key="product.id" class="min-w-0">
            <RouterLink :to="productTo(product)" class="group block min-w-0">
              <div class="relative aspect-square overflow-hidden bg-[var(--shop-card)]">
                <img :src="product.image" :alt="product.name" class="h-full w-full max-w-full object-cover" />
                <ShopGiftBadge
                  v-if="product.incentive"
                  :name="product.incentive.name"
                  :image="product.incentive.image"
                  :qty="product.incentive.qty"
                />
                <span v-if="product.salePercent" class="shop-sale">Oferta {{ product.salePercent }}%</span>
                <span v-if="product.salePercent" class="shop-promo">
                  {{ product.salePercent }}% DCTO
                </span>
              </div>
              <h2 class="font-display mt-3 text-center text-sm leading-tight break-words md:text-2xl">{{ product.name }}</h2>
              <p class="mt-1 text-center text-xs tracking-wide text-[var(--shop-muted)] uppercase">
                {{ product.category }}
              </p>
              <p class="mt-2 text-center text-xs md:text-sm">
                <span v-if="product.compareAt" class="mr-1 text-[var(--shop-muted)] line-through">
                  {{ money(product.compareAt, product.currency) }}
                </span>
                {{ money(product.price, product.currency) }}
              </p>
            </RouterLink>
            <button
              type="button"
              class="mt-3 hidden w-full bg-charcoal py-2 text-xs tracking-[0.14em] text-white uppercase lg:block"
              @click="addToCart(product)"
            >
              Agregar al carrito
            </button>
          </article>
        </div>
      </section>

      <aside class="hidden space-y-6 lg:block">
        <section>
          <h3 class="bg-[var(--shop-panel)] px-4 py-3 font-display text-lg">Filtrar por precio</h3>
          <div class="space-y-3 border border-[var(--shop-line)] border-t-0 p-4">
            <input v-model.number="minPrice" class="shop-range w-full" type="range" :min="bounds.min" :max="bounds.max" />
            <input v-model.number="maxPrice" class="shop-range w-full" type="range" :min="bounds.min" :max="bounds.max" />
            <p class="text-sm">
              Precio: {{ money(minPrice) }} — {{ money(maxPrice) }}
            </p>
            <button type="button" class="bg-charcoal px-5 py-2 text-xs tracking-[0.14em] text-white uppercase">
              Filtrar
            </button>
          </div>
        </section>

        <section>
          <h3 class="bg-[var(--shop-panel)] px-4 py-3 font-display text-lg">Otros productos</h3>
          <ul class="space-y-4 border border-[var(--shop-line)] border-t-0 p-4">
            <li v-for="product in others" :key="`o-${product.id}`" class="flex gap-3">
              <div class="relative h-16 w-16 shrink-0">
                <img :src="product.image" :alt="product.name" class="h-16 w-16 object-cover" />
                <ShopGiftBadge
                  v-if="product.incentive"
                  compact
                  :name="product.incentive.name"
                  :image="product.incentive.image"
                  :qty="product.incentive.qty"
                />
              </div>
              <div>
                <RouterLink :to="productTo(product)" class="font-medium">{{ product.name }}</RouterLink>
                <p class="shop-stars text-xs">★★★★★</p>
                <p class="text-sm">
                  <span v-if="product.compareAt" class="mr-1 text-[var(--shop-muted)] line-through">
                    {{ money(product.compareAt, product.currency) }}
                  </span>
                  {{ money(product.price, product.currency) }}
                </p>
              </div>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
</template>
