<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import MkChrome from '@/components/marketing/MkChrome.vue'
import { sendMarketingContact } from '@/api/support'
import { useToast } from '@/composables/useToast'
import { errorMessage } from '@/utils/http'
import '@/styles/marketing.css'

const toast = useToast()
const sending = ref(false)
const consent = ref(false)
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const tools = [
  {
    title: 'Catálogo y pedidos',
    body: 'Organiza productos, inventario y ventas en un mismo panel. Pensado para quien ya opera un negocio lícito.',
    metric: 'Tienda',
    color: '#abd600',
    icon: '▣',
  },
  {
    title: 'Página y equipo',
    body: 'Publica tu página, invita colaboradores que aceptan unirse y lleva el seguimiento interno de tu operación.',
    metric: 'Operación',
    color: '#ffc400',
    icon: '◎',
  },
  {
    title: 'Reportes de ciclo',
    body: 'Cierra periodos con cifras claras: actividad, metas y un resumen para decidir con datos, no con hojas sueltas.',
    metric: 'Ritmo',
    color: '#ff5318',
    icon: '◷',
  },
]

const extras = [
  {
    title: 'Mejoras continuas',
    body: 'La plataforma evoluciona con funciones de productividad. No incluye discado, listas compradas ni envíos masivos no solicitados.',
  },
]

const partners = [
  { name: 'HGW', src: '/marketing/partners/hgw.png', tone: 'light' },
  { name: 'Immunotec', src: '/marketing/partners/immunotec.jpg', tone: 'light' },
  { name: 'Omnilife', src: '/marketing/partners/omnilife.jpg', tone: 'light' },
  { name: 'DXN', src: '/marketing/partners/dxn.jpg', tone: 'light' },
  { name: 'Fase Global', src: '/marketing/partners/fase-global.png', tone: 'light' },
  { name: 'FWP', src: '/marketing/partners/fwp.webp', tone: 'outline' },
]

const stats = [
  { title: '1 suscripción', text: 'acceso al software de catálogo, página y equipo.' },
  { title: 'Pago con Paddle', text: 'comerciante registrado: factura, impuestos y checkout seguro.' },
  { title: 'Cancelas cuando quieras', text: 'al final del periodo pagado; reembolso de 14 días en el primer cobro.' },
]

const packs = [
  {
    kicker: 'Operación',
    name: 'Básico',
    price: 29,
    annual: 290,
    blurb: 'Equipo, invitaciones y página. Sin tienda propia.',
    cta: 'Empezar Básico',
    featured: false,
    items: [
      { on: true, text: 'Equipo, invitaciones y seguimiento interno' },
      { on: true, text: 'Página pública' },
      { on: true, text: 'Cierre de mes: resumen' },
      { on: true, text: '1 catálogo de empresa' },
      { on: true, text: 'Hasta 50 colaboradores' },
      { on: true, text: 'Soporte estándar' },
      { on: false, text: 'Herramientas de ficha (IMC, flyers, bienestar)' },
      { on: false, text: 'Tienda, inventario y POS' },
      { on: false, text: 'Colaboradores venden tu inventario' },
      { on: false, text: 'Catálogo extra: add-on US$ 15/mes' },
    ],
  },
  {
    kicker: 'Comercio',
    name: 'Intermedio',
    price: 49,
    annual: 490,
    blurb: 'Para quien vende producto y necesita tienda e inventario.',
    cta: 'Elegir Intermedio',
    featured: true,
    items: [
      { on: true, text: 'Equipo, invitaciones, seguimiento y página' },
      { on: true, text: 'Herramientas de ficha (IMC, flyers, bienestar)' },
      { on: true, text: 'Tienda, inventario y POS' },
      { on: true, text: 'Colaboradores pueden vender tu inventario' },
      { on: true, text: 'Cierre de mes completo' },
      { on: true, text: '1 catálogo de empresa' },
      { on: true, text: 'Hasta 500 colaboradores' },
      { on: true, text: 'Soporte estándar' },
      { on: false, text: 'Catálogo extra: add-on US$ 15/mes' },
    ],
  },
  {
    kicker: 'Dos catálogos',
    name: 'Premium',
    price: 69,
    annual: 690,
    blurb: 'Incluye un catálogo extra si operas dos líneas de producto.',
    cta: 'Elegir Premium',
    featured: false,
    items: [
      { on: true, text: 'Todo lo de Intermedio' },
      { on: true, text: 'Cierre completo + prioridad' },
      { on: true, text: 'Sin tope práctico de colaboradores' },
      { on: true, text: 'Principal + 1 catálogo extra incluido' },
      { on: true, text: 'Siguientes catálogos: US$ 15/mes' },
      { on: true, text: 'Soporte prioritario' },
    ],
  },
]

async function submitContact(): Promise<void> {
  if (!consent.value) {
    toast.error('Marca la casilla para que podamos responderte.', 'Falta el consentimiento')
    return
  }
  sending.value = true
  try {
    await sendMarketingContact({ ...form.value })
    form.value = { name: '', email: '', subject: '', message: '' }
    consent.value = false
    toast.success('Te responderemos por el correo que indicaste.', 'Mensaje enviado')
  } catch (error) {
    toast.fromError(error, errorMessage(error, 'No se pudo enviar el mensaje'))
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <MkChrome>
    <section id="inicio" class="mk-wrap mk-hero">
      <div>
        <span class="mk-kicker">Software como servicio</span>
        <h1 class="mk-h1">Opera catálogo, tienda y equipo <em>en un solo panel</em>.</h1>
        <p class="mk-lead">
          REXmlm es una suscripción de software para ordenar productos, publicar tu página, invitar colaboradores y
          cerrar ciclos. No vendemos listas de contactos ni campañas de mensajería no solicitada.
        </p>
        <div class="mk-hero-actions">
          <a class="mk-btn" href="#paquetes">Ver planes</a>
          <a class="mk-btn-ghost" href="#herramientas">Ver el producto</a>
        </div>
      </div>
      <div class="mk-hero-visual">
        <span class="mk-dash-ring" aria-hidden="true" />
        <span class="mk-stripe-blob" aria-hidden="true" />
        <img
          class="mk-hero-photo"
          src="/marketing/slider-model.png"
          alt="Persona señalando un panel de resultados"
        />
        <img class="mk-rate-card" src="/marketing/slider-rate.png" alt="Indicador de conversión del checkout" />
      </div>
    </section>

    <section class="mk-wrap mk-section mk-center">
      <p class="mk-lead" style="margin-inline: auto">Hecho para negocios que ya venden con procesos claros.</p>
      <h2 class="mk-h2">Catálogos de ejemplo en la plataforma</h2>
      <p class="mk-lead mk-partners-copy">
        REXmlm no es socio ni representante de estas marcas. El catálogo es una ayuda operativa para quien ya trabaja
        con ellas. Los logotipos pertenecen a sus titulares.
      </p>
      <div class="mk-partners">
        <img
          v-for="partner in partners"
          :key="partner.name"
          :src="partner.src"
          :alt="partner.name"
          :class="'is-' + partner.tone"
        />
      </div>
      <p class="mk-partners-note">
        ¿Necesitas otro catálogo? <a href="#contacto">Escríbenos</a> y lo evaluamos.
      </p>
    </section>

    <section class="mk-wrap mk-section">
      <div class="mk-split">
        <div>
          <span class="mk-kicker">Todo en un mismo lugar</span>
          <h2 class="mk-h2">Menos hojas sueltas. Más operación.</h2>
        </div>
        <div class="text-right max-lg:text-left">
          <a class="mk-btn" href="#herramientas">Ver funciones</a>
        </div>
      </div>
      <div class="mk-cards">
        <article v-for="item in stats" :key="item.title" class="mk-card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>

    <section id="herramientas" class="mk-wrap mk-section">
      <div class="mk-split">
        <div>
          <span class="mk-kicker">El producto</span>
          <h2 class="mk-h2">Funciones de la suscripción</h2>
          <p class="mk-lead">Tu operación comercial, ordenada desde el primer día.</p>
          <p class="mk-lead">
            Invitaciones a personas que aceptan unirse. Página y tienda a las que el visitante llega por su voluntad.
            Seguimiento interno. Sin discado ni envíos masivos.
          </p>
        </div>
        <div />
      </div>
      <div class="mk-cards">
        <article
          v-for="(tool, index) in tools"
          :key="tool.title"
          class="mk-card"
          :class="{ 'is-featured': index === 1 }"
        >
          <span class="mk-icon" :style="{ background: tool.color + '33', color: tool.color }">{{ tool.icon }}</span>
          <h3>{{ tool.title }}</h3>
          <p>{{ tool.body }}</p>
          <p class="mk-metric" :style="{ color: tool.color }">{{ tool.metric }}</p>
        </article>
      </div>
      <article class="mk-card mt-5">
        <h3>{{ extras[0].title }}</h3>
        <p>{{ extras[0].body }}</p>
      </article>
    </section>

    <section class="mk-wrap mk-section">
      <div class="mk-split">
        <div class="mk-circle-photo">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80"
            alt="Equipo colaborando alrededor de una mesa"
          />
        </div>
        <div>
          <span class="mk-kicker">Quiénes somos</span>
          <h2 class="mk-h2">Un equipo que construye software de operación.</h2>
          <p class="mk-lead">
            Hacemos REXmlm para profesionales que quieren un panel claro: catálogo, página, equipo y reportes. Tecnología
            simple, procesos documentados y políticas públicas de uso.
          </p>
          <a class="mk-btn mt-6" href="#contacto">Hablar con nosotros</a>
        </div>
      </div>
    </section>

    <section id="afiliados" class="mk-wrap mk-section">
      <div class="mk-split">
        <div>
          <span class="mk-kicker">Afiliados</span>
          <h2 class="mk-h2">Una comisión, un pago de lista</h2>
          <p class="mk-lead">
            Si alguien crea su propia cuenta y paga el precio de lista del software, puedes recibir el 10 % de ese
            primer cobro de lista. Una sola vez. No hay niveles, ni cuota por reclutar, ni inventario obligatorio.
          </p>
          <ul class="mk-checks">
            <li>Solo aplica al plan de plataforma, no al ciclo introductorio de US$ 1 ni a catálogos extra.</li>
            <li>Promocionar con spam o mensajes no solicitados anula la comisión y puede cerrar la cuenta.</li>
          </ul>
        </div>
        <div class="mk-hero-visual">
          <span class="mk-blob mk-blob-a" aria-hidden="true" />
          <img
            class="mk-hero-photo"
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80"
            alt="Equipo trabajando en una oficina"
          />
        </div>
      </div>
    </section>

    <section id="paquetes" class="mk-wrap mk-section">
      <div class="mk-center">
        <span class="mk-kicker">Suscripción SaaS</span>
        <h2 class="mk-h2">Planes de software</h2>
        <p class="mk-lead" style="margin-inline: auto">
          Tres planes. El primer ciclo por US$ 1 con tarjeta. Después, Paddle cobra el precio de lista en automático.
          El colaborador invitado no paga el plan de la plataforma. Impuestos en el checkout, según tu país.
        </p>
      </div>
      <div class="mk-plans">
        <article v-for="pack in packs" :key="pack.name" class="mk-plan" :class="{ 'is-featured': pack.featured }">
          <span v-if="pack.featured" class="mk-badge">Más elegido</span>
          <p class="mk-plan-kicker">{{ pack.kicker }}</p>
          <h3>{{ pack.name }}</h3>
          <p class="mk-plan-intro">Primer ciclo US$ 1</p>
          <p class="mk-plan-price">
            US$ {{ pack.price }}
            <span> / mes</span>
          </p>
          <p class="mk-plan-annual">Anual US$ {{ pack.annual }}</p>
          <p>{{ pack.blurb }}</p>
          <ul class="mk-checks">
            <li v-for="item in pack.items" :key="item.text" :class="{ 'is-off': !item.on }">{{ item.text }}</li>
          </ul>
          <RouterLink class="mk-btn mt-6 w-full" to="/register">{{ pack.cta }}</RouterLink>
        </article>
      </div>
      <p class="mk-plan-footnote">
        El vendedor de los planes es Paddle (Merchant of Record). Cancelación al final del periodo; reembolso de 14 días
        en el primer cobro. Detalle en
        <RouterLink to="/legal/reembolsos">reembolsos</RouterLink>
        y
        <RouterLink to="/legal/terminos">términos</RouterLink>.
      </p>
    </section>

    <section class="mk-wrap mk-cta-band">
      <h2 class="mk-h2">Un panel para operar, no para bombardear contactos.</h2>
      <p class="mk-lead" style="margin-inline: auto">
        Si buscas software de catálogo, tienda y equipo, REXmlm encaja. Si buscas un discador o listas frías, no es este
        producto.
      </p>
      <a class="mk-btn mt-6" href="#contacto">Quiero conocer REXmlm</a>
    </section>

    <section id="contacto" class="relative">
      <form class="mk-form-card mk-form" @submit.prevent="submitContact">
        <span class="mk-kicker mk-full" style="justify-self: start">Contacto</span>
        <h2 class="mk-h2 mk-full" style="margin-top: 0">Escríbenos. Te respondemos a tu correo.</h2>
        <input v-model="form.name" required placeholder="Tu nombre (*)" autocomplete="name" />
        <input v-model="form.email" required type="email" placeholder="Tu correo (*)" autocomplete="email" />
        <input v-model="form.subject" placeholder="Asunto" class="mk-full" />
        <textarea v-model="form.message" required rows="4" placeholder="Tu mensaje" class="mk-full" />
        <label class="mk-consent mk-full">
          <input v-model="consent" type="checkbox" required />
          <span>
            Acepto que traten este mensaje para responderme, según la
            <RouterLink to="/legal/privacidad">política de privacidad</RouterLink>.
          </span>
        </label>
        <button class="mk-btn mk-full" type="submit" :disabled="sending || !consent">
          {{ sending ? 'Enviando…' : 'Enviar mensaje' }}
        </button>
      </form>
    </section>
  </MkChrome>
</template>
