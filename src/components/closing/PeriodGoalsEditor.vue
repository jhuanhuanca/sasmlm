<script setup lang="ts">
import { computed } from 'vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import SoftField from '@/components/ui/SoftField.vue'
import type { PeriodGoalItem } from '@/types/mlm'
import { compactNumber, money } from '@/utils/format'
import { fieldControlClass } from '@/utils/ui'

const props = withDefaults(
  defineProps<{
    title: string
    hint?: string
    items: PeriodGoalItem[]
    editable?: boolean
    saving?: boolean
    showProgress?: boolean
  }>(),
  {
    editable: false,
    saving: false,
    showProgress: true,
  },
)

const emit = defineEmits<{
  'update:items': [PeriodGoalItem[]]
  save: []
}>()

const planeA = computed(() => props.items.filter((item) => item.plane === 'a'))
const planeB = computed(() => props.items.filter((item) => item.plane === 'b'))

function formatActual(item: PeriodGoalItem): string {
  if (item.status === 'unavailable' || item.actual === null) {
    return '—'
  }
  if (item.unit === 'USD') {
    return money(item.actual)
  }
  return compactNumber(item.actual)
}

function formatTarget(item: PeriodGoalItem): string {
  if (item.target === null) {
    return 'sin meta'
  }
  if (item.unit === 'USD') {
    return money(item.target)
  }
  return compactNumber(item.target)
}

function statusLabel(item: PeriodGoalItem): string {
  if (item.status === 'unavailable') {
    return 'no disponible'
  }
  if (item.status === 'met') {
    return 'cumplida'
  }
  if (item.status === 'open' && item.progress !== null) {
    return `${item.progress}%`
  }
  if (item.status === 'planned') {
    return 'definida'
  }
  return 'sin meta'
}

function onTarget(metric: string, raw: string): void {
  let target: number | null = null
  if (raw !== '') {
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) {
      return
    }
    target = parsed
  }

  emit(
    'update:items',
    props.items.map((item) => (item.metric === metric ? { ...item, target } : item)),
  )
}
</script>

<template>
  <SoftCard>
    <p class="text-xs tracking-[0.16em] uppercase text-muted">{{ title }}</p>
    <p v-if="hint" class="mt-2 text-sm text-muted">{{ hint }}</p>

    <div class="mt-5 grid gap-6 md:grid-cols-2">
      <div>
        <p class="text-sm font-medium">Plano A · plataforma</p>
        <ul class="mt-3 space-y-4">
          <li v-for="item in planeA" :key="item.metric">
            <SoftField :label="item.label" :hint="item.hint">
              <input
                v-if="editable"
                :class="fieldControlClass"
                type="number"
                min="0"
                step="any"
                :value="item.target ?? ''"
                :placeholder="'Meta en ' + (item.unit === 'count' ? 'unidades' : item.unit)"
                @input="onTarget(item.metric, ($event.target as HTMLInputElement).value)"
              />
              <p v-else class="text-lg font-semibold">{{ formatTarget(item) }}</p>
            </SoftField>
            <template v-if="showProgress">
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-shell">
                <div
                  class="h-full"
                  :class="item.status === 'unavailable' || item.progress === null ? 'bg-line' : 'bg-charcoal'"
                  :style="{ width: `${item.progress === null ? 8 : Math.min(100, item.progress)}%` }"
                />
              </div>
              <p class="mt-1 text-xs text-muted">
                Avance: {{ formatActual(item) }}
                <span v-if="item.target !== null"> / {{ formatTarget(item) }}</span>
                · {{ statusLabel(item) }}
              </p>
            </template>
          </li>
        </ul>
      </div>

      <div>
        <p class="text-sm font-medium">Plano B · empresa</p>
        <ul class="mt-3 space-y-4">
          <li v-for="item in planeB" :key="item.metric">
            <SoftField :label="item.label" :hint="item.hint">
              <input
                v-if="editable"
                :class="fieldControlClass"
                type="number"
                min="0"
                step="any"
                :value="item.target ?? ''"
                :placeholder="item.unit === 'volume' ? 'PV / puntos' : item.unit"
                @input="onTarget(item.metric, ($event.target as HTMLInputElement).value)"
              />
              <p v-else class="text-lg font-semibold">{{ formatTarget(item) }}</p>
            </SoftField>
            <template v-if="showProgress">
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-shell">
                <div
                  class="h-full"
                  :class="item.status === 'unavailable' || item.progress === null ? 'bg-line' : 'bg-yellow'"
                  :style="{ width: `${item.progress === null ? 8 : Math.min(100, item.progress)}%` }"
                />
              </div>
              <p class="mt-1 text-xs text-muted">
                Avance:
                <template v-if="item.status === 'unavailable' || item.actual === null">no disponible (no es 0)</template>
                <template v-else>{{ formatActual(item) }} / {{ formatTarget(item) }} · {{ statusLabel(item) }}</template>
              </p>
            </template>
          </li>
        </ul>
      </div>
    </div>

    <SoftButton v-if="editable" class="mt-6" type="button" :disabled="saving" @click="emit('save')">
      {{ saving ? 'Guardando…' : 'Guardar metas' }}
    </SoftButton>
  </SoftCard>
</template>
