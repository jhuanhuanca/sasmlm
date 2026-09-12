<script setup lang="ts">
import { computed } from 'vue'
import { parseBrandHex } from '@/utils/color'
import { fieldControlClass } from '@/utils/ui'

const props = defineProps<{
  label: string
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const picker = computed(() => parseBrandHex(props.modelValue) ?? '#ffffff')

function onText(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onPicker(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onBlur(): void {
  const parsed = parseBrandHex(props.modelValue)
  if (parsed) {
    emit('update:modelValue', parsed)
  }
}
</script>

<template>
  <label class="block text-xs text-muted">
    {{ label }}
    <span class="mt-1 flex items-center gap-2">
      <input
        :value="picker"
        class="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-line bg-card p-0"
        type="color"
        :aria-label="label"
        @input="onPicker"
      />
      <input
        :value="modelValue"
        :class="fieldControlClass"
        class="font-mono uppercase"
        type="text"
        maxlength="7"
        spellcheck="false"
        :placeholder="placeholder ?? '#ffffff'"
        @input="onText"
        @blur="onBlur"
      />
    </span>
  </label>
</template>
