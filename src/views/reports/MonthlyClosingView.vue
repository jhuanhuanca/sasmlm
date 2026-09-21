<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { downloadMonthlyReport, fetchConnectionStatus, fetchMonthlyClosing, importNetworkFile, upsertPeriodGoals } from '@/api/reports'
import ClosingSeriesCharts from '@/components/closing/ClosingSeriesCharts.vue'
import PeriodGoalsEditor from '@/components/closing/PeriodGoalsEditor.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import SoftField from '@/components/ui/SoftField.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import TableHeading from '@/components/ui/TableHeading.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import CompanyScopeBar from '@/components/company/CompanyScopeBar.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import type { MonthlyClosing, PeriodGoalItem } from '@/types/mlm'
import { compactNumber, crmStageLabel, money, signedPercent } from '@/utils/format'
import { errorMessage } from '@/utils/http'
import {
  compassText,
  nextActions,
  performanceReading,
  readClosingNotes,
  writeClosingNotes,
  type ClosingNote,
} from '@/utils/monthlyClosing'
import { fieldControlClass } from '@/utils/ui'

const auth = useAuthStore()
const toast = useToast()
const { user } = storeToRefs(auth)

const period = ref(currentPeriod())
const closing = ref<MonthlyClosing | null>(null)
const notes = ref<ClosingNote>(readClosingNotes(user.value?.id, period.value))
const message = ref('')
const loading = ref(false)
const connector = ref<{
  organization: { id: number; name: string; slug: string } | null
  official: Array<{
    driver: string
    name: string
    status: string
    last_synced_at?: string | null
    sources?: Array<{ kind: string; label: string; last_count: number }>
  }>
  network_imports: Array<{
    name: string
    status: string
    last_synced_at?: string | null
    latest_sync?: { message?: string | null } | null
  }>
} | null>(null)
const importing = ref(false)
const importFile = ref<File | null>(null)
const savingGoals = ref(false)
const goalDrafts = ref<PeriodGoalItem[]>([])
const nextGoalDrafts = ref<PeriodGoalItem[]>([])

const maxPeriod = currentPeriod()

function currentPeriod(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function shiftPeriod(delta: number): void {
  const [year, month] = period.value.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  if (next > maxPeriod) {
    return
  }
  period.value = next
  void load()
}

async function load(): Promise<void> {
  loading.value = true
  message.value = ''

  try {
    closing.value = await fetchMonthlyClosing(period.value || undefined)
    period.value = closing.value.month
    notes.value = readClosingNotes(user.value?.id, period.value)
    syncGoalDrafts(closing.value)
  } catch (error) {
    closing.value = null
    message.value = errorMessage(error, 'No se pudo cargar el cierre de mes')
  } finally {
    loading.value = false
  }
}

async function loadConnections(): Promise<void> {
  try {
    connector.value = await fetchConnectionStatus()
  } catch {
    connector.value = null
  }
}

async function importOwnFile(): Promise<void> {
  if (!importFile.value) {
    return
  }
  importing.value = true
  message.value = ''
  try {
    await importNetworkFile(importFile.value)
    importFile.value = null
    await Promise.all([loadConnections(), load()])
    toast.success('El volumen de tu red ya está en el cierre.', 'Archivo importado')
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo importar el archivo de tu red')
    toast.fromError(error, 'No se pudo importar el archivo de tu red')
  } finally {
    importing.value = false
  }
}

watch(
  notes,
  (value) => {
    writeClosingNotes(user.value?.id, period.value, value)
  },
  { deep: true },
)

onMounted(() => {
  void load()
  void loadConnections()
})

const volume = computed(() => closing.value?.company_volume ?? null)
const heading = computed(() => closing.value?.label || period.value)

function volumeSourceLabel(source: string | null | undefined): string {
  if (source === 'organization') {
    return 'dato oficial de la empresa'
  }
  if (source === 'network') {
    return 'Excel de tu red'
  }
  if (source === 'mixed') {
    return 'oficial + tu red (gana el oficial)'
  }
  return 'conector'
}
const compass = computed(() => (closing.value ? compassText(closing.value) : ''))
const performance = computed(() => (closing.value ? performanceReading(closing.value) : ''))
const actions = computed(() => (closing.value ? nextActions(closing.value) : []))
const progress = computed(() => {
  const days = closing.value?.days_in_month ?? 30
  const day = closing.value?.day_of_month ?? 0
  return Math.min(100, Math.round((day / days) * 100))
})

function changeTone(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'text-muted'
  }
  if (value < 0) {
    return 'text-red-600'
  }
  return 'text-ink'
}

async function download(): Promise<void> {
  await downloadMonthlyReport(period.value || undefined)
}

function syncGoalDrafts(report: MonthlyClosing): void {
  goalDrafts.value = (report.goals?.items ?? []).map((item) => ({ ...item }))
  nextGoalDrafts.value = (report.goals?.next_items ?? []).map((item) => ({ ...item }))
}

function goalPayload(items: PeriodGoalItem[]): Array<{ metric: string; target: number | null }> {
  return items.map((item) => ({ metric: item.metric, target: item.target }))
}

async function saveGoals(): Promise<void> {
  if (!closing.value) {
    return
  }
  savingGoals.value = true
  message.value = ''
  try {
    const bundle = await upsertPeriodGoals({
      period: closing.value.month,
      goals: goalPayload(goalDrafts.value),
      next_goals: goalPayload(nextGoalDrafts.value),
    })
    closing.value = { ...closing.value, goals: bundle }
    syncGoalDrafts(closing.value)
    toast.success('Las metas de este periodo y del siguiente quedaron guardadas.', 'Metas guardadas')
  } catch (error) {
    message.value = errorMessage(error, 'No se pudieron guardar las metas')
    toast.fromError(error, 'No se pudieron guardar las metas')
  } finally {
    savingGoals.value = false
  }
}
</script>

<template>
  <div>
    <div data-tour="close-welcome">
    <ModuleBanner
      icon="calendar"
      eyebrow="Líder"
      title="Cierre de mes"
      body="Cierre de tu red, no el de la empresa ni el de otros líderes. Ventas de tienda y comisión SaaS van aparte del volumen de empresa. Si no hay PV, no se muestra un 0 fingido."
      :actions="[
        'Elige el periodo (zona de tu país; si no hay, La Paz).',
        'Define metas de tienda y de volumen por separado.',
        'Si tu red no está en el conector oficial, sube tu Excel.',
        'Descarga el CSV para llevar el mes a tu contable.',
      ]"
    />
    </div>
    <CompanyScopeBar class="mt-4" label="Cierre de" @changed="load" />
    <form class="mt-6 flex flex-wrap items-end gap-2" data-tour="close-period" @submit.prevent="load">
        <SoftField label="Periodo">
          <input
            v-model="period"
            :class="fieldControlClass"
            class="w-[11.5rem]"
            type="month"
            :max="maxPeriod"
          />
        </SoftField>
        <SoftButton variant="outline" type="button" :disabled="loading" @click="shiftPeriod(-1)">Anterior</SoftButton>
        <SoftButton type="submit" :disabled="loading">{{ loading ? 'Cargando…' : 'Ver' }}</SoftButton>
        <SoftButton variant="yellow" type="button" :disabled="!closing" @click="download">CSV</SoftButton>
    </form>

    <p v-if="message" class="mt-4 text-sm text-red-600">{{ message }}</p>

    <SoftCard v-if="connector" class="mt-8" data-tour="close-company">
      <p class="text-xs tracking-[0.16em] uppercase text-muted">Datos de empresa</p>
      <p class="mt-2 text-sm text-ink">
        {{ connector.organization?.name ?? 'Sin organización' }}
        · el dato oficial lo carga administración.
        Tú solo importas un Excel si tu red aún no está en ese conector.
      </p>
      <ul class="mt-4 space-y-1 text-sm">
        <li v-for="item in connector.official" :key="item.driver + item.name">
          <span class="font-medium">{{ item.name }}</span>
          <span class="text-muted"> · {{ item.status === 'connected' ? 'conectada' : item.status }}</span>
        </li>
        <li v-if="!connector.official.length" class="text-muted">Aún no hay conector oficial de la empresa.</li>
      </ul>
      <div class="mt-4 flex flex-wrap items-end gap-2">
        <SoftField label="Excel o CSV de tu red">
          <input
            :class="fieldControlClass"
            type="file"
            accept=".csv,.tsv,.txt,.xlsx"
            @change="importFile = ($event.target as HTMLInputElement).files?.[0] ?? null"
          />
        </SoftField>
        <SoftButton type="button" :disabled="importing || !importFile" @click="importOwnFile">
          {{ importing ? 'Importando…' : 'Importar mi red' }}
        </SoftButton>
      </div>
      <p v-if="connector.network_imports[0]?.latest_sync?.message" class="mt-2 text-xs text-muted">
        {{ connector.network_imports[0].latest_sync?.message }}
      </p>
    </SoftCard>

    <SoftCard v-if="closing" class="mt-8" data-tour="close-volume">
      <template v-if="volume?.available">
        <p class="mt-2 text-sm text-ink">
          {{ closing.organization?.name ?? 'Empresa' }} · {{ volumeSourceLabel(volume.source) }}
          <span v-if="volume.unit"> · unidad {{ volume.unit }}</span>
        </p>
        <div class="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p class="text-sm text-muted">Volumen personal</p>
            <p class="mt-1 font-display text-2xl font-bold">
              {{ volume.personal === null ? '—' : compactNumber(volume.personal) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-muted">Volumen de grupo</p>
            <p class="mt-1 font-display text-2xl font-bold">
              {{ volume.group === null ? '—' : compactNumber(volume.group) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-muted">Red importada</p>
            <p class="mt-1 font-display text-2xl font-bold">{{ compactNumber(volume.members) }}</p>
            <p class="mt-1 text-xs text-muted">{{ compactNumber(volume.orders) }} pedidos de empresa</p>
          </div>
        </div>
        <p v-if="volume.rank?.name || volume.rank?.code" class="mt-3 text-sm text-muted">
          Rango importado: {{ volume.rank?.name || volume.rank?.code }} (foto del conector, no calificación de REXmlm).
        </p>
        <p v-if="volume.bonuses !== null" class="mt-2 text-sm text-muted">
          Bonos de empresa importados: {{ money(volume.bonuses) }} — no son comisión SaaS.
        </p>
        <p v-if="volume.personal_origin === 'derived_items'" class="mt-2 text-xs text-muted">
          Volumen personal derivado de ítems × catálogo (la empresa lo permite).
        </p>
        <p v-if="volume.group_origin === 'derived_downline'" class="mt-2 text-xs text-muted">
          Volumen de grupo = suma de la downline (regla publicada o activada por admin), no un GV inventado.
        </p>
      </template>
      <p v-else class="mt-2 text-sm text-muted">
        Volumen de empresa no disponible. No se muestra 0. Cuando administración conecte
        {{ closing.organization?.name || 'la empresa' }} (o subas el Excel de tu red), aquí aparecerán PV/GV o puntos.
      </p>
    </SoftCard>

    <SoftCard v-if="closing" class="mt-8">
      <p class="text-xs tracking-[0.16em] uppercase text-muted">Calificación y rango · plano B</p>
      <p class="mt-2 text-sm text-ink">{{ closing.qualification?.message }}</p>
      <ul v-if="closing.qualification?.checks?.length" class="mt-3 space-y-1 text-sm">
        <li v-for="check in closing.qualification.checks" :key="check.key">
          {{ check.label }}:
          <span v-if="check.unknown" class="text-muted">sin dato</span>
          <span v-else>{{ compactNumber(check.actual ?? 0) }} / {{ compactNumber(check.required) }}</span>
          <span class="text-muted"> · {{ check.unknown ? 'no se evalúa' : check.met ? 'cumple' : 'no cumple' }}</span>
        </li>
      </ul>
      <template v-if="closing.rank_progress?.official && closing.rank_progress.progress !== null && closing.rank_progress.progress !== undefined">
        <p class="mt-4 text-sm">
          {{ closing.rank_progress.current?.name || 'Sin rango aún' }}
          <span v-if="closing.rank_progress.next"> → {{ closing.rank_progress.next.name }}</span>
        </p>
        <div class="mt-2 h-2 overflow-hidden rounded-full bg-shell">
          <div class="h-full bg-charcoal" :style="{ width: `${Math.min(100, closing.rank_progress.progress)}%` }" />
        </div>
        <p class="mt-1 text-xs text-muted">{{ closing.rank_progress.progress }}% · {{ closing.rank_progress.message }}</p>
      </template>
      <p v-else class="mt-3 text-sm text-muted">{{ closing.rank_progress?.message }}</p>
    </SoftCard>

    <div v-if="closing?.series?.length" class="mt-8">
      <ClosingSeriesCharts :series="closing.series" />
    </div>

    <SoftCard v-if="closing?.store_proxy" class="mt-8">
      <p class="text-xs tracking-[0.16em] uppercase text-muted">Proxy de tienda · plano A</p>
      <p class="mt-2 text-sm text-ink">{{ closing.store_proxy.label }}</p>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p class="text-sm text-muted">Ventas directas</p>
          <p class="mt-1 font-display text-2xl font-bold">{{ money(closing.store_proxy.personal) }}</p>
        </div>
        <div>
          <p class="text-sm text-muted">Ventas del equipo</p>
          <p class="mt-1 font-display text-2xl font-bold">{{ money(closing.store_proxy.team) }}</p>
        </div>
      </div>
    </SoftCard>

    <div v-if="closing" class="mt-8">
      <PeriodGoalsEditor
        title="Metas de este periodo"
        hint="Cada meta tiene su unidad. Ventas de tienda no se comparan con PV. Vacío borra la meta; volumen sin conector queda como no disponible, no como 0."
        :items="goalDrafts"
        editable
        :saving="savingGoals"
        show-progress
        @update:items="goalDrafts = $event"
        @save="saveGoals"
      />
    </div>

    <template v-if="closing">
      <SoftCard class="mt-8" dark>
        <p class="text-xs tracking-[0.16em] uppercase opacity-70">
          {{ heading }}
          <span v-if="closing.is_current_month"> · ciclo en curso {{ progress }}%</span>
          <span v-else> · ciclo cerrado</span>
        </p>
        <p class="mt-2 text-xs opacity-70">
          {{ closing.timezone_label || closing.timezone }}
          · tu red
          <span v-if="closing.organization?.name"> · {{ closing.organization.name }}</span>
        </p>
        <p class="mt-3 max-w-3xl text-lg leading-snug">{{ compass }}</p>
        <div class="mt-6 grid gap-4 sm:grid-cols-4">
          <div>
            <p class="text-xs opacity-70">Ventas pagadas</p>
            <p class="mt-1 font-display text-2xl font-bold">{{ money(closing.sales) }}</p>
            <p class="mt-1 text-xs" :class="changeTone(closing.change?.sales)">
              vs mes previo {{ signedPercent(closing.change?.sales) }}
            </p>
          </div>
          <div>
            <p class="text-xs opacity-70">Comisiones</p>
            <p class="mt-1 font-display text-2xl font-bold">{{ money(closing.commissions) }}</p>
            <p class="mt-1 text-xs" :class="changeTone(closing.change?.commissions)">
              vs mes previo {{ signedPercent(closing.change?.commissions) }}
            </p>
          </div>
          <div>
            <p class="text-xs opacity-70">Altas al equipo</p>
            <p class="mt-1 font-display text-2xl font-bold">{{ compactNumber(closing.new_team_members) }}</p>
            <p class="mt-1 text-xs" :class="changeTone(closing.change?.new_team_members)">
              vs mes previo {{ signedPercent(closing.change?.new_team_members) }}
            </p>
          </div>
          <div>
            <p class="text-xs opacity-70">Nuevos líderes</p>
            <p class="mt-1 font-display text-2xl font-bold">{{ compactNumber(closing.new_leaders ?? 0) }}</p>
            <p class="mt-1 text-xs" :class="changeTone(closing.change?.new_leaders)">
              vs mes previo {{ signedPercent(closing.change?.new_leaders) }}
            </p>
          </div>
        </div>
      </SoftCard>

      <section class="mt-10">
        <p class="text-xs tracking-[0.16em] text-muted uppercase">01 · Rendimiento</p>
        <h2 class="mt-1 text-xl font-semibold">¿Cumpliste lo que te propusiste?</h2>
        <p class="mt-2 max-w-3xl text-sm text-muted">{{ performance }}</p>

        <div class="mt-5 grid gap-4 md:grid-cols-3">
          <SoftCard>
            <p class="text-sm text-muted">Pedidos pagados</p>
            <p class="mt-2 font-display text-3xl font-bold">{{ compactNumber(closing.orders_count ?? 0) }}</p>
            <p class="mt-2 text-sm text-muted">
              Directas {{ money(closing.sales_direct ?? 0) }} · Equipo {{ money(closing.sales_attributed ?? 0) }}
            </p>
          </SoftCard>
          <SoftCard>
            <p class="text-sm text-muted">Prospección</p>
            <p class="mt-2 font-display text-3xl font-bold">
              {{ compactNumber(closing.invitations?.accepted ?? 0) }}
              <span class="text-lg font-medium text-muted">/ {{ compactNumber(closing.invitations?.sent ?? 0) }}</span>
            </p>
            <p class="mt-2 text-sm text-muted">Aceptadas / enviadas. Pendientes de aceptar: {{ compactNumber(closing.invitations?.pending ?? 0) }}</p>
          </SoftCard>
          <SoftCard>
            <p class="text-sm text-muted">Equipo que pide atención</p>
            <p class="mt-2 font-display text-3xl font-bold">{{ compactNumber(closing.team?.needs_support ?? 0) }}</p>
            <p class="mt-2 text-sm text-muted">
              {{ compactNumber(closing.team?.follow_ups_overdue ?? 0) }} seguimientos vencidos ·
              {{ compactNumber(closing.team?.partners_without_sales ?? 0) }} socios sin ventas
            </p>
          </SoftCard>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <SoftCard v-for="(count, stage) in closing.team?.by_stage ?? {}" :key="stage" class="!p-4">
            <p class="text-xs text-muted">{{ crmStageLabel(String(stage)) }}</p>
            <p class="mt-1 text-xl font-semibold">{{ compactNumber(count) }}</p>
          </SoftCard>
        </div>
      </section>

      <section class="mt-12">
        <p class="text-xs tracking-[0.16em] text-muted uppercase">02 · Comisiones e ingresos</p>
        <h2 class="mt-1 text-xl font-semibold">Lo que sí entra a tu bolsillo de plataforma</h2>
        <p class="mt-2 max-w-3xl text-sm text-muted">
          Las comisiones de REXmlm nacen cuando un socio se vuelve líder, no por cada pedido de la tienda. Verifica
          volumen de tienda aparte: es tu negocio de producto.
        </p>

        <div class="mt-5 grid gap-4 md:grid-cols-4">
          <SoftCard>
            <p class="text-sm text-muted">Pendiente</p>
            <p class="mt-2 font-display text-2xl font-bold">{{ money(closing.commissions_breakdown?.pending ?? 0) }}</p>
          </SoftCard>
          <SoftCard>
            <p class="text-sm text-muted">Aprobada</p>
            <p class="mt-2 font-display text-2xl font-bold">{{ money(closing.commissions_breakdown?.approved ?? 0) }}</p>
          </SoftCard>
          <SoftCard>
            <p class="text-sm text-muted">Pagada</p>
            <p class="mt-2 font-display text-2xl font-bold">{{ money(closing.commissions_breakdown?.paid ?? 0) }}</p>
          </SoftCard>
          <SoftCard>
            <p class="text-sm text-muted">Revertida</p>
            <p class="mt-2 font-display text-2xl font-bold">{{ money(closing.commissions_breakdown?.reversed ?? 0) }}</p>
          </SoftCard>
        </div>
        <p class="mt-3 text-sm">
          <RouterLink to="/app/commissions" class="font-medium underline-offset-2 hover:underline">Ver detalle de comisiones →</RouterLink>
        </p>
      </section>

      <section class="mt-12">
        <p class="text-xs tracking-[0.16em] text-muted uppercase">03 · Control personal</p>
        <h2 class="mt-1 text-xl font-semibold">Finanzas tuyas, no de REXmlm</h2>
        <p class="mt-2 max-w-3xl text-sm text-muted">
          Eres independiente: este cierre no sustituye a un contable. Sirve para no mezclar la casa con el negocio y
          anotar gastos del mes (producto, transporte, eventos) que luego llevas a tu declaración.
        </p>
        <SoftCard class="mt-5">
          <label class="flex items-start gap-3 text-sm">
            <input v-model="notes.expenses_logged" class="mt-1" type="checkbox" />
            <span>Ya registré los gastos del mes (fuera de la plataforma).</span>
          </label>
          <label class="mt-4 flex items-start gap-3 text-sm">
            <input v-model="notes.finances_separated" class="mt-1" type="checkbox" />
            <span>Separé lo personal de lo del negocio este ciclo.</span>
          </label>
          <p class="mt-4 text-xs text-muted">Se guarda en este navegador, por periodo. No viaja al servidor.</p>
        </SoftCard>
      </section>

      <section class="mt-12">
        <p class="text-xs tracking-[0.16em] text-muted uppercase">04 · Plan del mes siguiente</p>
        <h2 class="mt-1 text-xl font-semibold">Intención, seguimiento y claridad</h2>
        <p class="mt-2 max-w-3xl text-sm text-muted">
          Un buen cierre mira atrás y deja el plan del día 1. No concentres el esfuerzo en la última semana.
        </p>

        <ol class="mt-5 space-y-3">
          <li v-for="(item, index) in actions" :key="item" class="flex gap-3 rounded-input bg-shell px-4 py-3 text-sm">
            <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-charcoal text-xs text-on-charcoal">{{
              index + 1
            }}</span>
            <span>{{ item }}</span>
          </li>
        </ol>

        <div class="mt-5">
          <PeriodGoalsEditor
            :title="`Metas de ${closing.goals?.next_period || 'el mes siguiente'}`"
            hint="Se guardan en el servidor para el periodo siguiente. El enfoque en texto queda en este navegador."
            :items="nextGoalDrafts"
            editable
            :saving="savingGoals"
            :show-progress="false"
            @update:items="nextGoalDrafts = $event"
            @save="saveGoals"
          />
        </div>
        <SoftField class="mt-5" label="Enfoque del mes (nota personal)">
          <input v-model="notes.next_focus" :class="fieldControlClass" placeholder="Ej. independizar a 1 socio" />
        </SoftField>
      </section>

      <section class="mt-12 mb-4">
        <p class="text-xs tracking-[0.16em] text-muted uppercase">05 · Equipo y reinicio</p>
        <h2 class="mt-1 text-xl font-semibold">Quién necesita apoyo para arrancar el próximo ciclo</h2>
        <p class="mt-2 max-w-3xl text-sm text-muted">
          El ciclo de operación se cierra aquí: pausa, revisa cifras y arranca el siguiente periodo con el tablero en cero.
        </p>

        <SoftCard v-if="closing.team?.attention?.length" class="mt-5" :padded="false">
          <table class="w-full min-w-[480px] text-left text-sm">
            <thead class="text-muted">
              <tr class="border-b border-line">
                <th class="px-5 py-3 font-medium"><TableHeading icon="user" label="Persona" /></th>
                <th class="px-5 py-3 font-medium"><TableHeading icon="clipboard" label="Etapa" /></th>
                <th class="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in closing.team.attention" :key="row.id" class="border-t border-line">
                <td class="px-5 py-3">
                  <p class="inline-flex items-center gap-2">
                    <span class="grid h-8 w-8 place-items-center rounded-full bg-shell text-muted">
                      <AppIcon name="user" :size="14" />
                    </span>
                    {{ row.name ?? '—' }}
                  </p>
                  <p class="pl-10 text-muted">{{ row.email }}</p>
                </td>
                <td class="px-5 py-3">{{ crmStageLabel(row.crm_stage) }}</td>
                <td class="px-5 py-3 text-right">
                  <RouterLink :to="`/app/team/${row.id}`" class="font-medium hover:underline">Abrir ficha →</RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </SoftCard>
        <p v-else class="mt-4 text-sm text-muted">Nadie en seguimiento, nuevo o con necesidad de apoyo. Revisa igual a quien no vendió.</p>

        <SoftCard v-if="closing.top_partners?.length" class="mt-5" :padded="false">
          <div class="px-5 py-4">
            <h3 class="font-medium">Top socios por ventas pagadas</h3>
          </div>
          <table class="w-full min-w-[480px] text-left text-sm">
            <thead class="text-muted">
              <tr class="border-t border-line">
                <th class="px-5 py-3 font-medium"><TableHeading icon="user" label="Socio" /></th>
                <th class="px-5 py-3 font-medium"><TableHeading icon="bag" label="Pedidos" /></th>
                <th class="px-5 py-3 font-medium"><TableHeading icon="wallet" label="Ventas" /></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="partner in closing.top_partners" :key="partner.id" class="border-t border-line">
                <td class="px-5 py-3">
                  <p class="inline-flex items-center gap-2">
                    <span class="grid h-8 w-8 place-items-center rounded-full bg-shell text-muted">
                      <AppIcon name="star" :size="14" />
                    </span>
                    {{ partner.name ?? '—' }}
                  </p>
                  <p class="pl-10 text-muted">{{ partner.email }}</p>
                </td>
                <td class="px-5 py-3">{{ compactNumber(partner.orders_count) }}</td>
                <td class="px-5 py-3">{{ money(partner.sales) }}</td>
              </tr>
            </tbody>
          </table>
        </SoftCard>
      </section>
    </template>
  </div>
</template>
