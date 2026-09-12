<script setup lang="ts">
defineProps<{
  name: string
  image?: string | null
  qty?: number
  compact?: boolean
}>()
</script>

<template>
  <div class="shop-gift" :class="{ 'is-compact': compact }" aria-label="Incluye incentivo de regalo">
    <span class="shop-gift-ribbon">
      <span aria-hidden="true">🎁</span>
      De regalo
    </span>
    <div class="shop-gift-card">
      <img v-if="image" :src="image" :alt="name" />
      <p v-else class="shop-gift-name">{{ name }}</p>
      <span v-if="(qty ?? 1) > 1" class="shop-gift-qty">×{{ qty }}</span>
    </div>
  </div>
</template>
