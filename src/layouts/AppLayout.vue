<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import PlanUpgradeCard from '@/components/billing/PlanUpgradeCard.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import DinoTourHost from '@/components/tour/DinoTourHost.vue'
import { useAuthStore } from '@/stores/auth'
import { usePlanAccess } from '@/composables/usePlanAccess'
import { useThemeStore } from '@/stores/theme'
import { companyThemeVars } from '@/utils/brand'
import type { PlanModuleKey } from '@/data/planModules'

useThemeStore()

const route = useRoute()
const auth = useAuthStore()
const { canUse } = usePlanAccess()
const { user, isLeader, hasPaidAccess } = storeToRefs(auth)

const companyVars = computed(() => {
  const path = String(route.path)
  if (path.startsWith('/app/landing')) {
    return {}
  }
  if (
    path.startsWith('/app/tools') ||
    path.startsWith('/app/store') ||
    path.startsWith('/app/team') ||
    path.startsWith('/app/reports') ||
    path === '/app' ||
    path === '/app/'
  ) {
    return companyThemeVars(user.value?.company, 'app')
  }
  return {}
})

const showAppFooter = computed(() => !String(route.path).startsWith('/app/landing'))
const billingLocked = computed(() => isLeader.value && hasPaidAccess.value === false)

const lockedModule = computed((): PlanModuleKey | null => {
  if (auth.isAdmin || billingLocked.value) {
    return null
  }

  if (route.name === 'tools-whatsapp-chatbot' && !canUse('whatsapp_chatbot')) {
    return 'whatsapp_chatbot'
  }

  if (String(route.path).startsWith('/app/tools') && !canUse('tools')) {
    return 'tools'
  }

  const feature = route.meta.planFeature
  if (typeof feature === 'string' && feature !== 'tools') {
    const key = feature as PlanModuleKey
    if (!canUse(key)) {
      return key
    }
  }

  return null
})
</script>

<template>
  <div class="app-shell flex h-svh w-full flex-col overflow-hidden" :style="companyVars">
    <div class="z-50 shrink-0 border-b border-line bg-shell px-4 pt-2 sm:px-5 md:px-6 lg:px-8" data-tour="app-nav">
      <AppHeader />
    </div>
    <main
      class="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 sm:px-5 md:px-8 md:pt-8 lg:px-10"
    >
      <div
        v-if="billingLocked && route.name !== 'become-leader'"
        class="mb-6 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
      >
        <p class="font-semibold">Tu suscripción no está al día</p>
        <p class="mt-1">
          Paddle no pudo cobrar el plan. Hasta que pagues no puedes usar tienda, landing, equipo ni herramientas.
        </p>
        <RouterLink class="mt-2 inline-block font-medium underline" :to="{ name: 'become-leader' }">
          Regularizar pago
        </RouterLink>
      </div>
      <PlanUpgradeCard v-if="lockedModule" :feature="lockedModule" />
      <RouterView v-else />
      <footer
        v-if="showAppFooter"
        class="mt-10 border-t border-line pb-28 pt-4 text-center text-[11px] leading-5 text-muted sm:pb-32"
      >
        <p class="font-medium tracking-tight text-ink">REXmlm</p>
        <p class="mt-0.5">Panel de líderes</p>
      </footer>
    </main>
    <DinoTourHost />
  </div>
</template>
