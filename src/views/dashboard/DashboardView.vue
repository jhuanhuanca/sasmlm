<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { fetchDashboard, fetchTeam } from '@/api/dashboard'
import ClosingSeriesCharts from '@/components/closing/ClosingSeriesCharts.vue'
import PeriodGoalsSnapshot from '@/components/closing/PeriodGoalsSnapshot.vue'
import PlaneBSnapshot from '@/components/closing/PlaneBSnapshot.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/AppIcon.vue'
import ClayTile from '@/components/ui/ClayTile.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import ProgressPill from '@/components/ui/ProgressPill.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import CompanyScopeBar from '@/components/company/CompanyScopeBar.vue'
import { COMPANY_TOOL_CARDS } from '@/data/companyTools'
import { useAuthStore } from '@/stores/auth'
import { useCompanyToolsStore } from '@/stores/companyTools'
import { useDinoTourStore } from '@/stores/dinoTour'
import PartnerHomeView from '@/views/dashboard/PartnerHomeView.vue'
import type { DashboardSummary, ReferralRow } from '@/types/mlm'
import { compactNumber, countryLabel, firstName, initials, money, roleLabel } from '@/utils/format'

const auth = useAuthStore()
const tour = useDinoTourStore()
const companyTools = useCompanyToolsStore()
const { user, isLeader, isAdmin, isPartnerOnly, primaryRole } = storeToRefs(auth)

const loading = ref(true)
const metrics = ref<DashboardSummary | null>(null)
const team = ref<ReferralRow[]>([])
const openPanel = ref<'network' | 'store' | 'landing' | 'tools' | 'plan'>('store')

const canLead = computed(() => isLeader.value || isAdmin.value)
const dashTools = computed(() => COMPANY_TOOL_CARDS.filter((tool) => companyTools.allows(tool.key)))
const storeUrl = computed(() => (user.value?.store?.slug ? `/s/${user.value.store.slug}` : ''))
const landingUrl = computed(() => (user.value?.landing_page?.slug ? `/l/${user.value.landing_page.slug}` : ''))
const companyLogo = computed(() => user.value?.company?.logo || '')
const companyName = computed(() => user.value?.company?.name || user.value?.catalog_company_name || '')
const rankName = computed(() => user.value?.company?.rank_name || user.value?.catalog_rank_name || '')
const countryName = computed(() => countryLabel(user.value?.company?.country || user.value?.country))
const hasProfileMeta = computed(
  () => Boolean(companyName.value || rankName.value || (user.value?.country && user.value.country !== '')),
)

const now = new Date()

const cycleProgress = computed(() => {
  const closing = metrics.value?.closing
  const days = closing?.days_in_month ?? 30
  const day = closing?.day_of_month ?? 0
  return Math.min(100, Math.round((day / days) * 100))
})

const rankPercent = computed(() => {
  const rank = metrics.value?.closing?.rank_progress
  if (!rank?.official || rank.progress === null || rank.progress === undefined) {
    return null
  }
  return rank.progress
})

const ringPercent = computed(() => rankPercent.value ?? cycleProgress.value)
const ringLabel = computed(() =>
  rankPercent.value !== null ? 'Progreso de rango' : 'Ciclo del mes',
)

const monthSales = computed(() => metrics.value?.closing?.sales ?? metrics.value?.paid_store_sales ?? 0)

const ring = computed(() => {
  const radius = 72
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - ringPercent.value / 100)
  return { radius, circumference, offset }
})

const weekDays = computed(() => {
  const start = new Date(now)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const count = team.value.filter((row) => {
      const created = new Date(row.created_at)
      return created.toDateString() === date.toDateString()
    }).length

    return {
      key: date.toISOString(),
      label: ['L', 'M', 'X', 'J', 'V', 'S'][index],
      date,
      count,
      isToday: date.toDateString() === now.toDateString(),
    }
  })
})

const maxWeek = computed(() => Math.max(1, ...weekDays.value.map((day) => day.count)))

const pills = computed(() => {
  const items: Array<{ label: string; percent: number; tone: 'charcoal' | 'yellow' | 'striped' | 'outline' }> = [
    { label: 'Ciclo', percent: cycleProgress.value, tone: 'striped' },
  ]

  if (rankPercent.value !== null) {
    items.unshift({ label: 'Rango', percent: rankPercent.value, tone: 'charcoal' })
  }

  const qualification = metrics.value?.closing?.qualification
  if (qualification?.official && qualification.status === 'qualified') {
    items.push({ label: 'Calificado', percent: 100, tone: 'yellow' })
  }

  return items
})

const tasks = computed(() => {
  const store = user.value?.store
  const landing = user.value?.landing_page
  const items: Array<{
    id: string
    title: string
    hint: string
    done: boolean
    to: string
    icon: IconName
  }> = [
    {
      id: 'landing',
      title: 'Publicar landing',
      hint: 'Para captar socios y clientes',
      done: Boolean(landing?.is_published),
      to: '/app/landing',
      icon: 'zap',
    },
    {
      id: 'store',
      title: 'Revisar tienda',
      hint: store?.slug ? `/s/${store.slug}` : 'Aún sin slug',
      done: Boolean(store?.is_active),
      to: '/app/store',
      icon: 'file',
    },
    {
      id: 'product',
      title: 'Cargar catálogo',
      hint: 'Al menos un producto activo',
      done: false,
      to: '/app/store',
      icon: 'keyboard',
    },
  ]

  if (canLead.value) {
    items.unshift({
      id: 'invite',
      title: 'Invitar un socio',
      hint: 'El token se muestra una sola vez',
      done: (metrics.value?.direct_referrals ?? 0) > 0,
      to: '/app/invitations',
      icon: 'monitor',
    })
  }

  return items
})

const doneCount = computed(() => tasks.value.filter((task) => task.done).length)
const onboardingPercent = computed(() =>
  tasks.value.length ? Math.round((doneCount.value / tasks.value.length) * 100) : 0,
)

const weekLabel = computed(() =>
  new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(now),
)

watch(
  () => tour.current?.panel,
  (panel) => {
    if (panel) {
      openPanel.value = panel
    }
  },
)

watch(loading, async (busy) => {
  if (busy) {
    return
  }

  await nextTick()
  window.setTimeout(() => {
    tour.maybeStart(isPartnerOnly.value ? 'partner-dashboard' : 'leader-dashboard')
  }, 420)
})

onMounted(async () => {
  if (isPartnerOnly.value) {
    loading.value = false
    return
  }
  await Promise.all([loadPulse(), companyTools.load()])
})

async function onScopeChanged(): Promise<void> {
  await Promise.all([loadPulse(), companyTools.load(true)])
}

async function loadPulse(): Promise<void> {
  loading.value = true
  try {
    const requests: Promise<unknown>[] = [fetchDashboard().then((data) => {
      metrics.value = data
    })]

    if (canLead.value) {
      requests.push(
        fetchTeam()
          .then((rows) => {
            team.value = rows
          })
          .catch(() => {
            team.value = []
          }),
      )
    }

    await Promise.all(requests)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PartnerHomeView v-if="isPartnerOnly" />
  <div v-else>
    <div data-tour="dash-welcome">
    <ModuleBanner
      icon="home"
      eyebrow="Líder"
      :title="`Bienvenido, ${firstName(user?.name)}`"
      body="Aquí ves el pulso de tu red: ventas de tu tienda, comisión cuando un socio se hace líder y, si administración cargó la empresa, el volumen oficial. Los dos dineros no se mezclan."
      :actions="[
        'Mira ventas y comisión del mes (no son PV).',
        'Entra al cierre para metas, Excel de tu red y el CSV.',
        'Invita socios y da seguimiento desde Equipo.',
        'Usa Herramientas para asesorar con protocolos y material.',
      ]"
    />
    </div>

    <CompanyScopeBar v-if="canLead" class="mt-4" label="Cierre y equipo de" @changed="onScopeChanged" />

    <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" data-tour="dash-pulse">
      <div>
        <div v-if="hasProfileMeta" class="flex flex-wrap items-center gap-2">
          <span
            v-if="companyName"
            class="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm"
          >
            <img v-if="companyLogo" :src="companyLogo" alt="" class="h-5 w-5 rounded object-contain" />
            {{ companyName }}
          </span>
          <span
            v-if="rankName"
            class="inline-flex items-center rounded-full border border-line bg-white px-3 py-1.5 text-sm"
          >
            {{ rankName }}
          </span>
          <span
            v-if="user?.country"
            class="inline-flex items-center rounded-full border border-line bg-white px-3 py-1.5 text-sm"
          >
            {{ countryName }}
          </span>
        </div>
        <div class="mt-6 flex flex-wrap gap-2">
          <ProgressPill
            v-for="pill in pills"
            :key="pill.label"
            :label="pill.label"
            :percent="pill.percent"
            :tone="pill.tone"
          />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-8 lg:justify-end">
        <div class="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-start sm:gap-3">
          <span class="mt-1 hidden sm:inline-grid">
            <ClayTile name="users" tone="cream" size="sm" />
          </span>
          <div>
            <p class="text-[28px] leading-none font-semibold tracking-tight sm:text-[40px]">
              {{ compactNumber(metrics?.total_team ?? 0) }}
            </p>
            <p class="mt-2 text-xs text-muted sm:text-sm">Equipo</p>
          </div>
        </div>
        <div class="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-start sm:gap-3">
          <span class="mt-1 hidden sm:inline-grid">
            <ClayTile name="search" tone="orange" size="sm" />
          </span>
          <div>
            <p class="text-[28px] leading-none font-semibold tracking-tight sm:text-[40px]">
              {{ compactNumber(metrics?.direct_referrals ?? 0) }}
            </p>
            <p class="mt-2 text-xs text-muted sm:text-sm">Directos</p>
          </div>
        </div>
        <div class="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-start sm:gap-3">
          <span class="mt-1 hidden sm:inline-grid">
            <ClayTile name="bag" tone="coral" size="sm" />
          </span>
          <div>
            <p class="text-[22px] leading-none font-semibold tracking-tight sm:text-[32px]">
              {{ money(monthSales) }}
            </p>
            <p class="mt-2 text-xs text-muted sm:text-sm">Ventas del mes</p>
          </div>
        </div>
      </div>
    </div>

    <p v-if="loading" class="mt-10 text-sm text-muted">Cargando tu red…</p>

    <div v-else-if="metrics?.series?.length" class="mt-8" data-tour="dash-charts">
      <ClosingSeriesCharts :series="metrics.series" />
    </div>

    <div v-if="!loading" class="mt-8 grid gap-5 xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,300px)]">
      <div class="space-y-5">
        <div data-tour="dash-profile">
        <SoftCard :padded="false" class="overflow-hidden">
          <div class="relative h-48 bg-yellow-soft sm:h-64">
            <div class="absolute inset-0 flex items-center justify-center font-display text-8xl font-bold text-ink/15">
              {{ initials(user?.name) }}
            </div>
            <div
              class="absolute top-4 right-4 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold backdrop-blur"
            >
              {{ money(metrics?.pending_commissions ?? 0) }}
            </div>
            <div class="absolute inset-x-0 bottom-0 p-4">
              <p class="text-lg font-semibold">{{ user?.name }}</p>
              <p class="text-sm text-muted">{{ roleLabel(primaryRole) }}</p>
              <p v-if="hasProfileMeta" class="mt-1 text-sm text-muted">
                {{ [rankName, companyName, user?.country ? countryName : ''].filter(Boolean).join(' · ') }}
              </p>
            </div>
          </div>
        </SoftCard>
        </div>

        <div data-tour="dash-shortcuts">
        <SoftCard :padded="false">
          <div class="divide-y divide-line">
            <button class="flex w-full items-center justify-between px-5 py-4 text-left" @click="openPanel = 'network'">
              <span>Red actual</span>
              <span class="text-muted">{{ openPanel === 'network' ? '–' : '+' }}</span>
            </button>
            <div v-if="openPanel === 'network'" class="px-5 pb-4 text-sm text-muted">
              {{ user?.network?.name ?? 'Sin red asignada' }}
              <span class="mt-1 block capitalize">{{ user?.network?.status ?? 'pendiente' }}</span>
            </div>

            <button class="flex w-full items-center justify-between px-5 py-4 text-left" @click="openPanel = 'store'">
              <span>Tienda</span>
              <span class="text-muted">{{ openPanel === 'store' ? '–' : '+' }}</span>
            </button>
            <div v-if="openPanel === 'store'" class="px-5 pb-5">
              <p class="font-medium">{{ user?.store?.name ?? 'Sin tienda' }}</p>
              <p v-if="user?.store" class="mt-1 text-sm text-muted">/s/{{ user.store.slug }}</p>
              <a
                v-if="storeUrl"
                :href="storeUrl"
                target="_blank"
                rel="noreferrer"
                class="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow px-4 py-2 text-sm font-medium text-ink"
              >
                Abrir tienda
                <AppIcon name="link" :size="14" />
              </a>
            </div>

            <button class="flex w-full items-center justify-between px-5 py-4 text-left" @click="openPanel = 'landing'">
              <span>Landing</span>
              <span class="text-muted">{{ openPanel === 'landing' ? '–' : '+' }}</span>
            </button>
            <div v-if="openPanel === 'landing'" class="px-5 pb-5 text-sm text-muted">
              {{ user?.landing_page?.is_published ? 'Publicada' : 'Borrador' }}
              <span v-if="user?.landing_page" class="mt-1 block">/l/{{ user.landing_page.slug }}</span>
              <a
                v-if="landingUrl"
                :href="landingUrl"
                target="_blank"
                rel="noreferrer"
                class="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow px-4 py-2 text-sm font-medium text-ink"
              >
                Abrir landing
                <AppIcon name="link" :size="14" />
              </a>
            </div>

            <button class="flex w-full items-center justify-between px-5 py-4 text-left" @click="openPanel = 'tools'">
              <span>Herramientas</span>
              <span class="text-muted">{{ openPanel === 'tools' ? '–' : '+' }}</span>
            </button>
            <div v-if="openPanel === 'tools'" class="px-5 pb-5 space-y-3">
              <p v-if="companyTools.loaded && !dashTools.length" class="text-sm text-muted">
                Esta empresa no tiene herramientas activas.
              </p>
              <div v-if="companyTools.allows('wellness')">
                <p class="font-medium">Bienestar y salud</p>
                <p class="mt-1 text-sm text-muted">Protocolos por dolencia de tu empresa.</p>
                <RouterLink
                  to="/app/tools/wellness"
                  class="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow px-4 py-2 text-sm font-medium text-ink"
                >
                  Abrir bienestar
                  <AppIcon name="heart" :size="14" />
                </RouterLink>
              </div>
              <div v-if="companyTools.allows('imc')">
                <p class="font-medium">Calculadora IMC</p>
                <p class="mt-1 text-sm text-muted">Peso corporal y paquetes para bajar o subir.</p>
                <RouterLink
                  to="/app/tools/imc"
                  class="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow px-4 py-2 text-sm font-medium text-ink"
                >
                  Abrir calculadora
                  <AppIcon name="star" :size="14" />
                </RouterLink>
              </div>
              <div v-if="companyTools.allows('ring_sizer')">
                <p class="font-medium">Medidor de anillos</p>
                <p class="mt-1 text-sm text-muted">Talla de mujer u hombre y prueba en AR.</p>
                <RouterLink
                  to="/app/tools/anillos"
                  class="mt-3 inline-flex items-center gap-2 rounded-full bg-yellow px-4 py-2 text-sm font-medium text-ink"
                >
                  Abrir medidor
                  <AppIcon name="star" :size="14" />
                </RouterLink>
              </div>
              <div v-if="companyTools.allows('flyers') || companyTools.allows('pdfs') || companyTools.allows('videos') || companyTools.allows('audios')">
                <p class="font-medium">Material</p>
                <p class="mt-1 text-sm text-muted">Flyers, PDFs, videos y audios para ver o descargar.</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <RouterLink
                    v-if="companyTools.allows('flyers')"
                    to="/app/tools/flyers"
                    class="inline-flex items-center rounded-full bg-yellow px-4 py-2 text-sm font-medium text-ink"
                  >
                    Flyers
                  </RouterLink>
                  <RouterLink
                    v-if="companyTools.allows('pdfs')"
                    to="/app/tools/pdfs"
                    class="inline-flex items-center rounded-full bg-yellow px-4 py-2 text-sm font-medium text-ink"
                  >
                    PDFs
                  </RouterLink>
                  <RouterLink
                    v-if="companyTools.allows('videos')"
                    to="/app/tools/videos"
                    class="inline-flex items-center rounded-full bg-yellow px-4 py-2 text-sm font-medium text-ink"
                  >
                    Videos
                  </RouterLink>
                  <RouterLink
                    v-if="companyTools.allows('audios')"
                    to="/app/tools/audios"
                    class="inline-flex items-center rounded-full bg-yellow px-4 py-2 text-sm font-medium text-ink"
                  >
                    Audios
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </SoftCard>
        </div>
      </div>

      <div class="grid gap-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]" data-tour="dash-closing">
        <PlaneBSnapshot v-if="metrics?.closing" class="md:col-span-2" :closing="metrics.closing" compact />
        <PeriodGoalsSnapshot
          v-if="metrics?.closing?.goals?.items"
          class="md:col-span-2"
          :items="metrics.closing.goals.items"
        />

        <SoftCard>
          <p class="text-sm text-muted">Progreso</p>
          <p class="mt-1 text-2xl leading-tight font-semibold">
            {{ metrics?.direct_referrals ?? 0 }}
            <span class="text-base font-normal text-muted">altas directas</span>
          </p>
          <div class="mt-6 flex h-36 items-end justify-between gap-2">
            <div v-for="day in weekDays" :key="day.key" class="flex flex-1 flex-col items-center gap-2">
              <div
                v-if="day.isToday && day.count > 0"
                class="rounded-full bg-charcoal px-2 py-1 text-[10px] text-white"
              >
                {{ day.count }}
              </div>
              <div
                class="w-full max-w-8 rounded-full"
                :class="day.isToday ? 'bg-yellow' : 'bg-line'"
                :style="{ height: `${Math.max(18, (day.count / maxWeek) * 110)}px` }"
              />
              <span class="text-xs text-muted">{{ day.label }}</span>
            </div>
          </div>
        </SoftCard>

        <SoftCard class="flex flex-col items-center">
          <p class="text-sm text-muted">{{ ringLabel }}</p>
          <div class="relative mt-3 grid h-[180px] w-[180px] place-items-center">
            <svg class="h-[180px] w-[180px]" viewBox="0 0 180 180" aria-hidden="true">
              <circle cx="90" cy="90" r="72" fill="none" stroke="var(--rex-line)" stroke-width="10" />
              <circle
                cx="90"
                cy="90"
                r="72"
                fill="none"
                stroke="#FFD452"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="ring.circumference"
                :stroke-dashoffset="ring.offset"
                transform="rotate(-90 90 90)"
              />
            </svg>
            <div class="absolute inset-0 grid place-content-center text-center">
              <p class="font-display text-3xl leading-none font-bold">{{ ringPercent }}%</p>
              <p v-if="metrics?.closing?.timezone_label" class="mt-1 px-4 text-[10px] text-muted">
                {{ metrics.closing.timezone_label }}
              </p>
            </div>
          </div>
          <RouterLink
            v-if="canLead"
            to="/app/cierre"
            class="mt-4 text-sm font-medium hover:underline"
          >
            Abrir cierre de mes →
          </RouterLink>
        </SoftCard>

        <SoftCard class="md:col-span-2">
          <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
            <p class="capitalize leading-tight">{{ weekLabel }}</p>
            <p class="text-sm text-muted">Altas de equipo</p>
          </div>
          <div class="grid grid-cols-6 gap-2 text-center text-xs text-muted">
            <div v-for="day in weekDays" :key="`cal-${day.key}`">
              {{ day.date.getDate() }}
            </div>
          </div>
          <div class="mt-4 min-h-24 rounded-card-sm bg-shell p-4">
            <div
              v-if="team.length"
              class="rounded-btn bg-charcoal px-4 py-3 text-sm text-on-charcoal"
            >
              {{ team[0]?.referred?.name ?? 'Nuevo socio' }} se unió a tu red
            </div>
            <p v-else class="px-2 py-6 text-sm text-muted">Todavía no hay altas esta semana.</p>
          </div>
        </SoftCard>
      </div>

      <div class="space-y-5" data-tour="dash-tasks">
        <div class="flex items-center justify-between gap-4 px-1">
          <p class="font-display text-3xl font-bold">{{ onboardingPercent }}%</p>
          <div class="flex h-3 flex-1 overflow-hidden rounded-full bg-line">
            <span class="h-full bg-yellow" :style="{ width: `${Math.max(onboardingPercent, 8)}%` }" />
            <span class="h-full bg-charcoal" :style="{ width: '18%' }" />
          </div>
        </div>

        <section class="task-panel relative overflow-hidden rounded-card p-4 text-white sm:p-6">
          <span class="absolute inset-x-8 top-0 h-1 rounded-b-full bg-yellow" />
          <div class="mb-6 flex items-end justify-between">
            <h2 class="text-xl font-semibold">Tareas de red</h2>
            <span class="text-sm text-white/45">{{ doneCount }}/{{ tasks.length }}</span>
          </div>
          <ul class="space-y-4">
            <li v-for="task in tasks" :key="task.id">
              <RouterLink :to="task.to" class="flex items-center gap-3">
                <span class="shrink-0">
                  <ClayTile :name="task.icon" size="sm" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-medium">{{ task.title }}</span>
                  <span class="block truncate text-xs text-white/40">{{ task.hint }}</span>
                </span>
                <span
                  class="grid h-6 w-6 shrink-0 place-items-center rounded-full"
                  :class="task.done ? 'bg-yellow text-on-yellow' : 'border border-white/25 text-transparent'"
                >
                  <AppIcon name="check" :size="12" />
                </span>
              </RouterLink>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>
