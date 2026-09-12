<script setup lang="ts">
withDefaults(
  defineProps<{
    heightClass?: string
    surface?: 'auto' | 'light' | 'dark'
    tagline?: boolean
  }>(),
  {
    heightClass: 'h-8 sm:h-9',
    surface: 'auto',
    tagline: false,
  },
)
</script>

<template>
  <span class="inline-flex max-w-[18rem] flex-col gap-1 sm:max-w-none sm:flex-row sm:items-center sm:gap-3">
    <span class="inline-flex max-w-[200px] items-center">
      <img
        v-if="surface !== 'dark'"
        src="/logos/claro.png"
        alt="REXmlm"
        class="w-auto object-contain object-left"
        :class="[heightClass, surface === 'auto' ? 'dark:hidden' : '']"
      />
      <img
        v-if="surface !== 'light'"
        src="/logos/oscuro.png"
        alt=""
        class="w-auto object-contain object-left"
        :class="[heightClass, surface === 'auto' ? 'hidden dark:block' : '']"
      />
    </span>
    <span
      v-if="tagline"
      class="font-display text-[15px] font-bold italic leading-[1.15] tracking-tight text-[#FFD452] sm:max-w-[13.5rem] sm:text-base"
    >
      resultados explosivos en tu multinivel
    </span>
  </span>
</template>
