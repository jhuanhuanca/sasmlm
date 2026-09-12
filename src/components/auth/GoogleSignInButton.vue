<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { loadGoogleIdentity } from '@/composables/loadGoogleIdentity'

const props = defineProps<{
  clientId: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  credential: [idToken: string]
}>()

const host = ref<HTMLDivElement | null>(null)

function renderButton(): void {
  if (!host.value || !props.clientId || !window.google?.accounts?.id) {
    return
  }

  host.value.innerHTML = ''
  window.google.accounts.id.initialize({
    client_id: props.clientId,
    callback: (response) => {
      if (props.disabled || !response.credential) {
        return
      }
      emit('credential', response.credential)
    },
  })
  window.google.accounts.id.renderButton(host.value, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    locale: 'es',
    width: host.value.clientWidth || 320,
  })
}

onMounted(async () => {
  try {
    await loadGoogleIdentity()
    renderButton()
  } catch {
    // El formulario con correo sigue disponible.
  }
})

watch(
  () => [props.clientId, props.disabled],
  () => renderButton(),
)
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
      <span class="h-px flex-1 bg-line" />
      o continúa con
      <span class="h-px flex-1 bg-line" />
    </div>
    <div class="relative">
      <div ref="host" class="flex min-h-10 justify-center overflow-hidden rounded-xl" />
      <div
        v-if="disabled"
        class="absolute inset-0 cursor-not-allowed rounded-xl bg-card/70"
        title="Completa país, empresa y rango antes de usar Google"
      />
    </div>
  </div>
</template>
