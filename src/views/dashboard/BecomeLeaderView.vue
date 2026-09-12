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

const selected = computed(() => plans.value.find((plan) => plan.id === selectedId.value) ?? null)

function intervalLabel(interval: string): string {
  if (interval === 'year') {
    return 'al año'
  }
  if (interval === 'week') {
    return 'a la semana'
  }

  return 'al mes'
}

function featuresOf(plan: Plan): string[] {
  if (Array.isArray(plan.features)) {
    return plan.features.map(String)
  }

  if (plan.features && typeof plan.features === 'object') {
    return Object.values(plan.features).map(String)
  }

  return []
}

onMounted(async () => {
  try {
    plans.value = await fetchPlans()
    selectedId.value = plans.value[0]?.id ?? null
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
    if (payload.user) {
      auth.setUser(payload.user)
    } else {
      await auth.hydrate()
    }
    await router.push({ name: 'dashboard' })
    toast.success('Ya puedes operar tu red, landing y tienda.', 'Ahora eres líder')
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo completar la suscripción')
    toast.fromError(error, 'No se pudo completar la suscripción')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl">
    <div data-tour="plan-welcome">
    <ModuleBanner
      icon="star"
      eyebrow="Socio"
      title="Volverse líder"
      body="Elige un plan y paga la suscripción de la plataforma con Paddle. Las ventas de tu tienda siguen con QR, transferencia o depósito: eso no pasa por Paddle."
      :actions="[
        'Compara los planes y lo que incluye cada uno.',
        'Suscríbete: se crea tu red y dejas de ser solo socio.',
        'Luego invita a tu primer socio desde Equipo.',
      ]"
    />
    </div>

    <p v-if="loading" class="mt-8 text-sm text-muted">Cargando planes…</p>
    <p v-else-if="message" class="mt-8 text-sm text-red-600">{{ message }}</p>
    <p v-else-if="!plans.length" class="mt-8 text-sm text-muted">
      No hay planes activos. Pide a administración que publique uno.
    </p>

    <div v-else class="mt-8 grid gap-4 md:grid-cols-2" data-tour="plan-grid">
      <button
        v-for="plan in plans"
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
        <p class="text-lg font-semibold">{{ plan.name }}</p>
        <p class="mt-2 font-display text-3xl font-bold">
          {{ money(plan.price, plan.currency) }}
          <span class="text-sm font-normal text-muted">{{ intervalLabel(plan.interval) }}</span>
        </p>
        <ul v-if="featuresOf(plan).length" class="mt-4 space-y-1 text-sm text-muted">
          <li v-for="feature in featuresOf(plan)" :key="feature">{{ feature }}</li>
        </ul>
      </button>
    </div>

    <div v-if="selected" class="mt-6">
      <SoftCard>
        <p class="text-sm text-muted">
          Al suscribirte dejas de ser solo socio: tendrás tu propio equipo y podrás invitar a otros.
        </p>
        <div class="mt-4">
          <SoftButton :disabled="saving" @click="subscribe">
            {{ saving ? 'Redirigiendo a Paddle…' : `Pagar ${selected.name} con Paddle` }}
          </SoftButton>
        </div>
      </SoftCard>
    </div>
  </div>
</template>
