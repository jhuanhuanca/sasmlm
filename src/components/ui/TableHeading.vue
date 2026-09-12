<script setup lang="ts">
import ClayTile from '@/components/ui/ClayTile.vue'
import type { IconName } from '@/components/ui/AppIcon.vue'

defineProps<{
  icon: IconName
  label: string
}>()
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <ClayTile :name="icon" size="xs" />
    {{ label }}
  </span>
</template>
