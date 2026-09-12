<script setup lang="ts">
import { ref } from 'vue'
import SoftField from '@/components/ui/SoftField.vue'
import { authFieldControlClass } from '@/utils/ui'

defineProps<{
  label: string
  error?: string
  hint?: string
  autocomplete?: string
}>()

const model = defineModel<string>({ required: true })
const visible = ref(false)
</script>

<template>
  <SoftField :label="label" :error="error" :hint="hint">
    <div class="relative">
      <input
        v-model="model"
        :class="`${authFieldControlClass} pr-12`"
        :type="visible ? 'text' : 'password'"
        :autocomplete="autocomplete"
        required
      />
      <button
        type="button"
        class="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition hover:text-ink"
        :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        @click="visible = !visible"
      >
        <svg v-if="visible" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 3l18 18M10.6 10.6A2.5 2.5 0 0 0 12 14.5M9.9 5.5A10.8 10.8 0 0 1 12 5.2c5.2 0 9.3 3.5 10.8 6.8a11.4 11.4 0 0 1-4.1 4.6M6.1 6.1A11.3 11.3 0 0 0 1.2 12C2.7 15.3 6.8 18.8 12 18.8c1.4 0 2.7-.2 3.9-.7"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7" />
        </svg>
      </button>
    </div>
  </SoftField>
</template>
