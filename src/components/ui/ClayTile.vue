<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/AppIcon.vue'

export type ClayTone =
  | 'yellow'
  | 'orange'
  | 'coral'
  | 'sky'
  | 'royal'
  | 'lavender'
  | 'cream'
  | 'mint'
  | 'ink'

const clayToneFor: Record<IconName, ClayTone> = {
  home: 'yellow',
  users: 'cream',
  user: 'cream',
  mail: 'orange',
  bag: 'coral',
  zap: 'sky',
  heart: 'mint',
  wallet: 'royal',
  calendar: 'lavender',
  clipboard: 'lavender',
  file: 'mint',
  star: 'yellow',
  gear: 'sky',
  bell: 'yellow',
  whatsapp: 'mint',
  play: 'coral',
  alarm: 'orange',
  folder: 'sky',
  search: 'orange',
  chart: 'royal',
  download: 'sky',
  link: 'orange',
  check: 'mint',
  sun: 'yellow',
  moon: 'royal',
  monitor: 'sky',
  keyboard: 'cream',
  pause: 'coral',
  chevron: 'sky',
  menu: 'cream',
  close: 'coral',
  minus: 'orange',
  plus: 'mint',
  expand: 'sky',
}

const props = withDefaults(
  defineProps<{
    name: IconName
    tone?: ClayTone
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const resolvedTone = computed(() => props.tone ?? clayToneFor[props.name])
const glyphSize = computed(() => {
  if (props.size === 'xs') return 13
  if (props.size === 'sm') return 16
  if (props.size === 'lg') return 28
  return 22
})
</script>

<template>
  <span
    class="clay-tile"
    :class="[`is-${resolvedTone}`, `is-${size}`]"
    aria-hidden="true"
  >
    <AppIcon :name="name" :size="glyphSize" />
  </span>
</template>

<style scoped>
.clay-tile {
  position: relative;
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
  color: #fffef8;
  isolation: isolate;
  border-radius: 28%;
  box-shadow:
    inset 0 2px 3px rgba(255, 255, 255, 0.62),
    inset 0 -8px 14px rgba(0, 0, 0, 0.16),
    0 8px 16px -6px rgba(0, 0, 0, 0.28);
}

.clay-tile::before {
  content: '';
  position: absolute;
  inset: 3px 18% auto;
  height: 36%;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), transparent);
  pointer-events: none;
}

.clay-tile :deep(svg) {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.22));
}

.clay-tile :deep(svg [stroke]) {
  stroke-width: 2.15;
}

.clay-tile.is-xs {
  width: 24px;
  height: 24px;
}

.clay-tile.is-sm {
  width: 34px;
  height: 34px;
}

.clay-tile.is-md {
  width: 52px;
  height: 52px;
}

.clay-tile.is-lg {
  width: 64px;
  height: 64px;
}

.clay-tile.is-yellow {
  background: linear-gradient(180deg, #ffe56a 0%, #ffd452 48%, #f0b429 100%);
}

.clay-tile.is-orange {
  background: linear-gradient(180deg, #ffbf6a 0%, #ff9a3c 50%, #e87814 100%);
}

.clay-tile.is-coral {
  background: linear-gradient(180deg, #ff9a8c 0%, #ff6b6b 50%, #e24d5a 100%);
}

.clay-tile.is-sky {
  background: linear-gradient(180deg, #8ee0f6 0%, #5ec8f2 50%, #2aa8d4 100%);
}

.clay-tile.is-royal {
  background: linear-gradient(180deg, #6b94ff 0%, #3b6bff 50%, #254ad6 100%);
}

.clay-tile.is-lavender {
  background: linear-gradient(180deg, #ddd0ff 0%, #c9b6ff 50%, #a78be8 100%);
}

.clay-tile.is-cream {
  color: #5c4634;
  background: linear-gradient(180deg, #fff3d2 0%, #f3e7c3 50%, #e2cc96 100%);
}

.clay-tile.is-mint {
  background: linear-gradient(180deg, #d4f8de 0%, #b8f0c8 50%, #7ed89a 100%);
}

.clay-tile.is-mint :deep(svg) {
  color: #1f6b8a;
}

.clay-tile.is-ink {
  background: linear-gradient(180deg, #4a4a52 0%, #2a2a30 52%, #16161a 100%);
  box-shadow:
    inset 0 2px 3px rgba(255, 255, 255, 0.18),
    inset 0 -8px 14px rgba(0, 0, 0, 0.4),
    0 8px 16px -6px rgba(0, 0, 0, 0.35);
}
</style>
