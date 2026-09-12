<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import SoftCard from '@/components/ui/SoftCard.vue'
import type { PeriodGoalItem } from '@/types/mlm'
import { compactNumber, money } from '@/utils/format'

const props = defineProps<{
  items: PeriodGoalItem[]
}>()

const set = computed(() => props.items.filter((item) => item.target !== null))
const planeA = computed(() => set.value.filter((item) => item.plane === 'a'))
const planeB = computed(() => set.value.filter((item) => item.plane === 'b'))

function formatValue(item: PeriodGoalItem, value: number | null): string {
  if (value === null) {
    return '—'
  }
  if (item.unit === 'USD') {
    return money(value)
  }
  return compactNumber(value)
}
</script>

<template>
  <SoftCard>
    <p class="text-xs tracking-[0.16em] uppercase text-muted">Metas del mes</p>
    <p v-if="!set.length" class="mt-2 text-sm text-muted">
      Aún no hay metas numéricas. Defínelas en el cierre: ventas de tienda y volumen de empresa van aparte.
    </p>
    <div v-else class="mt-4 space-y-4">
      <div v-if="planeA.length">
        <p class="text-xs text-muted">Plano A</p>
        <ul class="mt-2 space-y-3">
          <li v-for="item in planeA" :key="item.metric">
            <div class="flex items-baseline justify-between gap-2 text-sm">
              <span>{{ item.label }}</span>
              <span class="tabular-nums text-muted">{{ formatValue(item, item.actual) }} / {{ formatValue(item, item.target) }}</span>
            </div>
            <div class="mt-1 h-2 overflow-hidden rounded-full bg-shell">
              <div class="h-full bg-charcoal" :style="{ width: `${item.progress === null ? 8 : Math.min(100, item.progress)}%` }" />
            </div>
          </li>
        </ul>
      </div>
      <div v-if="planeB.length">
        <p class="text-xs text-muted">Plano B · no se mezcla con ventas</p>
        <ul class="mt-2 space-y-3">
          <li v-for="item in planeB" :key="item.metric">
            <div class="flex items-baseline justify-between gap-2 text-sm">
              <span>{{ item.label }}</span>
              <span class="tabular-nums text-muted">
                <template v-if="item.status === 'unavailable' || item.actual === null">no disponible</template>
                <template v-else>{{ formatValue(item, item.actual) }} / {{ formatValue(item, item.target) }}</template>
              </span>
            </div>
            <div class="mt-1 h-2 overflow-hidden rounded-full bg-shell">
              <div
                class="h-full"
                :class="item.status === 'unavailable' ? 'bg-line' : 'bg-yellow'"
                :style="{ width: `${item.progress === null ? 8 : Math.min(100, item.progress)}%` }"
              />
            </div>
          </li>
        </ul>
      </div>
    </div>
    <RouterLink to="/app/cierre" class="mt-3 inline-block text-sm font-medium hover:underline">
      Editar en el cierre →
    </RouterLink>
  </SoftCard>
</template>
