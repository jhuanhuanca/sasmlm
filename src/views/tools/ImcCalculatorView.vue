<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { fetchMyLanding } from '@/api/landing'
import { fetchMyStore } from '@/api/store'
import { fetchImcPackages } from '@/api/tools'
import AppIcon from '@/components/ui/AppIcon.vue'
import CompanyScopeBar from '@/components/company/CompanyScopeBar.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import SoftField from '@/components/ui/SoftField.vue'
import {
  formatImcPackage,
  imcStatus,
  type ImcGoal,
  type ImcPackage,
} from '@/data/imcPackages'
import { useAuthStore } from '@/stores/auth'
import type { CompanyToolPackage } from '@/types/tools'
import { fieldControlClass } from '@/utils/ui'
import { whatsappUrl } from '@/utils/whatsapp'

const auth = useAuthStore()
const { user } = storeToRefs(auth)

const weight = ref<number | null>(null)
const height = ref<number | null>(null)
const bmi = ref<number | null>(null)
const error = ref('')
const pack = ref<ImcPackage | null>(null)
const packages = ref<CompanyToolPackage[]>([])
const companyName = ref('')
const loadingPacks = ref(true)
const leaderWhatsapp = ref('')

const storeUrl = computed(() => (user.value?.store?.slug ? `/s/${user.value.store.slug}` : ''))
const status = computed(() => (bmi.value === null ? '--' : imcStatus(bmi.value)))
const score = computed(() => (bmi.value === null ? '00.0' : bmi.value.toFixed(1)))
const statusTone = computed(() => {
  if (bmi.value === null) {
    return 'text-muted'
  }
  if (bmi.value < 18.5) {
    return 'text-ink'
  }
  if (bmi.value < 24.9) {
    return 'text-[#1b5e20]'
  }
  if (bmi.value < 29.9) {
    return 'text-ink'
  }

  return 'text-[#c62828]'
})

const requestHref = computed(() => {
  if (!pack.value || bmi.value === null) {
    return whatsappUrl(leaderWhatsapp.value)
  }

  return whatsappUrl(
    leaderWhatsapp.value,
    `Hola, quiero solicitar este paquete:\n\n${formatImcPackage(pack.value, score.value, status.value, companyName.value)}`,
  )
})

function packageFor(goal: ImcGoal): CompanyToolPackage | undefined {
  return packages.value.find((item) => item.goal === goal)
}

function calculate(): void {
  error.value = ''
  pack.value = null
  const kg = Number(weight.value || 0)
  const cm = Number(height.value || 0)

  if (kg <= 0 || cm <= 0) {
    bmi.value = null
    error.value = 'Por favor, ingresa valores válidos.'
    return
  }

  const meters = cm / 100
  bmi.value = kg / (meters * meters)
}

function openPackage(goal: ImcGoal): void {
  if (bmi.value === null) {
    calculate()
  }
  if (bmi.value === null) {
    return
  }

  const next = packageFor(goal)
  if (!next) {
    const label = goal === 'lose_weight' ? 'bajar de peso' : 'subir de peso'
    error.value = `${companyName.value || 'Tu empresa'} no tiene un paquete para ${label} en el catálogo. En sasadmin → Paquetes IMC hay que crear uno con ese objetivo y productos de la marca.`
    return
  }

  error.value = ''
  pack.value = {
    id: next.goal || next.id || goal,
    goal: next.goal,
    title: next.title,
    focus: next.focus,
    products: next.products,
  }
}

function backToCalc(): void {
  pack.value = null
}

async function loadCatalog(): Promise<void> {
  loadingPacks.value = true
  const catalog = await Promise.allSettled([fetchImcPackages()])
  if (catalog[0].status === 'fulfilled') {
    packages.value = catalog[0].value.data
    companyName.value = catalog[0].value.company?.name || user.value?.catalog_company_name || ''
  }
  loadingPacks.value = false
}

onMounted(async () => {
  leaderWhatsapp.value =
    user.value?.landing_page?.whatsapp ||
    String(user.value?.store?.settings?.whatsapp ?? '') ||
    ''

  const [landing, store] = await Promise.allSettled([fetchMyLanding(), fetchMyStore()])
  if (landing.status === 'fulfilled') {
    leaderWhatsapp.value =
      landing.value.whatsapp || landing.value.content?.whatsapp || leaderWhatsapp.value
  }
  if (store.status === 'fulfilled') {
    leaderWhatsapp.value =
      store.value.whatsapp || String(store.value.settings?.whatsapp ?? '') || leaderWhatsapp.value
  }
  await loadCatalog()
})
</script>

<template>
  <div class="mx-auto max-w-xl">
    <RouterLink to="/app/tools" class="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
      <span class="rotate-180"><AppIcon name="chevron" :size="14" /></span>
      Herramientas
    </RouterLink>

    <ModuleBanner
      class="mt-4"
      icon="star"
      eyebrow="Herramientas"
      title="Calculadora IMC"
      body="Mides peso y estatura, ves el índice y abres el paquete de tu empresa para bajar o subir de peso. Sirve para orientar a un cliente, no es un diagnóstico."
      :actions="[
        'Ingresa peso (kg) y estatura (cm) y calcula.',
        'Elige bajar o subir de peso según el resultado.',
        'Los productos salen del catálogo de tu empresa, no de un kit genérico.',
      ]"
    />

    <CompanyScopeBar class="mt-4" label="Paquetes IMC de" @changed="loadCatalog" />

    <SoftCard v-if="!pack" :padded="false" class="overflow-hidden">
      <span class="block h-1 bg-yellow" />
      <div class="p-5 sm:p-8">
        <h2 class="font-medium">Rangos de referencia</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Usa estos rangos para explicar el resultado con claridad.
          <span v-if="companyName"> Paquetes de {{ companyName }}.</span>
        </p>

        <p v-if="loadingPacks" class="mt-4 text-sm text-muted">Cargando paquetes de tu empresa…</p>
        <p v-else-if="!packages.length" class="mt-4 text-sm text-muted">
          Tu empresa aún no cargó paquetes IMC en el catálogo. Administración los arma en sasadmin → Paquetes IMC, con productos de la marca.
        </p>

        <div class="mt-5 space-y-2 rounded-card-sm bg-shell px-4 py-4 text-sm">
          <p><b>18.5 – 24.9:</b> Peso Normal</p>
          <p><b>25.0 – 29.9:</b> Sobrepeso</p>
          <p><b>30.0 o más:</b> Obesidad</p>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="calculate">
          <SoftField label="Peso (kg)">
            <input v-model.number="weight" :class="fieldControlClass" type="number" min="1" step="0.1" placeholder="Ej: 75" required />
          </SoftField>
          <SoftField label="Estatura (cm)">
            <input v-model.number="height" :class="fieldControlClass" type="number" min="50" step="1" placeholder="Ej: 175" required />
          </SoftField>
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          <button type="submit" class="imc-submit">Calcular ahora</button>
        </form>

        <div v-if="bmi !== null" class="mt-8 text-center">
          <p class="font-display text-6xl font-bold tracking-tight" :class="statusTone">{{ score }}</p>
          <p class="mt-2 text-lg font-semibold" :class="statusTone">{{ status }}</p>
          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" class="imc-pack" @click="openPackage('lose_weight')">
              Bajar de peso
            </button>
            <button type="button" class="imc-pack is-dark" @click="openPackage('gain_weight')">
              Subir de peso
            </button>
          </div>
          <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
        </div>
      </div>
    </SoftCard>

    <div v-else class="mt-4 space-y-4">
      <SoftCard :padded="false" class="overflow-hidden">
        <div class="border-b border-line bg-shell px-5 py-5 sm:px-8">
          <p class="text-xs tracking-[0.18em] text-muted uppercase">
            Paquete de {{ companyName || 'tu empresa' }} · IMC {{ score }}
          </p>
          <h1 class="font-display mt-1 text-3xl font-bold tracking-tight">{{ pack.title }}</h1>
          <p class="mt-2 text-sm text-muted">{{ pack.focus }}</p>
        </div>
        <p v-if="!pack.products.length" class="px-5 py-4 text-sm text-red-600 sm:px-8">
          El paquete está en el catálogo, pero ninguno de sus productos está disponible en tu país.
          En sasadmin, abre el producto del kit y marca también tu país, o deja la lista de países vacía para que valga en todos.
        </p>
        <ol class="divide-y divide-line">
          <li v-for="(product, index) in pack.products" :key="product.name" class="flex gap-4 px-5 py-4 sm:px-8">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-charcoal text-xs font-semibold text-white">
              {{ index + 1 }}
            </span>
            <div>
              <p class="font-medium">{{ product.name }}</p>
              <p v-if="product.usage" class="mt-1 text-sm text-muted">{{ product.usage }}</p>
            </div>
          </li>
        </ol>
      </SoftCard>

      <div class="flex flex-wrap gap-2">
        <a
          :href="requestHref"
          class="inline-flex items-center justify-center gap-2 rounded-btn bg-yellow px-5 py-2.5 text-sm font-medium text-ink"
          target="_blank"
          rel="noreferrer"
        >
          <AppIcon name="whatsapp" :size="16" />
          Solicitar paquete
        </a>
        <a
          v-if="storeUrl"
          :href="storeUrl"
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center justify-center rounded-btn bg-charcoal px-5 py-2.5 text-sm font-medium text-white"
        >
          Ver productos en tienda
        </a>
        <SoftButton variant="outline" @click="backToCalc">Volver al cálculo</SoftButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.imc-submit,
.imc-pack {
  width: 100%;
  border: 0;
  border-radius: 999px;
  padding: 1rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
}

.imc-submit {
  background: var(--rex-yellow);
  color: var(--rex-on-yellow);
}

.imc-pack {
  background: var(--rex-yellow);
  color: var(--rex-on-yellow);
}

.imc-pack.is-dark {
  background: var(--rex-charcoal);
  color: var(--rex-on-charcoal);
}
</style>
