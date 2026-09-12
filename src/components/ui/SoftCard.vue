<script setup lang="ts">
defineProps<{
  padded?: boolean
  dark?: boolean
}>()
</script>

<template>
  <section
    class="soft-shadow box-border rounded-card"
    :class="dark ? 'bg-charcoal text-on-charcoal' : 'bg-card'"
    :style="padded === false ? undefined : { padding: '24px 28px' }"
  >
    <slot />
  </section>
</template>
