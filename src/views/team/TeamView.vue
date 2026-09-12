<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { createInvitation } from '@/api/invitations'
import { convertCompanyPartner, fetchTeamRoster, registerCompanyPartner } from '@/api/dashboard'
import CompanyScopeBar from '@/components/company/CompanyScopeBar.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import SoftField from '@/components/ui/SoftField.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import TableHeading from '@/components/ui/TableHeading.vue'
import ClayTile from '@/components/ui/ClayTile.vue'
import ReportExportBar from '@/components/reports/ReportExportBar.vue'
import type { ClayTone } from '@/components/ui/ClayTile.vue'
import type { IconName } from '@/components/ui/AppIcon.vue'
import { useToast } from '@/composables/useToast'
import type { InvitationCreated, ReferralRow, TeamKind, TeamRosterSummary } from '@/types/mlm'
import { errorMessage, fieldErrors } from '@/utils/http'
import { compactNumber, crmStageLabel, formatDate, formatDateTime, money } from '@/utils/format'
import { fieldControlClass } from '@/utils/ui'

const rows = ref<ReferralRow[]>([])
const summary = ref<TeamRosterSummary>({
  partners: 0,
  independent_leaders: 0,
  company_partners: 0,
  downline_total: 0,
  sales_month: 0,
  follow_ups_due: 0,
})
const loading = ref(true)
const message = ref('')
const inviting = ref(false)
const convertingId = ref<number | null>(null)
const inviteOpen = ref(false)
const addKind = ref<'partner' | 'company'>('partner')
const errors = ref<Record<string, string[]>>({})
const created = ref<InvitationCreated | null>(null)
const filter = ref<'all' | 'partners' | 'leaders' | 'company' | 'follow_up'>('all')
const toast = useToast()
const email = ref('')
const companyForm = reactive({
  name: '',
  email: '',
  phone: '',
  code: '',
  rank_name: '',
})

const inviteLink = computed(() => {
  if (!created.value) {
    return ''
  }

  return `${window.location.origin}/register?token=${created.value.token}`
})

const now = Date.now()

const visibleRows = computed(() => {
  if (filter.value === 'partners') {
    return rows.value.filter((row) => row.kind === 'partner')
  }
  if (filter.value === 'leaders') {
    return rows.value.filter((row) => row.kind === 'leader')
  }
  if (filter.value === 'company') {
    return rows.value.filter((row) => row.kind === 'company')
  }
  if (filter.value === 'follow_up') {
    return rows.value.filter((row) => row.follow_up_at && new Date(row.follow_up_at).getTime() <= now)
  }

  return rows.value
})

function kindOf(row: ReferralRow): TeamKind {
  if (row.kind === 'company' || row.kind === 'leader' || row.kind === 'partner') {
    return row.kind
  }

  return row.is_leader ? 'leader' : 'partner'
}

function kindLabel(kind: TeamKind): string {
  if (kind === 'leader') {
    return 'Líder'
  }
  if (kind === 'company') {
    return 'Socio de empresa'
  }

  return 'Socio'
}

function kindTile(kind: TeamKind): { name: IconName; tone: ClayTone } {
  if (kind === 'leader') {
    return { name: 'star', tone: 'ink' }
  }
  if (kind === 'company') {
    return { name: 'users', tone: 'royal' }
  }

  return { name: 'user', tone: 'yellow' }
}

function displayName(row: ReferralRow): string {
  return row.name || row.referred?.name || '—'
}

function displayEmail(row: ReferralRow): string {
  return row.email || row.referred?.email || '—'
}

function isOverdue(row: ReferralRow): boolean {
  return Boolean(row.follow_up_at && new Date(row.follow_up_at).getTime() <= now)
}

async function load(): Promise<void> {
  loading.value = true
  try {
    const roster = await fetchTeamRoster()
    rows.value = roster.data
    summary.value = roster.summary
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo cargar el equipo')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

async function addPartner(): Promise<void> {
  inviting.value = true
  errors.value = {}
  message.value = ''
  created.value = null

  try {
    created.value = await createInvitation(email.value)
    toast.success(
      created.value.resent
        ? `Reenviamos el correo a ${created.value.email}.`
        : `Enviamos un correo a ${created.value.email}.`,
      created.value.resent ? 'Invitación reenviada' : 'Invitación enviada',
    )
    await load()
  } catch (error) {
    errors.value = fieldErrors(error)
    message.value = errorMessage(error, 'No se pudo crear la invitación')
    toast.fromError(error, 'No se pudo crear la invitación')
  } finally {
    inviting.value = false
  }
}

async function addCompanyPartner(): Promise<void> {
  inviting.value = true
  errors.value = {}
  message.value = ''
  created.value = null

  try {
    await registerCompanyPartner({
      name: companyForm.name,
      email: companyForm.email || undefined,
      phone: companyForm.phone || undefined,
      code: companyForm.code || undefined,
      rank_name: companyForm.rank_name || undefined,
    })
    companyForm.name = ''
    companyForm.email = ''
    companyForm.phone = ''
    companyForm.code = ''
    companyForm.rank_name = ''
    toast.success('Quedó en tu red de la marca. Aún no es socio de plataforma.', 'Socio de empresa')
    filter.value = 'company'
    await load()
  } catch (error) {
    errors.value = fieldErrors(error)
    message.value = errorMessage(error, 'No se pudo registrar el socio de empresa')
    toast.fromError(error, 'No se pudo registrar el socio de empresa')
  } finally {
    inviting.value = false
  }
}

async function convert(row: ReferralRow): Promise<void> {
  if (!row.organization_member_id) {
    return
  }
  convertingId.value = row.organization_member_id
  errors.value = {}
  try {
    created.value = await convertCompanyPartner(row.organization_member_id)
    inviteOpen.value = true
    addKind.value = 'partner'
    toast.success('Cuando acepte, entra como socio. Después puede volverse líder.', 'Listo para ser socio')
    await load()
  } catch (error) {
    toast.fromError(error, 'No se pudo convertir')
  } finally {
    convertingId.value = null
  }
}

async function copyLink(): Promise<void> {
  if (!inviteLink.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(inviteLink.value)
    toast.success('El enlace quedó en el portapapeles.', 'Enlace copiado')
  } catch {
    toast.error('No se pudo copiar. Selecciónalo a mano.')
  }
}
</script>

<template>
  <div>
    <div data-tour="team-welcome">
    <ModuleBanner
      icon="users"
      eyebrow="Líder"
      title="Equipo"
      body="Tres tipos, sin mezclar: socio (aún no paga plan), líder (ya tiene suscripción) y socio de empresa (red de tu marca). Las ventas de la tabla son de tu tienda, no el PV."
      :actions="[
        'Invita un socio de plataforma o registra uno de empresa a mano.',
        'Convierte un socio de empresa a socio para que luego pueda volverse líder.',
        'Filtra por color y tipo. El seguimiento CRM es solo de la red de plataforma.',
      ]"
    >
      <SoftButton variant="yellow" @click="inviteOpen = !inviteOpen">
        {{ inviteOpen ? 'Cerrar' : 'Añadir persona' }}
      </SoftButton>
    </ModuleBanner>
    </div>

    <CompanyScopeBar class="mt-4" label="Equipo de" @changed="load" />

    <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" data-tour="team-kpis">
      <SoftCard>
        <p class="flex items-center gap-2.5 text-sm text-muted">
          <ClayTile name="user" tone="yellow" size="sm" />
          Socios
        </p>
        <p class="mt-2 font-display text-3xl font-bold">{{ compactNumber(summary.partners) }}</p>
        <p class="mt-1 text-xs text-muted">Sin suscripción</p>
      </SoftCard>
      <SoftCard>
        <p class="flex items-center gap-2.5 text-sm text-muted">
          <ClayTile name="star" tone="ink" size="sm" />
          Líderes
        </p>
        <p class="mt-2 font-display text-3xl font-bold">{{ compactNumber(summary.independent_leaders) }}</p>
        <p class="mt-1 text-xs text-muted">Con plan pagado</p>
      </SoftCard>
      <SoftCard>
        <p class="flex items-center gap-2.5 text-sm text-muted">
          <ClayTile name="users" tone="royal" size="sm" />
          Empresa
        </p>
        <p class="mt-2 font-display text-3xl font-bold">{{ compactNumber(summary.company_partners) }}</p>
        <p class="mt-1 text-xs text-muted">Red de la marca</p>
      </SoftCard>
      <SoftCard>
        <p class="flex items-center gap-2.5 text-sm text-muted">
          <ClayTile name="bag" tone="coral" size="sm" />
          Ventas del equipo (mes)
        </p>
        <p class="mt-2 font-display text-3xl font-bold">{{ money(summary.sales_month) }}</p>
        <p class="mt-1 text-xs text-muted">Solo tienda, no PV</p>
      </SoftCard>
      <SoftCard>
        <p class="flex items-center gap-2.5 text-sm text-muted">
          <ClayTile name="clipboard" tone="lavender" size="sm" />
          Seguimientos pendientes
        </p>
        <p class="mt-2 font-display text-3xl font-bold">{{ compactNumber(summary.follow_ups_due) }}</p>
      </SoftCard>
    </div>

    <SoftCard v-if="inviteOpen" class="mt-6 max-w-xl">
      <div class="flex gap-2">
        <button
          type="button"
          class="rounded-full px-4 py-2 text-sm"
          :class="addKind === 'partner' ? 'bg-yellow text-on-yellow' : 'bg-shell'"
          @click="addKind = 'partner'"
        >
          Socio de plataforma
        </button>
        <button
          type="button"
          class="rounded-full px-4 py-2 text-sm"
          :class="addKind === 'company' ? 'bg-[#2563eb] text-white' : 'bg-shell'"
          @click="addKind = 'company'"
        >
          Socio de empresa
        </button>
      </div>

      <template v-if="addKind === 'partner'">
        <h2 class="mt-5 font-medium">Invitar socio</h2>
        <p class="mt-1 text-sm text-muted">
          Le enviamos un correo con el enlace de registro. Si no llega, vuelve a usar el mismo correo para reenviarlo.
        </p>
        <form class="mt-4 space-y-4" @submit.prevent="addPartner">
          <p v-if="message && !created" class="text-sm text-red-600">{{ message }}</p>
          <SoftField label="Correo del socio" :error="errors.email?.[0]">
            <input v-model="email" :class="fieldControlClass" type="email" required placeholder="socio@correo.com" />
          </SoftField>
          <SoftButton type="submit" :disabled="inviting">
            {{ inviting ? 'Enviando…' : 'Enviar invitación' }}
          </SoftButton>
        </form>
      </template>

      <template v-else>
        <h2 class="mt-5 font-medium">Registrar socio de empresa</h2>
        <p class="mt-1 text-sm text-muted">
          Alta manual en tu red de la marca. No crea cuenta de plataforma. Luego puedes convertirlo a socio.
        </p>
        <form class="mt-4 space-y-4" @submit.prevent="addCompanyPartner">
          <p v-if="message && addKind === 'company'" class="text-sm text-red-600">{{ message }}</p>
          <SoftField label="Nombre" :error="errors.name?.[0]">
            <input v-model="companyForm.name" :class="fieldControlClass" required />
          </SoftField>
          <SoftField label="Correo" hint="Necesario si luego lo conviertes a socio." :error="errors.email?.[0]">
            <input v-model="companyForm.email" :class="fieldControlClass" type="email" />
          </SoftField>
          <div class="grid gap-4 sm:grid-cols-2">
            <SoftField label="WhatsApp / teléfono" :error="errors.phone?.[0]">
              <input v-model="companyForm.phone" :class="fieldControlClass" />
            </SoftField>
            <SoftField label="Código en la empresa" :error="errors.code?.[0]">
              <input v-model="companyForm.code" :class="fieldControlClass" placeholder="Opcional" />
            </SoftField>
          </div>
          <SoftField label="Rango de la marca" hint="Etiqueta. No es rango calificado ni PV.">
            <input v-model="companyForm.rank_name" :class="fieldControlClass" placeholder="Opcional" />
          </SoftField>
          <SoftButton type="submit" :disabled="inviting">
            {{ inviting ? 'Guardando…' : 'Registrar en la empresa' }}
          </SoftButton>
        </form>
      </template>

      <div v-if="created" class="mt-5">
        <p class="text-sm text-muted">
          Correo enviado a {{ created.email }}. Este enlace es un respaldo.
        </p>
        <p class="mt-3 break-all rounded-input bg-shell px-4 py-3 text-sm">{{ inviteLink }}</p>
        <div class="mt-4">
          <SoftButton variant="yellow" @click="copyLink">Copiar enlace</SoftButton>
        </div>
      </div>
    </SoftCard>

    <div class="mt-8 flex gap-2 overflow-x-auto pb-1" data-tour="team-filters">
      <button
        v-for="item in [
          { id: 'all', label: 'Todos' },
          { id: 'partners', label: 'Socios' },
          { id: 'leaders', label: 'Líderes' },
          { id: 'company', label: 'Empresa' },
          { id: 'follow_up', label: 'Seguimiento' },
        ] as const"
        :key="item.id"
        class="shrink-0 rounded-full px-4 py-2 text-sm"
        :class="filter === item.id ? 'bg-charcoal text-on-charcoal' : 'bg-card'"
        @click="filter = item.id"
      >
        {{ item.label }}
      </button>
    </div>

    <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <ReportExportBar
        label="Socios referidos"
        hint="Socios y líderes de plataforma"
        path="/dashboard/team/reports"
        :query="{ kind: 'referrals' }"
        file-base="socios_referidos"
      />
      <ReportExportBar
        label="Socios de empresa"
        hint="Red de la marca"
        path="/dashboard/team/reports"
        :query="{ kind: 'company' }"
        file-base="socios_empresa"
      />
    </div>

    <SoftCard :padded="false" class="mt-4 overflow-x-auto" data-tour="team-table">
      <p v-if="loading" class="p-6 text-sm text-muted">Cargando…</p>
      <p v-else-if="message && !inviteOpen" class="p-6 text-sm">{{ message }}</p>
      <p v-else-if="!rows.length" class="p-6 text-sm text-muted">
        Todavía no hay nadie en tu red. Usa <strong>Añadir persona</strong> para invitar un socio o registrar uno de empresa.
      </p>
      <p v-else-if="!visibleRows.length" class="p-6 text-sm text-muted">No hay resultados en este filtro.</p>
      <table v-else class="w-full min-w-[980px] text-left text-sm">
        <thead class="text-muted">
          <tr class="border-b border-line">
            <th class="px-5 py-3 font-medium"><TableHeading icon="user" label="Persona" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="star" label="Tipo" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="users" label="Su equipo" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="bag" label="Ventas mes" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="clipboard" label="CRM / rango" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="alarm" label="Seguimiento" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="calendar" label="Alta" /></th>
            <th class="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in visibleRows"
            :key="`${kindOf(row)}-${row.id}`"
            class="border-b border-line last:border-0"
            :class="
              kindOf(row) === 'leader'
                ? 'border-l-4 border-l-charcoal'
                : kindOf(row) === 'company'
                  ? 'border-l-4 border-l-[#2563eb]'
                  : 'border-l-4 border-l-yellow'
            "
          >
            <td class="px-5 py-4">
              <RouterLink
                v-if="kindOf(row) !== 'company' && row.referral_id"
                :to="{ name: 'team-member', params: { id: row.referral_id } }"
                class="inline-flex items-center gap-2 font-medium hover:underline"
              >
                <ClayTile :name="kindTile(kindOf(row)).name" :tone="kindTile(kindOf(row)).tone" size="sm" />
                {{ displayName(row) }}
              </RouterLink>
              <p v-else class="inline-flex items-center gap-2 font-medium">
                <ClayTile name="users" tone="royal" size="sm" />
                {{ displayName(row) }}
              </p>
              <p class="pl-10 text-muted">{{ displayEmail(row) }}</p>
              <p v-if="row.company_code" class="pl-10 text-xs text-muted">Código {{ row.company_code }}</p>
            </td>
            <td class="px-5 py-4">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                :class="
                  kindOf(row) === 'leader'
                    ? 'bg-charcoal text-on-charcoal'
                    : kindOf(row) === 'company'
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-yellow text-on-yellow'
                "
              >
                {{ kindLabel(kindOf(row)) }}
              </span>
              <p v-if="row.invite_pending" class="mt-1 text-xs text-muted">Invitación enviada</p>
            </td>
            <td class="px-5 py-4">
              {{ kindOf(row) === 'company' ? '—' : compactNumber(row.downline_count ?? 0) }}
            </td>
            <td class="px-5 py-4">
              {{ kindOf(row) === 'company' ? '—' : money(row.sales_month ?? 0) }}
            </td>
            <td class="px-5 py-4">
              <template v-if="kindOf(row) === 'company'">{{ row.rank_name || '—' }}</template>
              <template v-else>{{ crmStageLabel(row.crm_stage) }}</template>
            </td>
            <td class="px-5 py-4" :class="isOverdue(row) ? 'text-red-600' : ''">
              {{ row.follow_up_at ? formatDateTime(row.follow_up_at) : '—' }}
            </td>
            <td class="px-5 py-4">{{ formatDate(row.created_at) }}</td>
            <td class="px-5 py-4">
              <SoftButton
                v-if="row.can_convert"
                variant="outline"
                :disabled="convertingId === row.organization_member_id"
                @click="convert(row)"
              >
                {{ convertingId === row.organization_member_id ? 'Convirtiendo…' : 'Convertir a socio' }}
              </SoftButton>
            </td>
          </tr>
        </tbody>
      </table>
    </SoftCard>
  </div>
</template>
