<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import ClayTile from '@/components/ui/ClayTile.vue'
import type { IconName } from '@/components/ui/AppIcon.vue'

defineProps<{
  icon: IconName
  eyebrow?: string
  title: string
  body: string
  actions?: string[]
}>()
</script>

<template>
  <section class="mb-8 overflow-hidden rounded-card border border-line bg-yellow-soft">
    <div class="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-6 md:p-7">
      <ClayTile :name="icon" size="lg" />
      <div class="min-w-0 flex-1">
        <p v-if="eyebrow" class="text-xs tracking-[0.16em] uppercase text-muted">{{ eyebrow }}</p>
        <h1 class="font-display mt-1 text-3xl font-bold tracking-tight md:text-4xl">{{ title }}</h1>
        <p class="mt-2 text-sm leading-relaxed text-ink/85">{{ body }}</p>
        <ul v-if="actions?.length" class="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <li v-for="item in actions" :key="item" class="flex items-start gap-2 text-sm">
            <span class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-charcoal text-on-charcoal">
              <AppIcon name="check" :size="11" />
            </span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
      <div v-if="$slots.default" class="flex shrink-0 flex-wrap items-start gap-2 sm:pt-1">
        <slot />
      </div>
    </div>
  </section>
</template>
