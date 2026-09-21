<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { updatePassword } from '@/api/auth'
import {
  cancelSubscription,
  fetchInvoices,
  fetchPlans,
  fetchSubscription,
  subscribeAsLeader,
  type BillingInvoice,
} from '@/api/subscription'
import AuthPasswordField from '@/components/auth/AuthPasswordField.vue'
import AppearanceSettings from '@/components/settings/AppearanceSettings.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import type { Plan } from '@/types/mlm'
import { fieldErrors } from '@/utils/http'
import { money, roleLabel } from '@/utils/format'

const auth = useAuthStore()
const { user, roles, isLeader, isAdmin } = storeToRefs(auth)
const router = useRouter()
const toast = useToast()

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
})
const passwordErrors = ref<Record<string, string[]>>({})
const savingPassword = ref(false)

const invoices = ref<BillingInvoice[]>([])
const plans = ref<Plan[]>([])
const billing = ref(user.value?.billing ?? null)
const loadingBilling = ref(false)
const savingPlan = ref<number | null>(null)
const canceling = ref(false)

const showBilling = computed(() => isLeader.value || isAdmin.value)
const usesGoogle = computed(() => Boolean(user.value?.uses_google))
const currentPlanId = computed(() => billing.value?.plan?.id ?? null)
const cancelScheduled = computed(() => Boolean(billing.value?.ends_at))

const upgradePlans = computed(() => {
  const current = Number(billing.value?.plan?.price ?? 0)
  return plans.value
    .filter((plan) => plan.interval === 'month')
    .filter((plan) => Number(plan.price) > current || plan.id === currentPlanId.value)
})

function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(['es'], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

function formatWhen(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

function invoiceStatus(status: string): string {
  if (status === 'completed' || status === 'paid' || status === 'billed') {
    return 'Pagada'
  }
  if (status === 'past_due') {
    return 'Impaga'
  }
  if (status === 'canceled' || status === 'cancelled') {
    return 'Anulada'
  }
  return status || '—'
}

async function logout(): Promise<void> {
  await auth.logout()
  toast.info('Cerraste sesión en este dispositivo.', 'Sesión cerrada')
  await router.push({ name: 'login' })
}

async function savePassword(): Promise<void> {
  savingPassword.value = true
  passwordErrors.value = {}
  try {
    await updatePassword({
      ...(usesGoogle.value ? {} : { current_password: passwordForm.value.current_password }),
      password: passwordForm.value.password,
      password_confirmation: passwordForm.value.password_confirmation,
    })
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' }
    toast.success('Ya puedes entrar con la nueva clave.', 'Contraseña actualizada')
  } catch (error) {
    passwordErrors.value = fieldErrors(error)
    toast.fromError(error, 'No se pudo cambiar la contraseña')
  } finally {
    savingPassword.value = false
  }
}

async function loadBilling(): Promise<void> {
  if (!showBilling.value) {
    return
  }
  loadingBilling.value = true
  try {
    const [sub, list, catalog] = await Promise.all([
      fetchSubscription(),
      fetchInvoices(),
      fetchPlans(),
    ])
    billing.value = sub.billing ?? user.value?.billing ?? null
    invoices.value = list
    plans.value = catalog
    if (sub.billing && user.value) {
      auth.setUser({ ...user.value, billing: sub.billing })
    }
  } catch (error) {
    toast.fromError(error, 'No se pudo cargar la suscripción')
  } finally {
    loadingBilling.value = false
  }
}

async function choosePlan(plan: Plan): Promise<void> {
  if (plan.id === currentPlanId.value) {
    return
  }
  savingPlan.value = plan.id
  try {
    const payload = await subscribeAsLeader(plan.id)
    if (payload.checkout_url) {
      window.location.assign(payload.checkout_url)
      return
    }
    if (payload.offline) {
      toast.error(
        'El servidor sigue en cobro local (BILLING_OFFLINE). No se abre Paddle.',
        'Paddle no se abrió',
      )
      return
    }
    if (payload.user) {
      auth.setUser(payload.user)
      billing.value = payload.user.billing ?? billing.value
    } else {
      await auth.hydrate()
      await loadBilling()
    }
    toast.success(`Pasaste a ${plan.name}.`, payload.upgraded ? 'Plan actualizado' : 'Plan activado')
  } catch (error) {
    toast.fromError(error, 'No se pudo cambiar el plan')
  } finally {
    savingPlan.value = null
  }
}

async function endSubscription(): Promise<void> {
  if (cancelScheduled.value) {
    return
  }
  if (!window.confirm('¿Cancelar al final del periodo ya pagado? Seguirás usando el panel hasta esa fecha.')) {
    return
  }
  canceling.value = true
  try {
    const payload = await cancelSubscription()
    billing.value = {
      ...(billing.value ?? { has_paid_access: true }),
      ends_at: payload.ends_at ?? billing.value?.ends_at,
    }
    toast.success(payload.message ?? 'La suscripción se detendrá al final del periodo.', 'Cancelación programada')
    await loadBilling()
  } catch (error) {
    toast.fromError(error, 'No se pudo cancelar')
  } finally {
    canceling.value = false
  }
}

onMounted(() => {
  void loadBilling()
})
</script>

<template>
  <div class="space-y-10">
    <div data-tour="profile-welcome">
      <ModuleBanner
        icon="gear"
        eyebrow="Cuenta"
        title="Ajustes"
        body="Datos de sesión, contraseña, suscripción y apariencia del panel. La paleta se guarda en este dispositivo, no en el servidor."
        :actions="[
          'Cambia tu contraseña cuando quieras.',
          'Revisa plan, facturas y mejora o termina la suscripción.',
          'Ajusta claro/oscuro y la paleta de tu marca.',
        ]"
      />
    </div>

    <div class="grid gap-8 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div class="space-y-8">
        <SoftCard v-if="user" class="space-y-4 text-sm" data-tour="profile-account">
          <div>
            <p class="text-muted">Nombre</p>
            <p class="mt-1 text-lg font-medium">{{ user.name }}</p>
          </div>
          <div>
            <p class="text-muted">Correo</p>
            <p class="mt-1">{{ user.email }}</p>
          </div>
          <div>
            <p class="text-muted">Rol</p>
            <p class="mt-1">{{ roles.map(roleLabel).join(', ') }}</p>
          </div>
          <div>
            <p class="text-muted">Red</p>
            <p class="mt-1">{{ user.network?.name ?? '—' }} · {{ user.network?.status ?? 'sin estado' }}</p>
          </div>
          <div v-if="user.catalog_company_name || user.country">
            <p class="text-muted">Empresa y rango</p>
            <p class="mt-1">
              {{ user.catalog_company_name ?? 'Sin empresa' }}
              <template v-if="user.catalog_rank_name"> · {{ user.catalog_rank_name }}</template>
            </p>
            <p v-if="user.country" class="mt-1 text-muted">País: {{ countryName(user.country) }}</p>
          </div>
          <SoftButton variant="outline" @click="logout">Cerrar sesión</SoftButton>
        </SoftCard>

        <SoftCard class="space-y-4" data-tour="profile-password">
          <div>
            <h2 class="font-display text-xl font-bold">Contraseña</h2>
            <p class="mt-1 text-sm text-muted">
              {{
                usesGoogle
                  ? 'Entraste con Google. Puedes definir una contraseña para el correo y la clave.'
                  : 'Cambia la clave de acceso a este correo.'
              }}
            </p>
          </div>
          <form class="space-y-3" @submit.prevent="savePassword">
            <AuthPasswordField
              v-if="!usesGoogle"
              v-model="passwordForm.current_password"
              label="Contraseña actual"
              autocomplete="current-password"
              :error="passwordErrors.current_password?.[0]"
            />
            <AuthPasswordField
              v-model="passwordForm.password"
              label="Nueva contraseña"
              autocomplete="new-password"
              :error="passwordErrors.password?.[0]"
            />
            <AuthPasswordField
              v-model="passwordForm.password_confirmation"
              label="Repite la nueva"
              autocomplete="new-password"
              :error="passwordErrors.password_confirmation?.[0]"
            />
            <SoftButton type="submit" :disabled="savingPassword">
              {{ savingPassword ? 'Guardando…' : 'Actualizar contraseña' }}
            </SoftButton>
          </form>
        </SoftCard>
      </div>

      <div class="space-y-8">
        <SoftCard v-if="showBilling" class="space-y-5" data-tour="profile-billing">
          <div>
            <h2 class="font-display text-xl font-bold">Suscripción</h2>
            <p class="mt-1 text-sm text-muted">Plan de líder, facturas de Paddle y cambio de paquete.</p>
          </div>

          <p v-if="loadingBilling" class="text-sm text-muted">Cargando cobros…</p>
          <template v-else>
            <div class="rounded-card border border-line bg-shell/60 p-4">
              <p class="text-xs uppercase tracking-wide text-muted">Plan actual</p>
              <p class="mt-1 text-lg font-semibold">
                {{ billing?.plan?.name ?? 'Sin plan cobrado' }}
              </p>
              <p v-if="billing?.plan" class="mt-1 text-sm text-muted">
                {{ money(billing.plan.price, 'USD') }} al mes
                <template v-if="billing.next_billed_at">
                  · próximo cobro {{ formatWhen(billing.next_billed_at) }}
                </template>
              </p>
              <p v-if="billing?.complimentary" class="mt-2 text-sm text-muted">Cortesía: no pasa por Paddle.</p>
              <p v-if="cancelScheduled" class="mt-2 text-sm text-red-700">
                Cancelación programada para {{ formatWhen(billing?.ends_at) }}. Hasta esa fecha sigues con acceso.
              </p>
            </div>

            <div>
              <p class="text-sm font-medium">Mejorar plan</p>
              <p class="mt-1 text-xs text-muted">
                El upgrade se cobra con prorrateo. Intermedio y Premium desbloquean tienda y herramientas.
              </p>
              <div class="mt-3 grid gap-3 sm:grid-cols-3">
                <button
                  v-for="plan in upgradePlans"
                  :key="plan.id"
                  type="button"
                  class="rounded-card border p-3 text-left text-sm transition"
                  :class="
                    plan.id === currentPlanId
                      ? 'border-charcoal bg-yellow-soft'
                      : 'border-line hover:border-gray-mid'
                  "
                  :disabled="savingPlan !== null || plan.id === currentPlanId"
                  @click="choosePlan(plan)"
                >
                  <p class="font-semibold">{{ plan.name }}</p>
                  <p class="mt-1 text-muted">{{ money(plan.price, plan.currency) }}/mes</p>
                  <p class="mt-2 text-xs">
                    {{ plan.id === currentPlanId ? 'Plan actual' : savingPlan === plan.id ? 'Cambiando…' : 'Mejorar' }}
                  </p>
                </button>
              </div>
            </div>

            <div>
              <p class="text-sm font-medium">Facturas mensuales</p>
              <p v-if="!invoices.length" class="mt-2 text-sm text-muted">
                Aún no hay cobros de Paddle. El arranque es US$ 1 (tarjeta obligatoria, no es un mes gratis) y luego las renovaciones.
              </p>
              <ul v-else class="mt-3 divide-y divide-line rounded-card border border-line">
                <li v-for="row in invoices" :key="row.id" class="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5 text-sm">
                  <span>
                    <span class="font-medium">{{ row.description }}</span>
                    <span class="mt-0.5 block text-xs text-muted">{{ formatWhen(row.billed_at) }} · {{ invoiceStatus(row.status) }}</span>
                  </span>
                  <span class="font-medium">{{ money(row.amount, row.currency) }}</span>
                </li>
              </ul>
            </div>

            <div class="border-t border-line pt-4">
              <p class="text-sm font-medium">Terminar suscripción</p>
              <p class="mt-1 text-xs text-muted">
                No se prorratea el mes en curso. Sigues usando el panel hasta el próximo cobro; después vuelves a socio de red.
              </p>
              <SoftButton class="mt-3" variant="outline" :disabled="canceling || cancelScheduled" @click="endSubscription">
                {{ cancelScheduled ? 'Ya está programada la baja' : canceling ? 'Cancelando…' : 'Cancelar al final del periodo' }}
              </SoftButton>
            </div>
          </template>
        </SoftCard>

        <div data-tour="profile-look">
          <AppearanceSettings />
        </div>
      </div>
    </div>
  </div>
</template>
