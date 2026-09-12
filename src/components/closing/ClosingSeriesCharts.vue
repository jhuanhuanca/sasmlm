<script setup lang="ts">
import { computed } from 'vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import type { ClosingSeriesPoint } from '@/types/mlm'
import { compactNumber, money } from '@/utils/format'

const props = defineProps<{
  series: ClosingSeriesPoint[]
}>()

const planeAMax = computed(() =>
  Math.max(1, ...props.series.flatMap((point) => [point.sales, point.commissions])),
)

const planeBValues = computed(() =>
  props.series.flatMap((point) => [point.personal, point.group]).filter((value): value is number => value !== null),
)

const planeBAvailable = computed(() => planeBValues.value.length > 0)

const planeBMax = computed(() => Math.max(1, ...planeBValues.value, 0))

const unit = computed(() => props.series.find((point) => point.unit)?.unit ?? 'PV')

function height(value: number | null, max: number): number {
  if (value === null || max <= 0) {
    return 8
  }
  return Math.max(8, Math.round((value / max) * 112))
}
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <SoftCard>
      <p class="text-xs tracking-[0.16em] uppercase text-muted">Plano A · tienda y comisión SaaS</p>
      <p class="mt-1 text-sm text-ink">Dinero de plataforma. No es PV.</p>
      <div class="mt-5 flex h-36 items-end justify-between gap-2">
        <div v-for="point in series" :key="'a-' + point.month" class="flex flex-1 items-end justify-center gap-0.5">
          <div
            class="w-1/2 max-w-3 rounded-full bg-charcoal"
            :style="{ height: `${height(point.sales, planeAMax)}px` }"
            :title="`Ventas ${money(point.sales)}`"
          />
          <div
            class="w-1/2 max-w-3 rounded-full bg-yellow"
            :style="{ height: `${height(point.commissions, planeAMax)}px` }"
            :title="`Comisión SaaS ${money(point.commissions)}`"
          />
        </div>
      </div>
      <div class="mt-3 grid grid-cols-6 gap-1 text-center text-[10px] text-muted sm:text-xs">
        <span v-for="point in series" :key="'al-' + point.month">{{ point.label }}</span>
      </div>
      <p class="mt-3 text-xs text-muted">
        <span class="inline-block h-2 w-2 rounded-full bg-charcoal" /> ventas tienda
        <span class="ml-3 inline-block h-2 w-2 rounded-full bg-yellow" /> comisión SaaS
      </p>
    </SoftCard>

    <SoftCard>
      <p class="text-xs tracking-[0.16em] uppercase text-muted">Plano B · volumen de empresa</p>
      <template v-if="planeBAvailable">
        <p class="mt-1 text-sm text-ink">Unidad {{ unit }}. No se mezcla con las ventas de tienda.</p>
        <div class="mt-5 flex h-36 items-end justify-between gap-2">
          <div v-for="point in series" :key="'b-' + point.month" class="flex flex-1 items-end justify-center gap-0.5">
            <div
              class="w-1/2 max-w-3 rounded-full bg-charcoal"
              :class="point.personal === null ? 'opacity-20' : ''"
              :style="{ height: `${height(point.personal, planeBMax)}px` }"
              :title="point.personal === null ? 'Volumen personal no disponible' : `${compactNumber(point.personal)} ${unit}`"
            />
            <div
              class="w-1/2 max-w-3 rounded-full bg-yellow"
              :class="point.group === null ? 'opacity-20' : ''"
              :style="{ height: `${height(point.group, planeBMax)}px` }"
              :title="point.group === null ? 'Volumen de grupo no disponible' : `${compactNumber(point.group)} ${unit}`"
            />
          </div>
        </div>
        <div class="mt-3 grid grid-cols-6 gap-1 text-center text-[10px] text-muted sm:text-xs">
          <span v-for="point in series" :key="'bl-' + point.month">{{ point.label }}</span>
        </div>
        <p class="mt-3 text-xs text-muted">
          <span class="inline-block h-2 w-2 rounded-full bg-charcoal" /> personal
          <span class="ml-3 inline-block h-2 w-2 rounded-full bg-yellow" /> grupo
          <span class="ml-3 opacity-50">barra clara = sin dato, no es cero</span>
        </p>
      </template>
      <p v-else class="mt-4 text-sm text-muted">
        Volumen de empresa no disponible. No se grafica un 0 fingido.
      </p>
    </SoftCard>
  </div>
</template>
