<script setup lang="ts">
import { computed } from 'vue'
import AppIcon, { type IconName } from '@/components/ui/AppIcon.vue'

const props = withDefaults(
  defineProps<{
    title: string
    body?: string
    icon?: IconName
    tone?: 'yellow' | 'charcoal' | 'sky' | 'amber' | 'emerald' | 'violet' | 'rose'
    flush?: boolean
  }>(),
  { tone: 'charcoal', flush: false },
)

const tones = {
  yellow: {
    panel: 'bg-[#fffbeb] border-[#f0e0a8]',
    bar: 'bg-yellow',
    icon: 'bg-yellow text-on-yellow',
  },
  charcoal: {
    panel: 'bg-shell border-line',
    bar: 'bg-charcoal',
    icon: 'bg-charcoal text-on-charcoal',
  },
  sky: {
    panel: 'bg-[#eef6ff] border-[#c5ddf5]',
    bar: 'bg-[#2563eb]',
    icon: 'bg-[#2563eb] text-white',
  },
  amber: {
    panel: 'bg-[#fff4e5] border-[#f3d5a3]',
    bar: 'bg-[#d97706]',
    icon: 'bg-[#d97706] text-white',
  },
  emerald: {
    panel: 'bg-[#ecf8f1] border-[#b7e0c6]',
    bar: 'bg-[#059669]',
    icon: 'bg-[#059669] text-white',
  },
  violet: {
    panel: 'bg-[#f4f0ff] border-[#d4c8f5]',
    bar: 'bg-[#7c3aed]',
    icon: 'bg-[#7c3aed] text-white',
  },
  rose: {
    panel: 'bg-[#fff1f2] border-[#f4c4cb]',
    bar: 'bg-[#e11d48]',
    icon: 'bg-[#e11d48] text-white',
  },
} as const

const look = computed(() => tones[props.tone])
</script>

<template>
  <section class="overflow-hidden rounded-card border" :class="look.panel">
    <div class="flex gap-3 px-5 py-4 sm:px-6">
      <span class="mt-1 h-10 w-1.5 shrink-0 rounded-full" :class="look.bar" />
      <span
        v-if="icon"
        class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full"
        :class="look.icon"
      >
        <AppIcon :name="icon" :size="16" />
      </span>
      <div class="min-w-0">
        <h2 class="font-medium">{{ title }}</h2>
        <p v-if="body" class="mt-1 text-sm text-muted">{{ body }}</p>
      </div>
    </div>
    <div
      class="border-t border-line/70 bg-card/70"
      :class="flush ? '' : 'px-5 py-5 sm:px-6'"
    >
      <slot />
    </div>
  </section>
</template>
