<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import { useToast } from '@/composables/useToast'

const props = defineProps<{
  url: string
  message: string
}>()

const toast = useToast()

const whatsappHref = computed(
  () => `https://wa.me/?text=${encodeURIComponent(props.message)}`,
)
const facebookHref = computed(
  () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`,
)

async function copy(value: string, ok: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(ok, 'Copiado')
  } catch {
    toast.error('No se pudo copiar. Selecciónalo a mano.')
  }
}

async function copyLink(): Promise<void> {
  await copy(props.url, 'El enlace genérico quedó en el portapapeles.')
}

async function shareInstagram(): Promise<void> {
  await copy(props.message, 'Instagram no abre un compartir web. Pega el texto en un mensaje o historia.')
}

async function shareNative(): Promise<void> {
  if (!navigator.share) {
    await copyLink()
    return
  }

  try {
    await navigator.share({ title: 'REXmlm', text: props.message, url: props.url })
  } catch {
    /* el usuario canceló */
  }
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <a
      :href="whatsappHref"
      target="_blank"
      rel="noreferrer"
      class="inline-flex items-center gap-2 rounded-btn bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
    >
      <AppIcon name="whatsapp" :size="16" />
      WhatsApp
    </a>
    <a
      :href="facebookHref"
      target="_blank"
      rel="noreferrer"
      class="inline-flex items-center gap-2 rounded-btn bg-[#1877F2] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
    >
      Facebook
    </a>
    <SoftButton variant="outline" type="button" @click="shareInstagram">Instagram</SoftButton>
    <SoftButton variant="yellow" type="button" @click="copyLink">Copiar enlace</SoftButton>
    <SoftButton variant="ghost" type="button" @click="shareNative">Más opciones</SoftButton>
  </div>
</template>
