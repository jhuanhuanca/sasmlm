<script setup lang="ts">
import { computed } from 'vue'
import { initials } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    name?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const letters = computed(() => initials(props.name))
</script>

<template>
  <div
    class="inline-flex items-center justify-center overflow-hidden rounded-full bg-yellow-soft font-medium text-ink"
    :class="{
      'h-9 w-9 text-xs': size === 'sm',
      'h-11 w-11 text-sm': size === 'md',
      'h-16 w-16 text-lg': size === 'lg',
    }"
  >
    {{ letters }}
  </div>
</template>
