<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPublicLanding } from '@/api/landing'
import { fetchPublicStore } from '@/api/store'
import LandingPageCanvas from '@/components/landing/LandingPageCanvas.vue'
import type { CompanyBrand, LandingSummary } from '@/types/auth'
import { leaderDisplayName } from '@/utils/shopCatalog'
import '@/styles/landing.css'

const route = useRoute()
const landing = ref<LandingSummary | null>(null)
const brand = ref<CompanyBrand | null>(null)
const storeSlug = ref(String(route.params.slug ?? ''))
const whatsapp = ref('')
const leader = ref('')
const loading = ref(true)
const missing = ref(false)

function prettySlug(value: string): string {
  return value
    .replace(/-\d+$/, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function load(): Promise<void> {
  loading.value = true
  missing.value = false
  landing.value = null

  const slug = String(route.params.slug ?? '')
  leader.value = prettySlug(slug)
  storeSlug.value = slug
  brand.value = null
  whatsapp.value = ''

  const [landingResult, storeResult] = await Promise.allSettled([
    fetchPublicLanding(slug),
    fetchPublicStore(slug),
  ])

  if (landingResult.status === 'fulfilled') {
    landing.value = landingResult.value
    leader.value = landingResult.value.owner_name || landingResult.value.title || leader.value
    storeSlug.value = landingResult.value.store_slug || storeSlug.value
    whatsapp.value = landingResult.value.whatsapp || landingResult.value.content?.whatsapp || whatsapp.value
    brand.value = landingResult.value.company ?? brand.value
  }

  if (storeResult.status === 'fulfilled') {
    storeSlug.value = storeResult.value.slug || storeSlug.value
    if (!landing.value?.title) {
      leader.value = leaderDisplayName(storeResult.value) || leader.value
    }
    whatsapp.value =
      storeResult.value.whatsapp || String(storeResult.value.settings?.whatsapp ?? '') || whatsapp.value
    brand.value = brand.value ?? storeResult.value.company ?? null
  }

  missing.value = landingResult.status !== 'fulfilled'
  loading.value = false
}

watch(
  () => String(route.params.slug ?? ''),
  () => {
    void load()
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="loading" class="lp-boot" aria-busy="true">
    <p>Cargando…</p>
  </div>
  <div v-else-if="missing" class="lp-boot">
    <p>Esta landing no está publicada.</p>
  </div>
  <LandingPageCanvas
    v-else
    :landing="landing"
    :brand="brand"
    :leader="leader"
    :store-slug="storeSlug"
    :whatsapp="whatsapp"
  />
</template>
