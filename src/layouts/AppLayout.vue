<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppHeader from '@/components/layout/AppHeader.vue'
import DinoTourHost from '@/components/tour/DinoTourHost.vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { companyThemeVars } from '@/utils/brand'

useThemeStore()

const route = useRoute()
const { user } = storeToRefs(useAuthStore())
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
</script>

<template>
  <div class="app-shell flex h-svh w-full flex-col overflow-hidden" :style="companyVars">
    <div class="z-50 shrink-0 border-b border-line bg-shell px-4 pt-2 sm:px-5 md:px-6 lg:px-8" data-tour="app-nav">
      <AppHeader />
    </div>
    <main
      class="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 sm:px-5 md:px-8 md:pt-8 lg:px-10"
    >
      <RouterView />
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
