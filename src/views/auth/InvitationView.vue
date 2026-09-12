<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchInvitation } from '@/api/invitations'
import SoftButton from '@/components/ui/SoftButton.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import type { Invitation } from '@/types/mlm'
import { errorMessage } from '@/utils/http'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const invitation = ref<Invitation | null>(null)
const message = ref('')
const loading = ref(true)

const token = String(route.params.token ?? '')

onMounted(async () => {
  try {
    invitation.value = await fetchInvitation(token)
  } catch (error) {
    message.value = errorMessage(error, 'La invitación no es válida o ya expiró.')
  } finally {
    loading.value = false
  }
})

function continueRegister(): void {
  void router.push({ name: 'register', query: { token } })
}
</script>

<template>
  <AuthLayout
    kicker="Invitación"
    title="Te están esperando"
    :subtitle="invitation ? `${invitation.leader?.name ?? 'Un líder'} te invita a unirte a REXmlm.` : 'Validando el enlace de invitación…'"
  >
    <p v-if="loading" class="text-sm text-muted">Revisando invitación…</p>
    <p
      v-else-if="message"
      class="rounded-input border border-yellow/40 bg-yellow-soft/80 px-4 py-3 text-sm leading-5 text-ink"
      role="alert"
    >
      {{ message }}
    </p>
    <div v-else-if="invitation" class="space-y-5">
      <div class="rounded-2xl border border-line bg-card px-5 py-4 text-sm">
        <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Correo invitado</p>
        <p class="mt-1.5 font-medium text-ink">{{ invitation.email }}</p>
        <p class="mt-3 text-muted">Caduca el {{ formatDate(invitation.expires_at) }}</p>
      </div>
      <SoftButton class="!h-12 !rounded-xl !text-[15px] !font-semibold" variant="yellow" block @click="continueRegister">
        Continuar al registro
      </SoftButton>
    </div>
  </AuthLayout>
</template>
