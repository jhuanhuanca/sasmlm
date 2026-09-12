<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import ClayTile from '@/components/ui/ClayTile.vue'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<template>
  <div class="pointer-events-none fixed top-4 right-4 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
    <article
      v-for="item in toast.list"
      :key="item.id"
      class="pointer-events-auto flex gap-3 rounded-card border bg-card px-4 py-3 shadow-lg"
      :class="
        item.kind === 'success'
          ? 'border-line'
          : item.kind === 'error'
            ? 'border-red-200'
            : 'border-line'
      "
      role="status"
    >
      <ClayTile
        :name="item.kind === 'error' ? 'alarm' : item.kind === 'success' ? 'check' : 'bell'"
        :tone="item.kind === 'error' ? 'coral' : item.kind === 'success' ? 'mint' : 'yellow'"
        size="sm"
      />
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium">{{ item.title }}</p>
        <p class="mt-0.5 text-sm text-muted">{{ item.message }}</p>
      </div>
      <button type="button" class="text-muted" aria-label="Cerrar aviso" @click="toast.dismiss(item.id)">
        <AppIcon name="close" :size="14" />
      </button>
    </article>
  </div>
</template>
