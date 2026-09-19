<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { addTeamActivity, fetchTeamMember, updateTeamMember } from '@/api/team'
import AppIcon from '@/components/ui/AppIcon.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import SoftField from '@/components/ui/SoftField.vue'
import TableHeading from '@/components/ui/TableHeading.vue'
import { useToast } from '@/composables/useToast'
import type { TeamMemberDetail } from '@/types/mlm'
import { compactNumber, crmStageLabel, formatDate, formatDateTime, money } from '@/utils/format'
import { errorMessage } from '@/utils/http'
import { fieldControlClass } from '@/utils/ui'

const route = useRoute()
const member = ref<TeamMemberDetail | null>(null)
const loading = ref(true)
const saving = ref(false)
const posting = ref(false)
const message = ref('')
const toast = useToast()
const id = computed(() => Number(route.params.id))

const crm = reactive({
  crm_stage: 'new',
  notes: '',
  follow_up_at: '',
})
const canSellInventory = ref(false)
const savingGrant = ref(false)

const activity = reactive({
  type: 'note',
  body: '',
  due_at: '',
})

const stages = [
  { id: 'new', label: 'Nuevo' },
  { id: 'contacted', label: 'Contactado' },
  { id: 'active', label: 'Activo' },
  { id: 'follow_up', label: 'Seguimiento' },
  { id: 'needs_support', label: 'Necesita apoyo' },
  { id: 'independent', label: 'Independiente' },
]

function datetimeLocal(value: string | null | undefined): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function applyMember(next: TeamMemberDetail): void {
  member.value = next
  crm.crm_stage = String(next.crm_stage ?? 'new')
  crm.notes = next.notes ?? ''
  crm.follow_up_at = datetimeLocal(next.follow_up_at)
  canSellInventory.value = Boolean(next.can_sell_inventory)
}

async function load(): Promise<void> {
  loading.value = true
  message.value = ''

  try {
    applyMember(await fetchTeamMember(id.value))
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo cargar la ficha')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

async function saveCrm(): Promise<void> {
  saving.value = true
  message.value = ''

  try {
    applyMember(
      await updateTeamMember(id.value, {
        crm_stage: crm.crm_stage,
        notes: crm.notes || null,
        follow_up_at: crm.follow_up_at ? new Date(crm.follow_up_at).toISOString() : null,
      }),
    )
    toast.success('Etapa, notas y fecha de seguimiento quedaron guardados.', 'Seguimiento actualizado')
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo guardar el seguimiento')
    toast.fromError(error, 'No se pudo guardar el seguimiento')
  } finally {
    saving.value = false
  }
}

async function saveSellGrant(): Promise<void> {
  savingGrant.value = true
  message.value = ''

  try {
    applyMember(
      await updateTeamMember(id.value, {
        can_sell_inventory: canSellInventory.value,
      }),
    )
    toast.success(
      canSellInventory.value
        ? 'El socio ya puede vender de tu inventario personal desde su panel.'
        : 'Le quitaste el acceso a tu inventario personal.',
      canSellInventory.value ? 'Permiso de venta activo' : 'Permiso de venta retirado',
    )
  } catch (error) {
    canSellInventory.value = Boolean(member.value?.can_sell_inventory)
    message.value = errorMessage(error, 'No se pudo actualizar el permiso de venta')
    toast.fromError(error, 'No se pudo actualizar el permiso de venta')
  } finally {
    savingGrant.value = false
  }
}

async function postActivity(): Promise<void> {
  if (!activity.body.trim()) {
    return
  }

  posting.value = true
  message.value = ''

  try {
    await addTeamActivity(id.value, {
      type: activity.type,
      body: activity.body,
      due_at: activity.due_at ? new Date(activity.due_at).toISOString() : null,
    })
    activity.body = ''
    activity.due_at = ''
    applyMember(await fetchTeamMember(id.value))
    toast.success('La nota quedó en la ficha del socio.', 'Actividad registrada')
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo registrar la nota')
    toast.fromError(error, 'No se pudo registrar la nota')
  } finally {
    posting.value = false
  }
}

function activityLabel(type: string): string {
  const labels: Record<string, string> = {
    note: 'Nota',
    follow_up: 'Seguimiento',
    call: 'Llamada',
    support: 'Apoyo',
  }

  return labels[type] ?? type
}
</script>

<template>
  <div>
    <RouterLink to="/app/team" class="text-sm text-muted hover:text-ink">← Volver al equipo</RouterLink>

    <p v-if="loading" class="mt-6 text-sm text-muted">Cargando ficha…</p>
    <p v-else-if="message && !member" class="mt-6 text-sm text-red-600">{{ message }}</p>

    <template v-else-if="member">
      <ModuleBanner
        class="mt-4"
        icon="user"
        eyebrow="Equipo · ficha CRM"
        :title="member.referred?.name ?? 'Ficha'"
        :body="`${member.referred?.email ?? ''} · ${member.is_leader ? 'Líder independiente' : 'Socio'} · ${crmStageLabel(member.crm_stage)}. Aquí actualizas etapa, notas y seguimiento. Las ventas son de tu tienda, no PV de empresa.`"
        :actions="[
          'Cambia la etapa y guarda el próximo seguimiento.',
          'Añade una nota, llamada o apoyo.',
          'Revisa pedidos a su nombre y, si ya es líder, su propia red.',
        ]"
      />

      <p v-if="message" class="mt-4 text-sm text-red-600">{{ message }}</p>

      <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SoftCard>
          <p class="text-sm text-muted">Ventas del mes</p>
          <p class="mt-2 font-display text-3xl font-bold">{{ money(member.sales_month ?? 0) }}</p>
        </SoftCard>
        <SoftCard>
          <p class="text-sm text-muted">Ventas totales</p>
          <p class="mt-2 font-display text-3xl font-bold">{{ money(member.sales_total ?? 0) }}</p>
        </SoftCard>
        <SoftCard>
          <p class="text-sm text-muted">Pedidos</p>
          <p class="mt-2 font-display text-3xl font-bold">{{ compactNumber(member.orders_count ?? 0) }}</p>
        </SoftCard>
        <SoftCard>
          <p class="text-sm text-muted">Su propio equipo</p>
          <p class="mt-2 font-display text-3xl font-bold">{{ compactNumber(member.downline_count ?? 0) }}</p>
        </SoftCard>
      </div>

      <div class="mt-6 grid gap-5 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div class="space-y-5">
          <SoftCard>
            <h2 class="font-medium">Seguimiento</h2>
            <form class="mt-4 space-y-4" @submit.prevent="saveCrm">
              <SoftField label="Etapa">
                <select v-model="crm.crm_stage" :class="fieldControlClass">
                  <option v-for="stage in stages" :key="stage.id" :value="stage.id">{{ stage.label }}</option>
                </select>
              </SoftField>
              <SoftField label="Próximo seguimiento">
                <input v-model="crm.follow_up_at" :class="fieldControlClass" type="datetime-local" />
              </SoftField>
              <SoftField label="Notas">
                <textarea v-model="crm.notes" :class="fieldControlClass" rows="5" />
              </SoftField>
              <SoftButton type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</SoftButton>
            </form>
          </SoftCard>

          <SoftCard v-if="member.referred_id">
            <h2 class="font-medium">Vender de tu inventario</h2>
            <p class="mt-2 text-sm text-muted">
              Si lo activas, este socio ve tu inventario personal en su panel y puede registrar ventas. Se descuenta tu stock. No ve costos ni puede editar productos.
            </p>
            <label class="mt-4 flex items-start gap-3 text-sm">
              <input v-model="canSellInventory" class="mt-1" type="checkbox" />
              <span>Puede vender de mi inventario personal</span>
            </label>
            <div class="mt-4">
              <SoftButton type="button" :disabled="savingGrant" @click="saveSellGrant">
                {{ savingGrant ? 'Guardando…' : 'Guardar permiso' }}
              </SoftButton>
            </div>
          </SoftCard>
        </div>

        <SoftCard>
          <h2 class="font-medium">Registrar actividad</h2>
          <form class="mt-4 space-y-4" @submit.prevent="postActivity">
            <SoftField label="Tipo">
              <select v-model="activity.type" :class="fieldControlClass">
                <option value="note">Nota</option>
                <option value="call">Llamada</option>
                <option value="follow_up">Seguimiento</option>
                <option value="support">Apoyo</option>
              </select>
            </SoftField>
            <SoftField v-if="activity.type === 'follow_up'" label="Fecha de seguimiento">
              <input v-model="activity.due_at" :class="fieldControlClass" type="datetime-local" />
            </SoftField>
            <SoftField label="Detalle">
              <textarea v-model="activity.body" :class="fieldControlClass" rows="4" required />
            </SoftField>
            <SoftButton type="submit" :disabled="posting">{{ posting ? 'Guardando…' : 'Añadir' }}</SoftButton>
          </form>

          <ul class="mt-6 divide-y divide-line">
            <li v-if="!member.activities?.length" class="py-4 text-sm text-muted">Aún no hay actividad.</li>
            <li v-for="item in member.activities" :key="item.id" class="py-4">
              <p class="text-xs text-muted">
                {{ activityLabel(item.type) }} · {{ formatDateTime(item.created_at) }}
              </p>
              <p class="mt-1 text-sm">{{ item.body }}</p>
            </li>
          </ul>
        </SoftCard>
      </div>

      <div class="mt-6 grid gap-5 xl:grid-cols-2">
        <SoftCard :padded="false" class="overflow-x-auto">
          <div class="px-5 py-4">
            <h2 class="font-medium">Pedidos a su nombre</h2>
          </div>
          <p v-if="!member.orders?.length" class="px-5 pb-5 text-sm text-muted">Todavía no hay compras atribuidas.</p>
          <table v-else class="w-full min-w-[480px] text-left text-sm">
            <thead class="text-muted">
              <tr class="border-t border-line">
                <th class="px-5 py-3 font-medium"><TableHeading icon="user" label="Cliente" /></th>
                <th class="px-5 py-3 font-medium"><TableHeading icon="wallet" label="Total" /></th>
                <th class="px-5 py-3 font-medium"><TableHeading icon="clipboard" label="Estado" /></th>
                <th class="px-5 py-3 font-medium"><TableHeading icon="calendar" label="Fecha" /></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in member.orders" :key="order.id" class="border-t border-line">
                <td class="px-5 py-3">
                  <p class="inline-flex items-center gap-2">
                    <span class="grid h-8 w-8 place-items-center rounded-full bg-shell text-muted">
                      <AppIcon name="user" :size="14" />
                    </span>
                    {{ order.customer_name }}
                  </p>
                  <p class="pl-10 text-muted">{{ order.customer_email }}</p>
                </td>
                <td class="px-5 py-3">{{ money(order.total, order.currency) }}</td>
                <td class="px-5 py-3 capitalize">{{ order.status }}</td>
                <td class="px-5 py-3">{{ formatDate(order.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </SoftCard>

        <SoftCard :padded="false" class="overflow-x-auto">
          <div class="px-5 py-4">
            <h2 class="font-medium">Su red (si ya es líder)</h2>
          </div>
          <p v-if="!member.downline?.length" class="px-5 pb-5 text-sm text-muted">
            Aún no tiene socios propios registrados.
          </p>
          <table v-else class="w-full min-w-[420px] text-left text-sm">
            <thead class="text-muted">
              <tr class="border-t border-line">
                <th class="px-5 py-3 font-medium"><TableHeading icon="user" label="Socio" /></th>
                <th class="px-5 py-3 font-medium"><TableHeading icon="clipboard" label="Estado" /></th>
                <th class="px-5 py-3 font-medium"><TableHeading icon="calendar" label="Alta" /></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in member.downline" :key="row.id" class="border-t border-line">
                <td class="px-5 py-3">
                  <p class="inline-flex items-center gap-2">
                    <span class="grid h-8 w-8 place-items-center rounded-full bg-shell text-muted">
                      <AppIcon name="users" :size="14" />
                    </span>
                    {{ row.referred?.name ?? '—' }}
                  </p>
                  <p class="pl-10 text-muted">{{ row.referred?.email }}</p>
                </td>
                <td class="px-5 py-3 capitalize">{{ row.status }}</td>
                <td class="px-5 py-3">{{ formatDate(row.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </SoftCard>
      </div>
    </template>
  </div>
</template>
