<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { createInvitation } from '@/api/invitations'
import ShareInviteBar from '@/components/invitations/ShareInviteBar.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import SoftField from '@/components/ui/SoftField.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import { REFERRAL_SUBSCRIPTION_COMMISSION_PERCENT } from '@/data/referral'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import type { InvitationCreated } from '@/types/mlm'
import { errorMessage, fieldErrors } from '@/utils/http'
import { fieldControlClass } from '@/utils/ui'

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const email = ref('')
const loading = ref(false)
const errors = ref<Record<string, string[]>>({})
const message = ref('')
const created = ref<InvitationCreated | null>(null)
const toast = useToast()

const inviteLink = computed(() => {
  if (!created.value) {
    return ''
  }

  return `${window.location.origin}/register?token=${created.value.token}`
})

const shareUrl = computed(() => {
  const id = user.value?.id
  if (!id) {
    return ''
  }

  return `${window.location.origin}/register?ref=${id}`
})

const shareMessage = computed(() => {
  const name = user.value?.name ?? 'Un líder'
  return `${name} te invita a REXmlm. Entra a su red con este enlace: ${shareUrl.value}`
})

async function submit(): Promise<void> {
  loading.value = true
  errors.value = {}
  message.value = ''
  created.value = null

  try {
    created.value = await createInvitation(email.value)
    const sentTo = created.value.email
    toast.success(
      created.value.resent
        ? `Reenviamos el correo a ${sentTo}. También puedes copiar el enlace.`
        : `Enviamos un correo a ${sentTo}. También puedes copiar el enlace.`,
      created.value.resent ? 'Invitación reenviada' : 'Invitación enviada',
    )
  } catch (error) {
    errors.value = fieldErrors(error)
    message.value = errorMessage(error, 'No se pudo enviar la invitación')
    toast.fromError(error, 'No se pudo enviar la invitación')
  } finally {
    loading.value = false
  }
}

async function copyLink(): Promise<void> {
  if (!inviteLink.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(inviteLink.value)
    toast.success('El enlace quedó en el portapapeles.', 'Enlace copiado')
  } catch {
    toast.error('No se pudo copiar. Selecciónalo a mano.')
  }
}
</script>

<template>
  <div>
    <div data-tour="invite-welcome">
    <ModuleBanner
      icon="mail"
      eyebrow="Líder"
      title="Invitaciones"
      body="Invita por correo o comparte un enlace genérico si no tienes el email. Quien se registre con tu enlace entra a tu red como socio. Si más adelante paga el plan de lista, ganas la comisión de referido."
      :actions="[
        'Si conoces el correo: envía la invitación y le llega el email.',
        'Si no lo conoces: comparte el enlace genérico por WhatsApp, Facebook o Instagram.',
        'Cuando acepte, lo verás en Equipo. Si se hace líder, ganas el ' + REFERRAL_SUBSCRIPTION_COMMISSION_PERCENT + ' %.',
      ]"
    />
    </div>

    <SoftCard v-if="shareUrl" class="mb-5" data-tour="invite-share">
      <h2 class="font-medium">Enlace para compartir</h2>
      <p class="mt-2 text-sm text-muted">
        Úsalo con personas cuyo correo no tienes. No caduca: cada alta queda en tu red.
      </p>
      <p class="mt-3 break-all rounded-input bg-shell px-4 py-3 text-sm">{{ shareUrl }}</p>
      <ShareInviteBar class="mt-4" :url="shareUrl" :message="shareMessage" />
    </SoftCard>

    <div class="grid gap-5 lg:grid-cols-2">
      <SoftCard data-tour="invite-form">
        <h2 class="font-medium">Invitar a un socio</h2>
        <form class="mt-4 space-y-4" @submit.prevent="submit">
          <p v-if="message" class="text-sm text-red-600">{{ message }}</p>
          <SoftField label="Correo del socio" :error="errors.email?.[0]">
            <input v-model="email" :class="fieldControlClass" type="email" required />
          </SoftField>
          <SoftButton type="submit" :disabled="loading">Enviar invitación</SoftButton>
        </form>
      </SoftCard>

      <SoftCard v-if="created" data-tour="invite-after">
        <h2 class="font-medium">Correo enviado</h2>
        <p class="mt-2 text-sm text-muted">
          Mandamos la invitación a <span class="font-medium text-ink">{{ created.email }}</span>.
          Si no llega, vuelve a enviar el mismo correo. Este enlace es un respaldo.
        </p>
        <p class="mt-3 break-all rounded-input bg-shell px-4 py-3 text-sm">{{ inviteLink }}</p>
        <div class="mt-4">
          <SoftButton variant="yellow" @click="copyLink">Copiar enlace</SoftButton>
        </div>
      </SoftCard>
      <SoftCard v-else data-tour="invite-after">
        <h2 class="font-medium">Qué pasa después</h2>
        <ul class="mt-4 space-y-3 text-sm">
          <li class="flex gap-2">
            <span class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-yellow text-[10px] font-semibold text-on-yellow">1</span>
            El socio abre el correo, el enlace de respaldo o tu enlace genérico.
          </li>
          <li class="flex gap-2">
            <span class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-yellow text-[10px] font-semibold text-on-yellow">2</span>
            Se registra y entra a tu red. Lo ves en Equipo.
          </li>
          <li class="flex gap-2">
            <span class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-yellow text-[10px] font-semibold text-on-yellow">3</span>
            En la ficha CRM le das seguimiento. Si se suscribe como líder, ganas el
            {{ REFERRAL_SUBSCRIPTION_COMMISSION_PERCENT }}&nbsp;%.
          </li>
        </ul>
      </SoftCard>
    </div>
  </div>
</template>
