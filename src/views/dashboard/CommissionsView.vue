<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  fetchCommissions,
  fetchWithdrawalBalance,
  fetchWithdrawals,
  requestWithdrawal,
} from '@/api/dashboard'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import SoftField from '@/components/ui/SoftField.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import TableHeading from '@/components/ui/TableHeading.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import type { CommissionRow, WithdrawalBalance, WithdrawalRequest } from '@/types/mlm'
import { formatDate, money } from '@/utils/format'
import { errorMessage, fieldErrors } from '@/utils/http'
import { fieldControlClass } from '@/utils/ui'

const auth = useAuthStore()
const toast = useToast()
const rows = ref<CommissionRow[]>([])
const withdrawals = ref<WithdrawalRequest[]>([])
const balance = ref<WithdrawalBalance | null>(null)
const loading = ref(true)
const message = ref('')
const formOpen = ref(false)
const submitting = ref(false)
const formMessage = ref('')
const formErrors = ref<Record<string, string[]>>({})
const form = reactive({
  collectAll: true,
  amount: '',
  whatsapp: '',
  password: '',
})

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  paid: 'Pagada',
  reversed: 'Revertida',
  cancelled: 'Cancelada',
  requested: 'Solicitada',
  rejected: 'Rechazada',
}

const defaultWhatsapp = computed(() => {
  const landing = auth.user?.landing_page?.whatsapp
  const store = auth.user?.store?.settings?.whatsapp
  return String(landing || store || '')
})

const available = computed(() => Number(balance.value?.available ?? 0))
const minimum = computed(() => Number(balance.value?.minimum ?? 20))
const canRequest = computed(() => Boolean(balance.value?.can_request))

function labelStatus(status: string): string {
  return statusLabels[status] ?? status
}

async function load(): Promise<void> {
  loading.value = true
  message.value = ''
  try {
    const [commissionsPage, withdrawalsPage, snapshot] = await Promise.all([
      fetchCommissions(),
      fetchWithdrawals(),
      fetchWithdrawalBalance(),
    ])
    rows.value = commissionsPage.data ?? []
    withdrawals.value = withdrawalsPage.data ?? []
    balance.value = snapshot
    if (!form.whatsapp) {
      form.whatsapp = snapshot.whatsapp || defaultWhatsapp.value
    }
  } catch (error) {
    message.value = errorMessage(error, 'No se pudieron cargar las comisiones')
  } finally {
    loading.value = false
  }
}

function openForm(): void {
  formOpen.value = true
  formMessage.value = ''
  formErrors.value = {}
  form.password = ''
  form.collectAll = true
  form.amount = available.value ? String(available.value) : ''
  form.whatsapp = balance.value?.whatsapp || defaultWhatsapp.value || form.whatsapp
}

async function submitWithdrawal(): Promise<void> {
  submitting.value = true
  formMessage.value = ''
  formErrors.value = {}

  try {
    await requestWithdrawal({
      collect_all: form.collectAll,
      amount: form.collectAll ? undefined : Number(form.amount),
      whatsapp: form.whatsapp.trim() || undefined,
      password: form.password,
    })
    form.password = ''
    formOpen.value = false
    await load()
    toast.success('Administración verá tu solicitud de cobro.', 'Retiro solicitado')
  } catch (error) {
    formErrors.value = fieldErrors(error)
    formMessage.value = errorMessage(error, 'No se pudo enviar la solicitud')
    toast.fromError(error, 'No se pudo enviar la solicitud')
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div data-tour="comm-welcome">
    <ModuleBanner
      icon="wallet"
      eyebrow="Líder"
      title="Comisiones"
      body="Ganas el 10 % cuando un socio que invitaste se suscribe como líder. Esas comisiones y los retiros son siempre en dólares (USD), aunque tu tienda venda en otra moneda. No es bono de producto ni venta de tienda."
      :actions="[
        'Revisa lo disponible, lo pendiente y lo ya pagado.',
        'Solicita el cobro con WhatsApp y tu contraseña.',
        'Sigue cada solicitud hasta que esté pagada.',
      ]"
    />
    </div>

    <p v-if="message" class="mt-4 text-sm">{{ message }}</p>

    <SoftCard v-if="balance" class="mt-8" data-tour="comm-balance">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs tracking-[0.18em] text-muted uppercase">Disponible para retiro</p>
          <p class="font-display mt-1 text-3xl font-bold">{{ money(available, balance.currency) }}</p>
          <p class="mt-2 text-sm text-muted">
            Pendiente en comisiones: {{ money(balance.pending, balance.currency) }}
            <span v-if="balance.reserved > 0">
              · En solicitud: {{ money(balance.reserved, balance.currency) }}
            </span>
          </p>
          <p class="mt-1 text-xs text-muted">El retiro mínimo es {{ money(minimum, balance.currency) }}.</p>
        </div>
        <SoftButton variant="yellow" :disabled="!canRequest" @click="openForm">Solicitar ganancias</SoftButton>
      </div>
      <p v-if="!canRequest" class="mt-4 text-sm text-muted">
        Aún no puedes solicitar un cobro: tus ganancias disponibles deben ser de al menos
        {{ money(minimum, balance.currency) }}.
      </p>
    </SoftCard>

    <SoftCard v-if="formOpen" class="mt-4">
      <h2 class="font-display text-2xl font-bold">Solicitar ganancias</h2>
      <p class="mt-2 text-sm text-muted">
        Administración recibirá esta solicitud y te contactará al WhatsApp o al correo de tu cuenta para coordinar el
        depósito. Confirma con tu contraseña del sistema.
      </p>
      <p v-if="formMessage" class="mt-3 text-sm text-red-600">{{ formMessage }}</p>
      <form class="mt-5 space-y-4" @submit.prevent="submitWithdrawal">
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input v-model="form.collectAll" type="checkbox" />
          Cobrar todo ({{ money(available, balance?.currency) }})
        </label>
        <SoftField v-if="!form.collectAll" label="Monto a retirar (USD)" :error="formErrors.amount?.[0]">
          <input
            v-model="form.amount"
            :class="fieldControlClass"
            type="number"
            :min="minimum"
            :max="available"
            step="0.01"
            required
          />
        </SoftField>
        <SoftField
          label="WhatsApp"
          hint="Número con código de país, sin signos. Si lo dejas vacío, usaremos el de tu tienda o landing."
          :error="formErrors.whatsapp?.[0]"
        >
          <input v-model="form.whatsapp" :class="fieldControlClass" inputmode="tel" placeholder="18095551234" />
        </SoftField>
        <SoftField label="Contraseña del sistema" :error="formErrors.password?.[0]">
          <input v-model="form.password" :class="fieldControlClass" type="password" required autocomplete="current-password" />
        </SoftField>
        <div class="flex flex-wrap gap-2">
          <SoftButton type="submit" variant="yellow" :disabled="submitting">
            {{ submitting ? 'Enviando…' : 'Enviar solicitud' }}
          </SoftButton>
          <SoftButton type="button" variant="outline" :disabled="submitting" @click="formOpen = false">Cancelar</SoftButton>
        </div>
      </form>
    </SoftCard>

    <SoftCard v-if="withdrawals.length" :padded="false" class="mt-8 overflow-x-auto">
      <div class="border-b border-line px-5 py-4">
        <h2 class="font-display text-xl font-bold">Solicitudes de retiro</h2>
      </div>
      <table class="w-full min-w-[560px] text-left text-sm">
        <thead class="text-muted">
          <tr class="border-b border-line">
            <th class="px-5 py-3 font-medium"><TableHeading icon="wallet" label="Monto" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="clipboard" label="Estado" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="whatsapp" label="Contacto" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="calendar" label="Fecha" /></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in withdrawals" :key="item.id" class="border-b border-line last:border-0">
            <td class="px-5 py-4">
              <span class="inline-flex items-center gap-2">
                <span class="grid h-8 w-8 place-items-center rounded-full bg-shell text-muted">
                  <AppIcon name="wallet" :size="14" />
                </span>
                {{ money(item.amount, item.currency) }}
              </span>
            </td>
            <td class="px-5 py-4">{{ labelStatus(String(item.status)) }}</td>
            <td class="px-5 py-4">
              <p class="inline-flex items-center gap-2">
                <AppIcon name="whatsapp" :size="14" />
                {{ item.whatsapp || '—' }}
              </p>
              <p class="pl-6 text-muted">{{ item.contact_email }}</p>
            </td>
            <td class="px-5 py-4">{{ formatDate(item.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </SoftCard>

    <SoftCard :padded="false" class="mt-8 overflow-x-auto" data-tour="comm-list">
      <p v-if="loading" class="p-6 text-sm text-muted">Cargando…</p>
      <p v-else-if="!rows.length" class="p-6 text-sm text-muted">Aún no hay comisiones.</p>
      <table v-else class="w-full min-w-[560px] text-left text-sm">
        <thead class="text-muted">
          <tr class="border-b border-line">
            <th class="px-5 py-3 font-medium"><TableHeading icon="user" label="Origen" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="wallet" label="Importe" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="chart" label="%" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="clipboard" label="Estado" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="calendar" label="Fecha" /></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="border-b border-line last:border-0">
            <td class="px-5 py-4">
              <p class="inline-flex items-center gap-2">
                <span class="grid h-8 w-8 place-items-center rounded-full bg-shell text-muted">
                  <AppIcon name="user" :size="14" />
                </span>
                {{ row.referred?.name ?? 'Suscripción' }}
              </p>
              <p class="pl-10 text-muted">{{ row.referred?.email }}</p>
            </td>
            <td class="px-5 py-4">{{ money(row.amount, row.currency) }}</td>
            <td class="px-5 py-4">{{ row.percentage }}%</td>
            <td class="px-5 py-4">{{ labelStatus(row.status) }}</td>
            <td class="px-5 py-4">{{ formatDate(row.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </SoftCard>
  </div>
</template>
