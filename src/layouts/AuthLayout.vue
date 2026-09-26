<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import BrandLogo from '@/components/ui/BrandLogo.vue'
import { useThemeStore } from '@/stores/theme'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    kicker?: string
    wide?: boolean
    withTagline?: boolean
  }>(),
  {
    kicker: 'Acceso al panel',
    wide: false,
    withTagline: false,
  },
)

const theme = useThemeStore()

const highlights = [
  { icon: 'users' as const, title: 'Equipo', text: 'Invitaciones y seguimiento de colaboradores que aceptan unirse.' },
  { icon: 'bag' as const, title: 'Tienda', text: 'Catálogo y pedidos de tu operación.' },
  { icon: 'wallet' as const, title: 'Pagos', text: 'Planes de software con pago seguro.' },
]
</script>

<template>
  <div class="relative min-h-svh bg-shell lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
    <aside class="relative hidden overflow-hidden bg-[#141318] text-white lg:flex lg:flex-col lg:px-12 lg:py-12 xl:px-16">
      <div
        class="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden="true"
        style="background:
          radial-gradient(80% 60% at 0% 100%, color-mix(in srgb, #ffd452 28%, transparent) 0%, transparent 55%),
          radial-gradient(50% 40% at 100% 0%, color-mix(in srgb, #ffd452 12%, transparent) 0%, transparent 50%);"
      />
      <div class="relative">
        <RouterLink to="/login" class="inline-flex" aria-label="REXmlm">
          <BrandLogo surface="dark" :tagline="withTagline" height-class="h-10 xl:h-11" />
        </RouterLink>
        <p class="mt-16 max-w-md font-display text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
          Opera catálogo, tienda y equipo con la claridad de un tablero ejecutivo.
        </p>
        <p class="mt-4 max-w-sm text-sm leading-6 text-white">
          Un acceso para equipo, catálogo y reportes. Sin ruido visual, con la información que usas cada día.
        </p>
      </div>
      <ul class="relative mt-8 space-y-4">
        <li
          v-for="item in highlights"
          :key="item.title"
          class="flex gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-4"
        >
          <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFD452] text-[#1a1a1a]">
            <AppIcon :name="item.icon" :size="16" />
          </span>
          <span>
            <span class="block text-sm font-semibold tracking-tight text-white">{{ item.title }}</span>
            <span class="mt-0.5 block text-[13px] leading-5 text-white">{{ item.text }}</span>
          </span>
        </li>
      </ul>
    </aside>

    <main class="auth-screen relative flex min-h-svh flex-col px-4 py-6 text-ink sm:px-8 lg:px-12 lg:py-10">
      <div class="mb-8 flex items-start justify-between gap-4 lg:mb-0 lg:justify-end">
        <RouterLink to="/login" class="min-w-0 lg:hidden" aria-label="REXmlm">
          <BrandLogo :tagline="withTagline" height-class="h-8" />
        </RouterLink>
        <button
          type="button"
          class="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-card text-ink transition hover:border-gray-mid"
          :title="theme.mode === 'dark' ? 'Modo claro' : 'Modo oscuro'"
          :aria-label="theme.mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          @click="theme.toggle()"
        >
          <AppIcon :name="theme.mode === 'dark' ? 'sun' : 'moon'" :size="16" />
        </button>
      </div>

      <div
        class="flex flex-1 justify-center overflow-y-auto"
        :class="wide ? 'items-start pb-10 lg:pt-8' : 'items-center pb-8'"
      >
        <div class="w-full" :class="wide ? 'max-w-[520px]' : 'max-w-[420px]'">
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ kicker }}</p>
          <h1 class="font-display mt-3 text-[2rem] font-semibold leading-none tracking-tight text-ink sm:text-4xl">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="mt-3 text-sm leading-6 text-muted">{{ subtitle }}</p>
          <div class="mt-8">
            <slot />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
