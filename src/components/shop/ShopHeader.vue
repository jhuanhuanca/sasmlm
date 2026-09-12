<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import ShopCartDrawer from '@/components/shop/ShopCartDrawer.vue'
import { useShop } from '@/composables/useShop'
import { useAuthStore } from '@/stores/auth'
import { useShopCartStore } from '@/stores/shopCart'
import { useThemeStore } from '@/stores/theme'
import { categoriesFrom, leaderDisplayName, shopBrandLogo } from '@/utils/shopCatalog'
import { shopRefQuery } from '@/utils/shopReferral'

const { store, catalog, slug, categoriesOpen, partnerRef } = useShop()
const cart = useShopCartStore()
const theme = useThemeStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const searchOpen = ref(false)
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')

const leader = computed(() => (store.value ? leaderDisplayName(store.value) : 'Tienda'))
const companyLogo = computed(() => shopBrandLogo(store.value))
const companyName = computed(() => store.value?.company?.name || '')
const categories = computed(() => categoriesFrom(catalog.value))
const activeCat = computed(() => (typeof route.query.cat === 'string' ? route.query.cat : ''))
const isHome = computed(() => route.name === 'public-store' && !activeCat.value)
const refQuery = computed(() => shopRefQuery(partnerRef.value))
const sellingAsPartner = computed(
  () => Boolean(partnerRef.value) && auth.isPartnerOnly && auth.user?.id === partnerRef.value,
)

function goHome(): void {
  categoriesOpen.value = false
  cart.open = false
  void router.push({ name: 'public-store', params: { slug: slug.value }, query: { ...refQuery.value } })
}

function goCategory(name: string): void {
  categoriesOpen.value = false
  void router.push({
    name: 'public-store',
    params: { slug: slug.value },
    query: {
      ...refQuery.value,
      ...(name ? { cat: name } : {}),
    },
  })
}

function openCart(): void {
  categoriesOpen.value = false
  cart.open = true
}

function toggleCategories(): void {
  cart.open = false
  categoriesOpen.value = !categoriesOpen.value
}

function submitSearch(): void {
  void router.push({
    name: 'public-store',
    params: { slug: slug.value },
    query: {
      ...refQuery.value,
      ...(activeCat.value ? { cat: activeCat.value } : {}),
      ...(query.value ? { q: query.value } : {}),
    },
  })
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-[var(--shop-line)] bg-[var(--shop-bg)]">
    <div class="shop-wrap flex items-center justify-between gap-3 py-3 lg:hidden">
      <button type="button" class="shop-gold-btn relative" aria-label="Carrito" @click="openCart">
        <AppIcon name="bag" :size="18" />
        <span class="shop-badge">{{ cart.count }}</span>
      </button>
      <RouterLink :to="{ name: 'public-store', params: { slug }, query: refQuery }" class="flex min-w-0 items-center justify-center gap-2">
        <img v-if="companyLogo" :src="companyLogo" alt="" class="shop-brand-logo is-compact" />
        <p class="font-display truncate text-xl font-bold tracking-tight">{{ leader }}</p>
      </RouterLink>
      <button
        type="button"
        class="shop-gold-btn"
        :aria-label="theme.mode === 'dark' ? 'Modo claro' : 'Modo oscuro'"
        @click="theme.toggle()"
      >
        <AppIcon :name="theme.mode === 'dark' ? 'sun' : 'moon'" :size="18" />
      </button>
    </div>

    <div class="shop-wrap hidden items-center gap-3 py-4 lg:flex">
      <RouterLink :to="{ name: 'public-store', params: { slug }, query: refQuery }" class="flex min-w-0 items-center gap-3">
        <img v-if="companyLogo" :src="companyLogo" alt="" class="shop-brand-logo" />
        <span class="min-w-0">
          <p class="font-display truncate text-3xl font-bold tracking-tight">{{ leader }}</p>
          <p class="text-[10px] tracking-[0.22em] text-[var(--shop-muted)] uppercase">
            {{ companyName || 'Tienda oficial' }}
          </p>
        </span>
      </RouterLink>

      <nav class="flex min-w-0 flex-1 items-center justify-center gap-5">
        <button type="button" class="shop-nav-link" :class="{ 'is-active': !activeCat }" @click="goCategory('')">
          Tienda
        </button>
        <button
          v-for="category in categories"
          :key="category.name"
          type="button"
          class="shop-nav-link"
          :class="{ 'is-active': activeCat === category.name }"
          @click="goCategory(category.name)"
        >
          {{ category.name }}
        </button>
      </nav>

      <div class="ml-auto flex items-center gap-3">
        <button type="button" class="grid h-10 w-10 place-items-center" title="Buscar" @click="searchOpen = !searchOpen">
          <AppIcon name="search" :size="18" />
        </button>
        <button
          type="button"
          class="grid h-10 w-10 place-items-center"
          :title="theme.mode === 'dark' ? 'Modo claro' : 'Modo oscuro'"
          @click="theme.toggle()"
        >
          <AppIcon :name="theme.mode === 'dark' ? 'sun' : 'moon'" :size="16" />
        </button>
        <button
          type="button"
          class="relative inline-flex items-center gap-2 bg-charcoal px-3 py-2 text-xs tracking-[0.14em] text-white uppercase"
          @click="openCart"
        >
          <span class="relative">
            <AppIcon name="bag" :size="16" />
            <span class="shop-badge">{{ cart.count }}</span>
          </span>
          Carrito
        </button>
      </div>
    </div>

    <form v-if="searchOpen" class="shop-wrap hidden pb-4 lg:block" @submit.prevent="submitSearch">
      <input
        v-model="query"
        class="w-full border border-[var(--shop-line)] bg-transparent px-4 py-3 text-sm outline-none"
        placeholder="Buscar en la tienda…"
      />
    </form>
    <p v-if="sellingAsPartner" class="shop-wrap pb-3 text-xs text-[var(--shop-muted)]">
      Las compras de esta sesión se registran a nombre de {{ auth.user?.name }}.
    </p>
  </header>

  <div v-if="categoriesOpen" class="fixed inset-0 z-40 lg:hidden">
    <button class="absolute inset-0 bg-black/40" aria-label="Cerrar categorías" @click="categoriesOpen = false" />
    <nav
      class="shop-sheet absolute inset-x-0 bottom-[4.75rem] max-h-[60svh] overflow-y-auto rounded-t-2xl p-4 pb-6"
    >
      <p class="mb-3 text-xs tracking-[0.16em] text-[var(--shop-muted)] uppercase">Categorías</p>
      <button type="button" class="flex w-full items-center justify-between py-3 text-left" @click="goCategory('')">
        Todas
        <span class="text-[var(--shop-muted)]">{{ catalog.length }}</span>
      </button>
      <button
        v-for="category in categories"
        :key="`sheet-${category.name}`"
        type="button"
        class="flex w-full items-center justify-between border-t border-[var(--shop-line)] py-3 text-left"
        @click="goCategory(category.name)"
      >
        {{ category.name }}
        <span class="text-[var(--shop-muted)]">{{ category.count }}</span>
      </button>
    </nav>
  </div>

  <nav class="shop-dock lg:hidden">
    <button type="button" class="shop-dock-item" :class="{ 'is-active': isHome }" @click="goHome">
      <span class="shop-dock-icon">
        <AppIcon name="home" :size="18" />
      </span>
      Inicio
    </button>
    <button type="button" class="shop-dock-item" :class="{ 'is-active': categoriesOpen }" @click="toggleCategories">
      <span class="shop-dock-icon">
        <AppIcon name="folder" :size="18" />
      </span>
      Categorías
    </button>
    <button type="button" class="shop-dock-item" :class="{ 'is-active': cart.open }" @click="openCart">
      <span class="shop-dock-icon relative">
        <AppIcon name="bag" :size="18" />
        <span v-if="cart.count" class="shop-badge">{{ cart.count }}</span>
      </span>
      Carrito
    </button>
  </nav>

  <ShopCartDrawer />
</template>
