<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { fetchRegistrationOptions } from '@/api/auth'
import { addSecondaryCompany, switchActiveCompany } from '@/api/companies'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftField from '@/components/ui/SoftField.vue'
import { useAuthStore } from '@/stores/auth'
import { useDinoTourStore } from '@/stores/dinoTour'
import { useToast } from '@/composables/useToast'
import type { CatalogCompanyOption } from '@/types/auth'
import { errorMessage } from '@/utils/http'
import { fieldControlClass } from '@/utils/ui'

const props = defineProps<{
  label?: string
}>()

const emit = defineEmits<{
  changed: []
}>()

const auth = useAuthStore()
const tour = useDinoTourStore()
const toast = useToast()
const adding = ref(false)
const saving = ref(false)
const companies = ref<CatalogCompanyOption[]>([])
const pickId = ref(0)
const pickRankId = ref(0)

const memberships = computed(() => auth.user?.companies ?? [])
const activeId = computed(
  () => auth.user?.active_catalog_company_id || auth.user?.catalog_company_id || 0,
)
const price = computed(() => Number(auth.user?.secondary_company_price ?? 9.9))
const currency = computed(() => auth.user?.secondary_company_currency || 'USD')
const available = computed(() => {
  const owned = new Set(memberships.value.map((row) => row.catalog_company_id))
  return companies.value.filter((row) => !owned.has(row.id))
})
const pickCompany = computed(() => available.value.find((row) => row.id === pickId.value) ?? null)
const visible = computed(() => Boolean(auth.isLeader || auth.isAdmin) && memberships.value.length > 0)

async function onSwitch(event: Event): Promise<void> {
  const id = Number((event.target as HTMLSelectElement).value)
  if (!id || id === activeId.value) {
    return
  }
  saving.value = true
  try {
    auth.setUser(await switchActiveCompany(id))
    emit('changed')
  } catch (error) {
    toast.fromError(error, 'No se pudo cambiar de empresa')
  } finally {
    saving.value = false
  }
}

async function submitAdd(): Promise<void> {
  if (!pickId.value) {
    return
  }
  saving.value = true
  try {
    const rank = pickCompany.value?.ranks.find((item) => item.id === pickRankId.value)
    auth.setUser(
      await addSecondaryCompany({
        catalog_company_id: pickId.value,
        catalog_rank_id: rank?.id,
        catalog_rank_name: rank?.name,
      }),
    )
    adding.value = false
    pickId.value = 0
    pickRankId.value = 0
    toast.success(
      `Si Paddle está activo te pedirá pagar ${price.value.toFixed(2)} ${currency.value}. En local sin Paddle la empresa queda registrada igual.`,
      'Empresa añadida',
    )
    emit('changed')
  } catch (error) {
    toast.fromError(error, errorMessage(error, 'No se pudo añadir la empresa'))
  } finally {
    saving.value = false
  }
}

watch(
  () => tour.current?.reveal,
  (reveal) => {
    if (reveal === 'add-company') {
      adding.value = true
    }
  },
)

onMounted(async () => {
  try {
    companies.value = (await fetchRegistrationOptions()).companies
  } catch {
    companies.value = []
  }
})
</script>

<template>
  <div v-if="visible" class="mb-4 rounded-card border border-line bg-card px-4 py-3" data-tour="company-scope">
    <div class="flex flex-wrap items-end gap-3">
      <label class="min-w-[180px] flex-1">
        <span class="mb-1.5 block text-[13px] font-medium text-muted">{{ label || 'Empresa activa' }}</span>
        <select
          :value="activeId"
          :class="fieldControlClass"
          :disabled="saving"
          @change="onSwitch"
        >
          <option
            v-for="row in memberships"
            :key="row.catalog_company_id"
            :value="row.catalog_company_id"
          >
            {{ row.catalog_company_name || `Empresa ${row.catalog_company_id}` }}
            {{ row.is_primary ? '(principal)' : '' }}
          </option>
        </select>
      </label>
      <SoftButton v-if="!adding" variant="outline" type="button" @click="adding = true">
        Añadir empresa
      </SoftButton>
    </div>
    <p class="mt-2 text-xs text-muted">
      La del alta es gratis. Cada secundaria cuesta {{ price.toFixed(2) }} {{ currency }} extra. Tienda pública y landing no cambian.
    </p>

    <div v-if="adding" class="mt-3 grid gap-3 border-t border-line pt-3 md:grid-cols-3">
      <SoftField label="Empresa secundaria">
        <select v-model.number="pickId" :class="fieldControlClass">
          <option :value="0">Elige…</option>
          <option v-for="row in available" :key="row.id" :value="row.id">{{ row.name }}</option>
        </select>
      </SoftField>
      <SoftField label="Rango (opcional)">
        <select v-model.number="pickRankId" :class="fieldControlClass" :disabled="!pickCompany">
          <option :value="0">Sin rango</option>
          <option v-for="rank in pickCompany?.ranks ?? []" :key="rank.id" :value="rank.id">{{ rank.name }}</option>
        </select>
      </SoftField>
      <div class="flex items-end gap-2">
        <SoftButton type="button" :disabled="saving || !pickId" @click="submitAdd">Confirmar y cobrar</SoftButton>
        <SoftButton variant="ghost" type="button" @click="adding = false">Cancelar</SoftButton>
      </div>
    </div>
  </div>
</template>
