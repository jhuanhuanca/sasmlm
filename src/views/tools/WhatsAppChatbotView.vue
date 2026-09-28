<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { createSupportTicket } from '@/api/support'
import AppIcon from '@/components/ui/AppIcon.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import { useCompanyToolGate } from '@/composables/useCompanyToolGate'
import { useToast } from '@/composables/useToast'
import { WHATSAPP_CHATBOT_LOGIN_URL, WHATSAPP_CHATBOT_REGISTER_URL } from '@/data/companyTools'
import { errorMessage } from '@/utils/http'

useCompanyToolGate('whatsapp_chatbot')

const router = useRouter()
const toast = useToast()
const helping = ref(false)

function openUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}

async function requestSetupHelp(): Promise<void> {
  helping.value = true
  try {
    const ticket = await createSupportTicket({
      subject: 'Ayuda para configurar el chatbot de WhatsApp',
      message:
        'Pedí ayuda desde la herramienta Chatbot WhatsApp. Necesito que me ayuden a configurar Vendedor Live (cuenta, API de IA y WhatsApp Cloud API).',
    })
    toast.success('Soporte va a ayudarte a configurarlo. El ticket quedó abierto.', 'Ticket creado')
    await router.push({ name: 'support', query: { ticket: String(ticket.id) } })
  } catch (error) {
    toast.fromError(error, errorMessage(error, 'No se pudo crear el ticket. Inténtalo de nuevo o ve a Soporte.'))
  } finally {
    helping.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <RouterLink to="/app/tools" class="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
      <span class="rotate-180"><AppIcon name="chevron" :size="14" /></span>
      Herramientas
    </RouterLink>

    <ModuleBanner
      class="mt-4"
      icon="whatsapp"
      eyebrow="Plan Premium"
      title="Chatbot WhatsApp"
      body="Vendedor Live. Entrá si ya tenés cuenta, configurá una nueva, o pedí ayuda a soporte si no sabés cómo conectarlo."
    />

    <SoftCard class="mt-5">
      <div class="grid gap-3">
        <SoftButton variant="yellow" block type="button" @click="openUrl(WHATSAPP_CHATBOT_LOGIN_URL)">
          Ingresar
        </SoftButton>
        <p class="text-center text-xs text-muted">Si ya tenés usuario en Vendedor Live. Se abre en otra ventana.</p>

        <SoftButton variant="charcoal" block type="button" @click="openUrl(WHATSAPP_CHATBOT_REGISTER_URL)">
          Configurar
        </SoftButton>
        <p class="text-center text-xs text-muted">Crear empresa y conectar la API. Se abre en otra ventana.</p>

        <SoftButton variant="outline" block type="button" :disabled="helping" @click="requestSetupHelp">
          {{ helping ? 'Enviando a soporte…' : 'Pedir ayuda a soporte' }}
        </SoftButton>
        <p class="text-center text-xs text-muted">Abre un ticket para que te configuremos la cuenta, la IA y WhatsApp.</p>
      </div>
    </SoftCard>
  </div>
</template>
