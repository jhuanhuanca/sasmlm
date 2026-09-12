<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppToastHost from '@/components/ui/AppToastHost.vue'
import { useThemeStore } from '@/stores/theme'

useThemeStore()
</script>

<template>
  <RouterView />
  <AppToastHost />
</template>
