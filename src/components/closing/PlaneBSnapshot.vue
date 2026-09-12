<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import SoftCard from '@/components/ui/SoftCard.vue'
import type { MonthlyClosing } from '@/types/mlm'
import { compactNumber, money } from '@/utils/format'

const props = defineProps<{
  closing: Pick<MonthlyClosing, 'company_volume' | 'qualification' | 'rank_progress' | 'organization' | 'store_proxy'>
  compact?: boolean
}>()

const volume = computed(() => props.closing.company_volume)
const qualification = computed(() => props.closing.qualification)
const rank = computed(() => props.closing.rank_progress)

function sourceLabel(source: string | null | undefined): string {
  if (source === 'organization') {
    return 'dato oficial'
  }
  if (source === 'network') {
    return 'Excel de tu red'
  }
  if (source === 'mixed') {
    return 'oficial + tu red'
  }
  return 'conector'
}
</script>

<template>
  <SoftCard>
    <p class="text-xs tracking-[0.16em] uppercase text-muted">Volumen de empresa · plano B</p>
    <template v-if="volume?.available">
      <p class="mt-2 text-sm text-ink">
        {{ closing.organization?.name ?? 'Empresa' }}
        · {{ sourceLabel(volume.source) }}
        <span v-if="volume.unit"> · {{ volume.unit }}</span>
      </p>
      <div class="mt-4 grid gap-4" :class="compact ? 'grid-cols-2' : 'sm:grid-cols-3'">
        <div>
          <p class="text-sm text-muted">Personal</p>
          <p class="mt-1 font-display text-2xl font-bold">
            {{ volume.personal === null ? '—' : compactNumber(volume.personal) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-muted">Grupo</p>
          <p class="mt-1 font-display text-2xl font-bold">
            {{ volume.group === null ? '—' : compactNumber(volume.group) }}
          </p>
        </div>
        <div v-if="!compact">
          <p class="text-sm text-muted">Red importada</p>
          <p class="mt-1 font-display text-2xl font-bold">{{ compactNumber(volume.members) }}</p>
        </div>
      </div>
      <p v-if="qualification?.message" class="mt-3 text-sm text-muted">{{ qualification.message }}</p>
      <template v-if="rank?.official && rank.progress !== null && rank.progress !== undefined">
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-shell">
          <div class="h-full bg-charcoal" :style="{ width: `${Math.min(100, rank.progress)}%` }" />
        </div>
        <p class="mt-1 text-xs text-muted">{{ rank.progress }}% · {{ rank.message }}</p>
      </template>
    </template>
    <p v-else class="mt-2 text-sm text-muted">
      Volumen de empresa no disponible. No se muestra 0.
    </p>
    <p v-if="closing.store_proxy && !compact" class="mt-3 text-xs text-muted">
      Proxy tienda ({{ closing.store_proxy.label }}):
      {{ money(closing.store_proxy.personal) }} directas · {{ money(closing.store_proxy.team) }} equipo
    </p>
    <RouterLink v-if="compact" to="/app/cierre" class="mt-3 inline-block text-sm font-medium hover:underline">
      Abrir cierre de mes →
    </RouterLink>
  </SoftCard>
</template>
