<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import BrandLogo from '@/components/ui/BrandLogo.vue'
import { sendMarketingContact } from '@/api/support'
import { errorMessage } from '@/utils/http'
import '@/styles/marketing.css'

const route = useRoute()
const sending = ref(false)
const done = ref(false)
const error = ref('')
const form = ref({
  name: '',
  whatsapp: '',
  email: '',
  company: '',
  pain: 'seguimiento',
})

const pains: Record<string, string> = {
  seguimiento: 'No tengo claro a quién darle seguimiento esta semana',
  enlace: 'No tengo un enlace mío (landing + tienda) para mandar info',
  inventario: 'Mis socios no pueden vender mi inventario sin pedirme stock',
  cierre: 'El cierre de mes lo armo a mano y no me cuadra',
}

const utmLine = computed(() => {
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
  const bits = keys
    .map((key) => {
      const value = route.query[key]
      const text = Array.isArray(value) ? value[0] : value
      return text ? `${key}=${text}` : null
    })
    .filter(Boolean)

  return bits.length ? bits.join(' | ') : 'sin UTM'
})

async function submit(): Promise<void> {
  sending.value = true
  error.value = ''
  try {
    const pain = pains[form.value.pain] ?? form.value.pain
    await sendMarketingContact({
      name: form.value.name,
      email: form.value.email,
      subject: 'Lead Meta Ads — quiero REXmlm',
      source: 'meta-ads',
      message: [
        'Quiere adquirir REXmlm desde campaña en frío.',
        `WhatsApp: ${form.value.whatsapp}`,
        form.value.company ? `Empresa/red: ${form.value.company}` : 'Empresa/red: no indicó',
        `Dolor: ${pain}`,
        `Campaña: ${utmLine.value}`,
        'Primer mes: US$ 1. Pedir llamada de onboarding.',
      ].join('\n'),
    })
    done.value = true
  } catch (err) {
    error.value = errorMessage(err, 'No se pudo enviar. Inténtalo de nuevo.')
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="mk-capture">
    <header class="mk-capture-brand">
      <BrandLogo height-class="h-9" surface="light" />
    </header>

    <main class="mk-capture-card">
      <p class="mk-kicker" style="justify-self: start">Para networkers</p>
      <h1 class="mk-h2" style="margin-top: 0.35rem">
        Tu red no puede seguir viviendo en el chat.
      </h1>
      <p class="mk-lead" style="margin: 0.6rem 0 0">
        Equipo, landing, tienda e inventario en un solo panel. El socio no paga. Tú empiezas el primer mes por US$ 1.
      </p>

      <p v-if="done" class="mk-capture-ok">
        Listo. Te escribimos por WhatsApp o correo para activarte. Revisa también el spam.
      </p>

      <form v-else class="mk-form mk-capture-form" @submit.prevent="submit">
        <input v-model="form.name" required placeholder="Tu nombre (*)" autocomplete="name" />
        <input v-model="form.whatsapp" required placeholder="WhatsApp con código de país (*)" autocomplete="tel" />
        <input v-model="form.email" required type="email" placeholder="Tu correo (*)" autocomplete="email" />
        <input v-model="form.company" placeholder="Empresa o red (HGW, FWP…)" class="mk-full" />
        <label class="mk-full mk-capture-pain">
          <span>Lo que más se te pierde hoy</span>
          <select v-model="form.pain">
            <option value="seguimiento">A quién darle seguimiento esta semana</option>
            <option value="enlace">Un enlace mío para mandar info</option>
            <option value="inventario">Que mis socios vendan mi inventario</option>
            <option value="cierre">Un cierre de mes que sí cuadre</option>
          </select>
        </label>
        <p v-if="error" class="mk-full" style="color: #fe4950; margin: 0; font-size: 0.92rem">{{ error }}</p>
        <button class="mk-btn mk-full" type="submit" :disabled="sending">
          {{ sending ? 'Enviando…' : 'Quiero ordenar mi red — US$ 1 el primer mes' }}
        </button>
        <p class="mk-full mk-capture-fine">
          Sin mes gratis a cero. Dejas tarjeta. Si no es para ti, cancelas antes del segundo cobro.
        </p>
      </form>
    </main>
  </div>
</template>
