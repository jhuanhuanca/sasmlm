<script setup lang="ts">
defineProps<{
  label: string
  percent: number
  tone?: 'charcoal' | 'yellow' | 'striped' | 'outline'
}>()
</script>

<template>
  <div
    class="flex min-w-[9.5rem] flex-1 items-center justify-between gap-3 rounded-full px-3 py-2 text-[12px] sm:min-w-[132px] sm:flex-none sm:gap-4 sm:px-4 sm:text-[13px]"
    :class="{
      'bg-charcoal text-on-charcoal': tone === 'charcoal',
      'bg-yellow text-on-yellow': tone === 'yellow',
      'striped-fill text-ink': tone === 'striped',
      'border border-line bg-transparent text-muted': tone === 'outline' || !tone,
    }"
  >
    <span class="font-medium">{{ label }}</span>
    <span class="tabular-nums">{{ Math.round(percent) }}%</span>
  </div>
</template>
