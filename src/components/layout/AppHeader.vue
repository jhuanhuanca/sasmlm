<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/AppIcon.vue'
import BrandLogo from '@/components/ui/BrandLogo.vue'
import ClayTile from '@/components/ui/ClayTile.vue'
import UserAvatar from '@/components/ui/UserAvatar.vue'
import NotificationBell from '@/components/layout/NotificationBell.vue'
import { useAuthStore } from '@/stores/auth'
import { useDinoTourStore } from '@/stores/dinoTour'
import { useThemeStore } from '@/stores/theme'
import { dinoTours, tourIdForRoute } from '@/data/dinoTours'

type NavLink = {
  to: RouteLocationRaw
  name: string
  label: string
  shortLabel?: string
  icon: IconName
  external?: boolean
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()
const tour = useDinoTourStore()
const { user, isLeader, isAdmin, isPartnerOnly } = storeToRefs(auth)
const menuOpen = ref(false)
const accountOpen = ref(false)
const accountMenu = ref<HTMLElement | null>(null)

const canLead = computed(() => isLeader.value || isAdmin.value)
const pageTourId = computed(() => tourIdForRoute(route.name, isPartnerOnly.value))
const pageTourLabel = computed(() =>
  pageTourId.value ? dinoTours[pageTourId.value].launcher : 'Rex te explica este módulo',
)

const links = computed((): NavLink[] => {
  if (isPartnerOnly.value) {
    const items: NavLink[] = [{ to: '/app', name: 'dashboard', label: 'Dashboard', icon: 'home' }]
    const landingSlug = user.value?.sponsor?.landing_page?.slug
    const storeSlug = user.value?.sponsor?.store?.slug

    if (landingSlug) {
      items.push({
        to: { name: 'public-landing', params: { slug: landingSlug } },
        name: 'public-landing',
        label: 'Landing',
        icon: 'zap',
        external: true,
      })
    }

    if (storeSlug) {
      items.push({
        to: {
          name: 'public-store',
          params: { slug: storeSlug },
          query: user.value?.id ? { ref: String(user.value.id) } : {},
        },
        name: 'public-store',
        label: 'Tienda',
        icon: 'bag',
        external: true,
      })
    }

    items.push(
      { to: '/app/tools', name: 'tools', label: 'Herramientas', icon: 'heart' },
      { to: '/app/become-leader', name: 'become-leader', label: 'Volverse líder', icon: 'star' },
      { to: '/app/soporte', name: 'support', label: 'Soporte', icon: 'clipboard' },
    )

    return items
  }

  return [
    { to: '/app', name: 'dashboard', label: 'Dashboard', icon: 'home' },
    ...(canLead.value
      ? ([
          { to: '/app/team', name: 'team', label: 'Equipo', icon: 'users' },
          { to: '/app/invitations', name: 'invitations', label: 'Invitaciones', icon: 'mail' },
        ] satisfies NavLink[])
      : []),
    { to: '/app/store', name: 'store', label: 'Tienda', icon: 'bag' },
    { to: '/app/landing', name: 'landing', label: 'Landing', icon: 'zap' },
    { to: '/app/tools', name: 'tools', label: 'Herramientas', icon: 'heart' },
    ...(canLead.value
      ? ([
          { to: '/app/commissions', name: 'commissions', label: 'Comisiones', icon: 'wallet' },
          { to: '/app/cierre', name: 'monthly-closing', label: 'Cierre de mes', shortLabel: 'Cierre', icon: 'calendar' },
          { to: '/app/soporte', name: 'support', label: 'Soporte', icon: 'clipboard' },
        ] satisfies NavLink[])
      : []),
  ]
})

function isActive(name: string): boolean {
  if (name === 'dashboard') {
    return route.name === 'dashboard'
  }

  if (name === 'tools') {
    return String(route.path).startsWith('/app/tools')
  }

  if (name === 'team') {
    return route.name === 'team' || route.name === 'team-member'
  }

  return route.name === name
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
    accountOpen.value = false
  },
)

function onDocumentClick(event: MouseEvent): void {
  if (!accountMenu.value?.contains(event.target as Node)) {
    accountOpen.value = false
  }
}

function onDocumentKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    accountOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})

async function logout(): Promise<void> {
  accountOpen.value = false
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <header>
    <div class="flex items-stretch gap-2 sm:gap-3 lg:gap-4">
      <button
        type="button"
        class="my-1 grid h-10 w-10 shrink-0 place-items-center self-center rounded-full border border-line bg-card text-ink lg:hidden"
        :aria-expanded="menuOpen"
        aria-label="Abrir menú"
        @click="menuOpen = !menuOpen"
      >
        <AppIcon :name="menuOpen ? 'close' : 'menu'" :size="18" />
      </button>

      <RouterLink to="/app" class="my-1 inline-flex min-w-0 shrink-0 items-center self-center" aria-label="REXmlm">
        <BrandLogo height-class="h-7 sm:h-8" />
      </RouterLink>

      <nav
        class="hide-scrollbar hidden min-w-0 flex-1 items-stretch justify-center gap-0 overflow-x-auto text-ink lg:flex"
        aria-label="Secciones del panel"
      >
        <RouterLink
          v-for="link in links"
          :key="link.name"
          :to="link.to"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noreferrer' : undefined"
          class="inline-flex min-w-[4.5rem] shrink-0 flex-col items-center gap-1 border-b-2 px-2.5 pb-2 pt-0.5 text-center text-[11px] font-medium whitespace-nowrap transition xl:min-w-[5rem] xl:px-3 xl:text-[12px]"
          :class="
            isActive(link.name)
              ? 'border-charcoal text-ink dark:border-yellow'
              : 'border-transparent text-muted hover:border-line hover:text-ink'
          "
        >
          <ClayTile :name="link.icon" size="xs" />
          {{ link.shortLabel ?? link.label }}
        </RouterLink>
      </nav>

      <div class="ml-auto flex shrink-0 items-center gap-1.5 self-center sm:gap-2" data-tour="app-tools">
        <button
          v-if="pageTourId"
          type="button"
          class="grid place-items-center"
          :title="pageTourLabel"
          @click="tour.replay(pageTourId)"
        >
          <ClayTile name="play" size="sm" />
        </button>
        <RouterLink
          to="/app/profile"
          class="hidden items-center gap-2 rounded-full border border-line bg-card py-1 pr-3 pl-1 text-[13px] text-ink hover:bg-white 2xl:inline-flex dark:hover:bg-white/10"
        >
          <ClayTile name="gear" size="xs" />
          Ajustes
        </RouterLink>
        <button
          type="button"
          class="grid place-items-center"
          :title="theme.mode === 'dark' ? 'Modo claro' : 'Modo oscuro'"
          @click="theme.toggle()"
        >
          <ClayTile :name="theme.mode === 'dark' ? 'sun' : 'moon'" size="sm" />
        </button>
        <NotificationBell />
        <div ref="accountMenu" class="relative">
          <button
            type="button"
            class="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-yellow"
            :aria-expanded="accountOpen"
            aria-haspopup="menu"
            :title="user?.name"
            aria-label="Menú de cuenta"
            @click.stop="accountOpen = !accountOpen"
          >
            <UserAvatar :name="user?.name" />
          </button>
          <div
            v-if="accountOpen"
            class="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-card border border-line bg-card py-1 shadow-lg"
            role="menu"
          >
            <p v-if="user?.name" class="truncate px-4 py-2 text-xs text-muted">{{ user.name }}</p>
            <RouterLink
              to="/app/profile"
              class="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-shell"
              role="menuitem"
              @click="accountOpen = false"
            >
              <AppIcon name="gear" :size="15" />
              Configuración
            </RouterLink>
            <button
              type="button"
              class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink hover:bg-shell"
              role="menuitem"
              @click="logout"
            >
              <AppIcon name="close" :size="15" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>

    <nav
      v-if="menuOpen"
      class="mt-3 grid gap-1 rounded-card border border-line bg-card p-2 text-sm lg:hidden"
    >
      <RouterLink
        v-for="link in links"
        :key="`m-${link.name}`"
        :to="link.to"
        :target="link.external ? '_blank' : undefined"
        :rel="link.external ? 'noreferrer' : undefined"
        class="flex items-center gap-2.5 rounded-btn px-3 py-2.5"
        :class="isActive(link.name) ? 'bg-charcoal text-on-charcoal dark:bg-yellow dark:text-on-yellow' : 'text-ink'"
      >
        <ClayTile :name="link.icon" size="xs" />
        {{ link.label }}
      </RouterLink>
    </nav>
  </header>
</template>
