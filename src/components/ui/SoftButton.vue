<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'charcoal' | 'yellow' | 'ghost' | 'outline'
    type?: 'button' | 'submit'
    disabled?: boolean
    block?: boolean
  }>(),
  {
    variant: 'charcoal',
    type: 'button',
    disabled: false,
    block: false,
  },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-btn px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      block ? 'w-full' : '',
      variant === 'charcoal' ? 'bg-charcoal text-on-charcoal hover:opacity-90' : '',
      variant === 'yellow' ? 'bg-yellow text-on-yellow hover:bg-yellow-soft' : '',
      variant === 'ghost' ? 'bg-transparent text-ink hover:bg-white/60' : '',
      variant === 'outline' ? 'border border-line bg-card text-ink hover:border-gray-mid' : '',
    ]"
  >
    <slot />
  </button>
</template>
