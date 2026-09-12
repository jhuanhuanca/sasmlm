<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { createSupportTicket, fetchMyTickets, fetchSupportTicket, replySupportTicket } from '@/api/support'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import SoftField from '@/components/ui/SoftField.vue'
import { useToast } from '@/composables/useToast'
import type { SupportTicket } from '@/types/support'
import { fieldErrors } from '@/utils/http'
import { fieldControlClass } from '@/utils/ui'

const toast = useToast()
const tickets = ref<SupportTicket[]>([])
const selected = ref<SupportTicket | null>(null)
const loading = ref(true)
const saving = ref(false)
const replying = ref(false)
const errors = ref<Record<string, string[]>>({})
const form = ref({ subject: '', message: '' })
const reply = ref('')

const statusLabel: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En atención',
  closed: 'Cerrado',
}

async function load(): Promise<void> {
  loading.value = true
  try {
    const payload = await fetchMyTickets()
    tickets.value = payload.data ?? []
  } catch (error) {
    toast.fromError(error, 'No se pudieron cargar tus tickets')
  } finally {
    loading.value = false
  }
}

async function submit(): Promise<void> {
  saving.value = true
  errors.value = {}
  try {
    await createSupportTicket({ ...form.value })
    form.value = { subject: '', message: '' }
    toast.success('El equipo de soporte lo verá en breve.', 'Ticket enviado')
    await load()
  } catch (error) {
    errors.value = fieldErrors(error)
    toast.fromError(error, 'No se pudo enviar el ticket')
  } finally {
    saving.value = false
  }
}

async function openTicket(ticket: SupportTicket): Promise<void> {
  try {
    selected.value = await fetchSupportTicket(ticket.id)
    reply.value = ''
  } catch (error) {
    toast.fromError(error, 'No se pudo abrir el ticket')
  }
}

async function sendReply(): Promise<void> {
  if (!selected.value || !reply.value.trim()) {
    return
  }

  replying.value = true
  try {
    selected.value = await replySupportTicket(selected.value.id, reply.value.trim())
    reply.value = ''
    toast.success('Tu mensaje quedó en el ticket.', 'Respuesta enviada')
    await load()
  } catch (error) {
    toast.fromError(error, 'No se pudo enviar la respuesta')
  } finally {
    replying.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <div data-tour="support-welcome">
    <ModuleBanner
      icon="clipboard"
      eyebrow="Ayuda"
      title="Soporte"
      body="Escribe un ticket si necesitas ayuda con la plataforma. El equipo de administración lo recibe y te responde aquí."
      :actions="[
        'Describe el tema y el detalle de lo que ocurre.',
        'Abre un ticket para ver las respuestas del equipo.',
        'Si el ticket sigue abierto, puedes añadir más información.',
      ]"
    />
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <SoftCard data-tour="support-form">
        <h2 class="font-medium">Nuevo ticket</h2>
        <form class="mt-4 space-y-4" @submit.prevent="submit">
          <SoftField label="Asunto" :error="errors.subject?.[0]">
            <input v-model="form.subject" :class="fieldControlClass" required maxlength="180" />
          </SoftField>
          <SoftField label="Mensaje" :error="errors.message?.[0]">
            <textarea v-model="form.message" :class="fieldControlClass" rows="5" required maxlength="5000" />
          </SoftField>
          <SoftButton type="submit" :disabled="saving">{{ saving ? 'Enviando…' : 'Enviar ticket' }}</SoftButton>
        </form>
      </SoftCard>

      <SoftCard :padded="false" data-tour="support-list">
        <div class="px-7 py-5">
          <h2 class="font-medium">Tus tickets</h2>
        </div>
        <p v-if="loading" class="px-7 pb-6 text-sm text-muted">Cargando…</p>
        <p v-else-if="!tickets.length" class="px-7 pb-6 text-sm text-muted">Aún no has enviado tickets.</p>
        <ul v-else class="divide-y divide-line">
          <li v-for="ticket in tickets" :key="ticket.id">
            <button
              type="button"
              class="flex w-full items-start justify-between gap-3 px-7 py-4 text-left hover:bg-shell"
              @click="openTicket(ticket)"
            >
              <span>
                <span class="block font-medium">{{ ticket.subject }}</span>
                <span class="mt-1 block text-xs text-muted">#{{ ticket.id }} · {{ statusLabel[ticket.status] }}</span>
              </span>
            </button>
          </li>
        </ul>
      </SoftCard>
    </div>

    <SoftCard v-if="selected">
      <p class="text-xs uppercase tracking-wide text-muted">Ticket #{{ selected.id }} · {{ statusLabel[selected.status] }}</p>
      <h2 class="mt-1 font-medium">{{ selected.subject }}</h2>
      <p class="mt-3 whitespace-pre-wrap text-sm">{{ selected.message }}</p>

      <ul v-if="selected.replies?.length" class="mt-5 space-y-3">
        <li
          v-for="item in selected.replies"
          :key="item.id"
          class="rounded-input bg-shell px-4 py-3 text-sm"
        >
          <p class="text-xs text-muted">
            {{ item.author_role === 'admin' ? 'Soporte' : item.author_name }}
          </p>
          <p class="mt-1 whitespace-pre-wrap">{{ item.message }}</p>
        </li>
      </ul>

      <form v-if="selected.status !== 'closed'" class="mt-5 space-y-3" @submit.prevent="sendReply">
        <SoftField label="Añadir información">
          <textarea v-model="reply" :class="fieldControlClass" rows="3" required />
        </SoftField>
        <SoftButton type="submit" :disabled="replying">{{ replying ? 'Enviando…' : 'Responder' }}</SoftButton>
      </form>
      <p v-else class="mt-4 text-sm text-muted">Este ticket ya está cerrado.</p>
    </SoftCard>
  </div>
</template>
