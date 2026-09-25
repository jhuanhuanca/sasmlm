<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { fetchWellnessNeeds } from '@/api/tools'
import AppIcon from '@/components/ui/AppIcon.vue'
import ClayTile from '@/components/ui/ClayTile.vue'
import CompanyScopeBar from '@/components/company/CompanyScopeBar.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import { formatWellnessProtocol, type WellnessProtocol } from '@/data/wellnessProtocols'
import { useCompanyToolGate } from '@/composables/useCompanyToolGate'
import { useAuthStore } from '@/stores/auth'
import { useCompanyToolsStore } from '@/stores/companyTools'
import type { CompanyToolPackage } from '@/types/tools'
import { fieldControlClass } from '@/utils/ui'

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const companyTools = useCompanyToolsStore()
useCompanyToolGate('wellness')

const selectedId = ref('')
const protocol = ref<WellnessProtocol | null>(null)
const copied = ref(false)
const query = ref('')
const needs = ref<CompanyToolPackage[]>([])
const companyName = ref('')
const companyLogo = ref<string | null>(null)
const loading = ref(true)

const isHgw = computed(() => {
  const name = (companyName.value || user.value?.catalog_company_name || '').toLowerCase()
  return name.includes('hgw') || name.includes('health green')
})

const options = computed(() => {
  const term = query.value.trim().toLowerCase()
  const list = needs.value.map((item) => ({
    id: String(item.id),
    label: item.title,
    focus: item.focus,
    products: item.products,
  }))

  if (!term) {
    return list
  }

  return list.filter((item) => item.label.toLowerCase().includes(term))
})

function showRecommendations(): void {
  copied.value = false
  protocol.value = options.value.find((item) => item.id === selectedId.value) ?? null
}

function backToSearch(): void {
  protocol.value = null
  selectedId.value = ''
  copied.value = false
}

async function copyInfo(): Promise<void> {
  if (!protocol.value) {
    return
  }

  await navigator.clipboard.writeText(formatWellnessProtocol(protocol.value, companyName.value))
  copied.value = true
}

async function onCompanyChanged(): Promise<void> {
  await companyTools.load(true)
  await loadNeeds()
}

async function loadNeeds(): Promise<void> {
  loading.value = true
  try {
    const payload = await fetchWellnessNeeds()
    needs.value = payload.data
    companyName.value = payload.company?.name || user.value?.catalog_company_name || ''
    companyLogo.value = payload.company?.logo ?? null
  } catch {
    needs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadNeeds()
})
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <RouterLink to="/app/tools" class="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
      <span class="rotate-180"><AppIcon name="chevron" :size="14" /></span>
      Herramientas
    </RouterLink>

    <ModuleBanner
      class="mt-4"
      icon="heart"
      eyebrow="Herramientas"
      title="Bienestar y salud"
      body="Protocolos de tu empresa para hablar con un cliente o un socio. Eliges la dolencia, ves los productos del catálogo y los copias. No sustituye una consulta médica."
      :actions="[
        'Busca o elige una dolencia en la lista de tu empresa.',
        'Revisa los productos recomendados y cópialos para WhatsApp.',
        'Si tu empresa no cargó protocolos, administración los arma en sasadmin → Bienestar.',
      ]"
    />

    <CompanyScopeBar class="mt-4" label="Protocolos de" @changed="onCompanyChanged" />

    <div v-if="!protocol" class="mt-4">
      <SoftCard :padded="false" class="overflow-hidden">
        <span class="block h-1 bg-yellow" />
        <div class="flex flex-col items-center px-8 pt-8 sm:px-16 sm:pt-10">
          <img
            v-if="companyLogo"
            :src="companyLogo"
            :alt="companyName"
            class="h-24 w-auto object-contain"
          />
          <ClayTile v-else name="heart" tone="mint" size="lg" />
          <p class="mt-5 text-sm font-semibold tracking-tight">{{ companyName || 'Tu empresa' }}</p>
          <p class="text-xs text-muted">Protocolos de bienestar del catálogo</p>
        </div>

        <div class="px-5 pt-6 pb-2 sm:px-8">
          <h1 class="font-display mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Bienestar y nutrición
          </h1>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Las recomendaciones usan los productos que tu empresa cargó en el catálogo, no un kit genérico de otra marca.
          </p>
        </div>

        <p v-if="loading" class="px-5 py-6 text-sm text-muted sm:px-8">Cargando protocolos…</p>
        <p v-else-if="!needs.length" class="px-5 py-6 text-sm text-muted sm:px-8">
          Tu empresa aún no cargó necesidades de bienestar. Administración las arma en sasadmin → Bienestar, eligiendo productos de la marca.
        </p>

        <form v-else class="space-y-4 p-5 sm:p-8" @submit.prevent="showRecommendations">
          <SoftField label="Buscar dolencia" hint="Escribe para filtrar o elige en la lista.">
            <input
              v-model="query"
              :class="fieldControlClass"
              type="search"
              placeholder="Ej. diabetes, estrés, próstata…"
            />
          </SoftField>
          <SoftField label="Seleccione una dolencia para ver recomendaciones">
            <select v-model="selectedId" :class="fieldControlClass" required>
              <option value="">— Elija una opción —</option>
              <option v-for="item in options" :key="item.id" :value="item.id">
                {{ item.label }}
              </option>
            </select>
          </SoftField>
          <SoftButton type="submit" variant="yellow" :disabled="!selectedId">
            Ver recomendaciones
          </SoftButton>
        </form>

        <div v-if="isHgw && companyTools.allows('wellness_consult')" class="px-5 pb-6 sm:px-8">
          <RouterLink to="/app/tools/wellness/consulta" class="consult-cta">
            Consulta personal
          </RouterLink>
          <p class="mt-2 text-center text-xs text-muted">Cuestionario de hábitos para una evaluación a medida.</p>
        </div>
      </SoftCard>
    </div>

    <div v-if="protocol" class="mt-4 space-y-4">
      <SoftCard :padded="false" class="overflow-hidden">
        <div class="flex items-start justify-between gap-4 border-b border-line bg-shell px-5 py-5 sm:px-8">
          <div>
            <p class="text-xs tracking-[0.18em] text-muted uppercase">Recomendación {{ companyName || 'empresa' }}</p>
            <h1 class="font-display mt-1 text-3xl font-bold tracking-tight">{{ protocol.label }}</h1>
            <p class="mt-2 max-w-xl text-sm text-muted">{{ protocol.focus }}</p>
          </div>
          <ClayTile name="heart" tone="mint" />
        </div>

        <ol class="divide-y divide-line">
          <li v-for="(product, index) in protocol.products" :key="product.name" class="flex gap-4 px-5 py-4 sm:px-8">
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
        <SoftButton variant="yellow" @click="copyInfo">
          {{ copied ? 'Copiado' : 'Copiar info' }}
        </SoftButton>
        <SoftButton variant="outline" @click="backToSearch">Volver al buscador</SoftButton>
      </div>

      <p class="rounded-card-sm bg-shell px-4 py-3 text-xs leading-relaxed text-muted">
        Esta información usa el catálogo de {{ companyName || 'tu empresa' }}.
        No sustituye el consejo médico profesional. Consulte siempre a su médico antes de iniciar cualquier suplemento.
      </p>
    </div>
  </div>
</template>

<style scoped>
.consult-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 64px;
  border-radius: 999px;
  background: var(--rex-yellow);
  color: var(--rex-on-yellow);
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--rex-yellow) 90%, transparent), 0 12px 28px rgba(0, 0, 0, 0.12);
  animation: consult-pulse 1.8s ease-in-out infinite;
}

.consult-cta:hover {
  transform: translateY(-1px) scale(1.02);
}

@keyframes consult-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 3px rgba(255, 212, 82, 0.9), 0 12px 28px rgba(0, 0, 0, 0.12);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 212, 82, 0.28), 0 16px 32px rgba(0, 0, 0, 0.16);
  }
}
</style>
