<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import ShopHeader from '@/components/shop/ShopHeader.vue'
import { provideShop } from '@/composables/useShop'
import { fetchPublicStore } from '@/api/store'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import type { ShopProduct } from '@/types/shop'
import type { Store } from '@/types/store'
import { shopThemeVars } from '@/utils/brand'
import { resolveShopPartnerRef } from '@/utils/shopReferral'
import { buildCatalog } from '@/utils/shopCatalog'
import { errorMessage } from '@/utils/http'
import '@/styles/shop.css'

useThemeStore()

const route = useRoute()
const auth = useAuthStore()
const store = ref<Store | null>(null)
const catalog = ref<ShopProduct[]>([])
const loading = ref(true)
const message = ref('')
const categoriesOpen = ref(false)
const partnerRef = ref<number | null>(null)
const slug = computed(() => String(route.params.slug ?? ''))

const themeVars = computed(() =>
  shopThemeVars(store.value?.company, store.value?.identity?.palette),
)

provideShop({ store, catalog, loading, message, slug, categoriesOpen, partnerRef })

function syncPartnerRef(): void {
  const queryRef = typeof route.query.ref === 'string' ? route.query.ref : ''
  partnerRef.value = resolveShopPartnerRef(
    slug.value,
    queryRef,
    auth.isPartnerOnly ? auth.user?.id : null,
  )
}

async function load(): Promise<void> {
  loading.value = true
  message.value = ''
  store.value = null
  catalog.value = []

  try {
    store.value = await fetchPublicStore(slug.value)
    catalog.value = buildCatalog(store.value)
  } catch (error) {
    store.value = null
    catalog.value = []
    message.value = errorMessage(error, 'Tienda no disponible')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void (async () => {
    if (!auth.booted) {
      await auth.hydrate()
    }
    syncPartnerRef()
  })()
})

watch(slug, () => {
  syncPartnerRef()
  void load()
}, { immediate: true })

watch(
  () => route.query.ref,
  () => {
    syncPartnerRef()
  },
)
</script>

<template>
  <div class="shop-root" :style="themeVars">
    <ShopHeader v-if="store" />
    <div v-if="loading" class="shop-wrap py-16 text-sm text-[var(--shop-muted)]">Cargando tienda…</div>
    <div v-else-if="message" class="shop-wrap py-16 text-sm">{{ message }}</div>
    <RouterView v-else />
  </div>
</template>
