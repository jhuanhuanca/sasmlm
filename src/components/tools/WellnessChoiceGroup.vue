<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import type { ConsultChoice } from '@/data/wellnessConsult'

const props = defineProps<{
  type: 'checkbox' | 'radio'
  name: string
  options: ConsultChoice[]
  modelValue: string | string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

function isChecked(value: string): boolean {
  if (props.type === 'radio') {
    return props.modelValue === value
  }

  return Array.isArray(props.modelValue) && props.modelValue.includes(value)
}

function onChange(value: string): void {
  if (props.type === 'radio') {
    emit('update:modelValue', value)
    return
  }

  const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const index = current.indexOf(value)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(value)
  }

  emit('update:modelValue', current)
}
</script>

<template>
  <div class="grid gap-2 sm:grid-cols-2">
    <label
      v-for="option in options"
      :key="`${name}-${option.value}`"
      class="flex cursor-pointer items-start gap-2 rounded-btn border border-line bg-card px-3 py-2.5 text-sm"
      :class="isChecked(option.value) ? 'border-charcoal bg-yellow-soft' : ''"
    >
      <input
        :type="type"
        :name="name"
        :value="option.value"
        :checked="isChecked(option.value)"
        class="mt-0.5"
        @change="onChange(option.value)"
      />
      <AppIcon v-if="option.icon" :name="option.icon" :size="16" class="mt-0.5 shrink-0 text-muted" />
      <span>{{ option.label }}</span>
    </label>
  </div>
</template>
