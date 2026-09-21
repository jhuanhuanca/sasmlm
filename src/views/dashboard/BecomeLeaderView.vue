<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchPlans, subscribeAsLeader } from '@/api/subscription'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import type { Plan } from '@/types/mlm'
import { errorMessage } from '@/utils/http'
import { money } from '@/utils/format'

const auth = useAuthStore()
const router = useRouter()
const plans = ref<Plan[]>([])
const selectedId = ref<number | null>(null)
const loading = ref(true)
const saving = ref(false)
const message = ref('')
const toast = useToast()

const monthly = computed(() => plans.value.filter((plan) => plan.interval === 'month'))
const selected = computed(() => plans.value.find((plan) => plan.id === selectedId.value) ?? null)

function entitlementLines(plan: Plan): string[] {
  const e = plan.entitlements as Record<string, unknown> | undefined
  if (!e) {
    return []
  }
  const lines: string[] = []
  lines.push(e.landing ? 'Página propia' : 'Sin página pública')
  lines.push(e.store ? 'Tienda, inventario y POS' : 'Sin tienda propia')
  lines.push(e.tools ? 'IMC, flyers y bienestar' : 'Sin herramientas de ficha')
  lines.push(e.partner_sell ? 'Los colaboradores pueden vender tu inventario' : 'Los colaboradores no venden tu inventario')
  const max = e.max_partners
  lines.push(max ? `Hasta ${max} colaboradores` : 'Sin tope práctico de colaboradores')
  lines.push(Number(e.extra_companies) > 0 ? '1 catálogo extra incluido' : 'Catálogo extra: US$ 15/mes')
  return lines
}

onMounted(async () => {
  try {
    plans.value = await fetchPlans()
    const recommended = monthly.value.find((plan) => plan.recommended) ?? monthly.value[0] ?? plans.value[0]
    selectedId.value = recommended?.id ?? null
  } catch (error) {
    message.value = errorMessage(error, 'No se pudieron cargar los planes')
  } finally {
    loading.value = false
  }
})

async function subscribe(): Promise<void> {
  if (!selectedId.value) {
    return
  }

  saving.value = true
  message.value = ''

  try {
    const payload = await subscribeAsLeader(selectedId.value)
    if (payload.checkout_url) {
      window.location.assign(payload.checkout_url)
      return
    }
    if (payload.offline) {
      message.value =
        'El servidor sigue en cobro local (BILLING_OFFLINE). No se abre Paddle. En el VPS pon BILLING_OFFLINE=false y php artisan config:clear.'
      toast.error(message.value, 'Paddle no se abrió')
      return
    }
    if (payload.upgraded && payload.user) {
      auth.setUser(payload.user)
      await router.push({ name: 'dashboard' })
      toast.success('Tu plan en Paddle quedó actualizado.', 'Plan actualizado')
      return
    }
    message.value = 'Paddle no devolvió la URL de pago. Revisa la clave API, el pri_ y el dsc_ del plan.'
    toast.error(message.value, 'No hay checkout')
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo completar la suscripción')
    toast.fromError(error, 'No se pudo completar la suscripción')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl">
    <div data-tour="plan-welcome">
    <ModuleBanner
      icon="star"
      eyebrow="Suscripción"
      title="Elige tu plan de software"
      body="Suscripción SaaS. El primer ciclo por US$ 1 con tarjeta. Después Paddle cobra el precio de lista. El colaborador invitado no paga el plan. Los cobros de plataforma los formaliza Paddle como comerciante registrado."
      :actions="[
        'Básico: equipo y página. Sin tienda.',
        'Intermedio: tienda, inventario y que tus colaboradores vendan tu stock.',
        'Premium: un catálogo extra incluido y soporte prioritario.',
        'Tarjeta el día 1. Aviso 2 días antes de la renovación. Reembolso de 14 días en el primer cobro.',
      ]"
    />
    </div>

    <p v-if="loading" class="mt-8 text-sm text-muted">Cargando planes…</p>
    <p v-else-if="message" class="mt-8 text-sm text-red-600">{{ message }}</p>
    <p v-else-if="!plans.length" class="mt-8 text-sm text-muted">
      No hay planes activos. Pide a administración que publique uno.
    </p>

    <div v-else class="mt-8 grid gap-4 md:grid-cols-3" data-tour="plan-grid">
      <button
        v-for="plan in monthly.length ? monthly : plans"
        :key="plan.id"
        type="button"
        class="rounded-card border p-5 text-left transition"
        :class="
          selectedId === plan.id
            ? 'border-charcoal bg-card shadow-sm'
            : 'border-line bg-card hover:border-gray-mid'
        "
        @click="selectedId = plan.id"
      >
        <p class="text-xs uppercase tracking-wide text-muted">
          {{ plan.recommended ? 'Recomendado' : plan.name }}
        </p>
        <p class="text-lg font-semibold">{{ plan.name }}</p>
        <p class="mt-2 text-sm text-muted">El primer mes por {{ money(plan.intro_price ?? 1, plan.currency) }}</p>
        <p class="mt-1 font-display text-3xl font-bold">
          {{ money(plan.price, plan.currency) }}
          <span class="text-sm font-normal text-muted">desde el mes 2</span>
        </p>
        <ul class="mt-4 space-y-1 text-sm text-muted">
          <li v-for="line in entitlementLines(plan)" :key="line">{{ line }}</li>
        </ul>
      </button>
    </div>

    <div v-if="selected" class="mt-6">
      <SoftCard>
        <p class="text-sm text-muted">
          Al pagar dejas tarjeta en Paddle. El siguiente ciclo cobra
          {{ money(selected.price, selected.currency) }} si no cancelas antes.
        </p>
        <div class="mt-4">
          <SoftButton :disabled="saving" @click="subscribe">
            {{ saving ? 'Redirigiendo a Paddle…' : `Empezar ${selected.name} por US$ 1` }}
          </SoftButton>
        </div>
      </SoftCard>
    </div>
  </div>
</template>
