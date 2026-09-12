<script setup lang="ts">
defineProps<{
  label: string
  error?: string
  hint?: string
}>()
</script>

<template>
  <label class="block">
    <span class="mb-1.5 block text-[13px] font-medium text-muted">{{ label }}</span>
    <slot />
    <p v-if="error" class="mt-1.5 text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-muted">{{ hint }}</p>
  </label>
</template>
