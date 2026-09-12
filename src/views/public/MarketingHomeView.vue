<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import BrandLogo from '@/components/ui/BrandLogo.vue'
import { sendMarketingContact } from '@/api/support'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { errorMessage } from '@/utils/http'
import '@/styles/marketing.css'

const auth = useAuthStore()
const toast = useToast()
const menuOpen = ref(false)
const sending = ref(false)
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const tools = [
  {
    title: 'Productos organizados',
    body: 'Accede a productos ya cargados de diferentes empresas y preséntalos con mayor facilidad.',
    metric: 'Catálogo',
    color: '#abd600',
    icon: '▣',
  },
  {
    title: 'CRM básico',
    body: 'Registra prospectos, recuerda conversaciones y no dejes escapar oportunidades importantes.',
    metric: 'Seguimiento',
    color: '#ffc400',
    icon: '◎',
  },
  {
    title: 'Cierre de ciclos',
    body: 'Mantén visibles tus actividades clave para dar seguimiento con constancia y propósito.',
    metric: 'Ritmo',
    color: '#ff5318',
    icon: '◷',
  },
]

const extras = [
  {
    title: 'Automatizaciones con IA',
    body: 'Una plataforma preparada para evolucionar y sumar herramientas inteligentes a tu ritmo.',
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
  { title: '1 plataforma', text: 'para centralizar herramientas adaptadas a tu operación.' },
  { title: 'Referidos', text: 'que impulsan ganancias por cada recomendación activa.' },
  { title: 'IA + futuro', text: 'para añadir automatizaciones conforme crece tu negocio.' },
]

function closeMenu(): void {
  menuOpen.value = false
}

function scrollTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function submitContact(): Promise<void> {
  sending.value = true
  try {
    await sendMarketingContact({ ...form.value })
    form.value = { name: '', email: '', subject: '', message: '' }
    toast.success('Te contactaremos pronto.', 'Mensaje enviado')
  } catch (error) {
    toast.fromError(error, errorMessage(error, 'No se pudo enviar el mensaje'))
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="mk-root">
    <header class="mk-nav">
      <div class="mk-wrap mk-nav-inner">
        <RouterLink to="/" class="mk-brand" aria-label="REXmlm">
          <BrandLogo surface="light" height-class="h-9" />
          <span class="mk-brand-tag">resultados explosivos en tu multinivel</span>
        </RouterLink>
        <nav class="mk-links" aria-label="Principal">
          <a href="#herramientas">Herramientas</a>
          <a href="#referidos">Referidos</a>
          <a href="#paquetes">Paquetes</a>
        </nav>
        <div class="flex items-center gap-3">
          <RouterLink v-if="auth.isAuthenticated" class="mk-btn" to="/app">Entrar al panel</RouterLink>
          <template v-else>
            <RouterLink class="mk-btn-ghost max-md:hidden" to="/register">Crear cuenta</RouterLink>
            <RouterLink class="mk-btn" to="/login">Iniciar sesión</RouterLink>
          </template>
          <button class="mk-menu-btn" type="button" aria-label="Menú" @click="menuOpen = !menuOpen">☰</button>
        </div>
      </div>
      <div class="mk-wrap mk-mobile" :class="{ 'is-open': menuOpen }">
        <a href="#herramientas" @click="closeMenu">Herramientas</a>
        <a href="#referidos" @click="closeMenu">Referidos</a>
        <a href="#paquetes" @click="closeMenu">Paquetes</a>
        <RouterLink v-if="auth.isAuthenticated" to="/app" @click="closeMenu">Entrar al panel</RouterLink>
        <template v-else>
          <RouterLink to="/login" @click="closeMenu">Iniciar sesión</RouterLink>
          <RouterLink to="/register" @click="closeMenu">Crear cuenta</RouterLink>
        </template>
      </div>
    </header>

    <section id="inicio" class="mk-wrap mk-hero">
      <div>
        <span class="mk-kicker">El sistema que acompaña tu red</span>
        <h1 class="mk-h1">Haz que tu negocio multinivel <em>avance</em> con claridad.</h1>
        <p class="mk-lead">
          REXMLM reúne productos, prospectos, seguimiento y herramientas de crecimiento en una sola plataforma pensada
          para líderes de diferentes empresas.
        </p>
        <div class="mk-hero-actions">
          <a class="mk-btn" href="#paquetes">Conocer paquetes</a>
          <a class="mk-btn-ghost" href="#herramientas">Explorar herramientas</a>
        </div>
      </div>
      <div class="mk-hero-visual">
        <span class="mk-dash-ring" aria-hidden="true" />
        <span class="mk-stripe-blob" aria-hidden="true" />
        <img
          class="mk-hero-photo"
          src="/marketing/slider-model.png"
          alt="Líder señalando el crecimiento de su red"
        />
        <img class="mk-rate-card" src="/marketing/slider-rate.png" alt="Checkout Rate +125%" />
      </div>
    </section>

    <section class="mk-wrap mk-section mk-center">
      <p class="mk-lead" style="margin-inline: auto">Creado para construir equipos con procesos más simples.</p>
      <h2 class="mk-h2">Apoyo para networkers de estas compañías</h2>
      <p class="mk-lead mk-partners-copy">
        REXMLM no es socio ni representante de estas marcas. Reunimos información y herramientas de apoyo para
        líderes independientes que ya trabajan con ellas.
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
        ¿Tu empresa aún no está? <a href="#contacto">Escríbenos y podemos añadirla</a> para que tu red también tenga
        este apoyo.
      </p>
    </section>

    <section class="mk-wrap mk-section">
      <div class="mk-split">
        <div>
          <span class="mk-kicker">Todo en un mismo lugar</span>
          <h2 class="mk-h2">Menos hojas sueltas. Más enfoque para tu comunidad.</h2>
        </div>
        <div class="text-right max-lg:text-left">
          <a class="mk-btn" href="#herramientas">Descubre las herramientas</a>
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
          <span class="mk-kicker">Nuestra especialidad</span>
          <h2 class="mk-h2">Herramientas que se adaptan</h2>
          <p class="mk-lead">Tu operación, más ordenada desde el primer día.</p>
          <p class="mk-lead">
            No importa con qué empresa trabajes: REXMLM está diseñado para ayudarte a mostrar, dar seguimiento y
            acompañar mejor a cada persona de tu red.
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
          <h2 class="mk-h2">Un equipo de jóvenes amigables, de mente abierta y flexibles.</h2>
          <p class="mk-lead">
            Construimos REXMLM para líderes que quieren profesionalizar su red sin perder cercanía. Tecnología simple,
            procesos claros y una operación que sí puede crecer contigo.
          </p>
          <a class="mk-btn mt-6" href="#contacto">Conócenos</a>
        </div>
      </div>
    </section>

    <section id="referidos" class="mk-wrap mk-section">
      <div class="mk-split">
        <div>
          <span class="mk-kicker">Programa de referidos</span>
          <h2 class="mk-h2">Crece recomendando</h2>
          <p class="mk-lead">Comparte REXMLM. Genera una ganancia por tus referidos.</p>
          <p class="mk-lead">
            Cuando recomiendas la plataforma a otros multinivelistas, abres una nueva forma de generar ingresos mientras
            ayudas a más personas a profesionalizar su operación.
          </p>
          <ul class="mk-checks">
            <li>Recomienda una herramienta que aporta orden y seguimiento real.</li>
            <li>Construye un ingreso adicional por cada referido activo.</li>
          </ul>
        </div>
        <div class="mk-hero-visual">
          <span class="mk-blob mk-blob-a" aria-hidden="true" />
          <img
            class="mk-hero-photo"
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80"
            alt="Grupo diverso colaborando en oficina"
          />
        </div>
      </div>
    </section>

    <section id="paquetes" class="mk-wrap mk-section">
      <div class="mk-center">
        <span class="mk-kicker">Suscripciones flexibles</span>
        <h2 class="mk-h2">Elige el ritmo que necesita tu negocio</h2>
        <p class="mk-lead" style="margin-inline: auto">
          Comienza con lo esencial y desbloquea más capacidad conforme tu red y tus procesos evolucionan.
        </p>
      </div>
      <div class="mk-plans">
        <article class="mk-plan">
          <p class="mk-plan-kicker">Inicio</p>
          <h3>Esencial</h3>
          <p>Para comenzar a ordenar tu operación y tus conversaciones.</p>
          <ul class="mk-checks">
            <li>Catálogo de productos</li>
            <li>CRM básico</li>
            <li>Seguimiento de ciclos</li>
          </ul>
          <RouterLink class="mk-btn mt-6 w-full" to="/register">Solicitar acceso</RouterLink>
        </article>
        <article class="mk-plan is-featured">
          <span class="mk-badge">Más elegido</span>
          <p class="mk-plan-kicker">Impulso</p>
          <h3>Profesional</h3>
          <p>Para líderes que desean crear procesos consistentes para su equipo.</p>
          <ul class="mk-checks">
            <li>Todo lo del plan Esencial</li>
            <li>Herramientas adaptadas</li>
            <li>Beneficios por referidos</li>
          </ul>
          <RouterLink class="mk-btn mt-6 w-full" to="/register">Elegir Profesional</RouterLink>
        </article>
        <article class="mk-plan">
          <p class="mk-plan-kicker">Evolución</p>
          <h3>Escala</h3>
          <p>Para una visión de crecimiento continuo con nuevas capacidades.</p>
          <ul class="mk-checks">
            <li>Todo lo del plan Profesional</li>
            <li>Prioridad en nuevas herramientas</li>
            <li>Automatizaciones IA futuras</li>
          </ul>
          <RouterLink class="mk-btn mt-6 w-full" to="/register">Quiero escalar</RouterLink>
        </article>
      </div>
    </section>

    <section class="mk-wrap mk-cta-band">
      <h2 class="mk-h2">Tu red merece una operación que sí pueda crecer contigo.</h2>
      <p class="mk-lead" style="margin-inline: auto">
        Conoce REXMLM y descubre cómo centralizar las herramientas que impulsan tu siguiente etapa.
      </p>
      <a class="mk-btn mt-6" href="#contacto">Quiero conocer REXMLM</a>
    </section>

    <section id="contacto" class="relative">
      <form class="mk-form-card mk-form" @submit.prevent="submitContact">
        <span class="mk-kicker mk-full" style="justify-self: start">Contacto</span>
        <h2 class="mk-h2 mk-full" style="margin-top: 0">No te quedes con la duda, escríbenos.</h2>
        <input v-model="form.name" required placeholder="Tu nombre (*)" autocomplete="name" />
        <input v-model="form.email" required type="email" placeholder="Tu correo (*)" autocomplete="email" />
        <input v-model="form.subject" placeholder="Asunto" class="mk-full" />
        <textarea v-model="form.message" required rows="4" placeholder="Tu mensaje" />
        <button class="mk-btn mk-full" type="submit" :disabled="sending">
          {{ sending ? 'Enviando…' : 'Enviar mensaje' }}
        </button>
      </form>
    </section>

    <footer class="mk-footer">
      <div class="mk-wrap">
        <div class="mk-center">
          <BrandLogo surface="dark" height-class="h-10" tagline />
        </div>
        <div class="mk-footer-grid">
          <div>
            <small>Plataforma</small>
            <p>REXMLM</p>
          </div>
          <div>
            <small>Para líderes</small>
            <p>Herramientas, referidos y paquetes</p>
          </div>
          <div>
            <small>Acceso</small>
            <p>
              <RouterLink to="/login" class="text-white">Entrar</RouterLink>
              ·
              <RouterLink to="/register" class="text-white">Crear cuenta</RouterLink>
            </p>
          </div>
        </div>
        <div class="mk-footer-bottom">
          <p>REXMLM · Herramientas para líderes que construyen comunidad.</p>
          <p>© {{ new Date().getFullYear() }} REXmlm</p>
        </div>
      </div>
    </footer>

    <button class="mk-top" type="button" aria-label="Volver arriba" @click="scrollTop">
      ↑
    </button>
  </div>
</template>
