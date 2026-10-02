<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BrandLogo from '@/components/ui/BrandLogo.vue'
import { fetchPlans } from '@/api/subscription'
import { planCatalogRows } from '@/data/planModules'
import { useAuthStore } from '@/stores/auth'
import type { Plan } from '@/types/mlm'
import { rememberPendingPlan } from '@/utils/pendingPlan'
import { money } from '@/utils/format'

const OFFER_MS = 10 * 60 * 1000
const OFFER_KEY = 'rexmlm_promo_offer_until'
const videoUrl = String(import.meta.env.VITE_PROMO_VIDEO_URL ?? '').trim()

const router = useRouter()
const auth = useAuthStore()
const videoEl = ref<HTMLVideoElement | null>(null)
const playing = ref(false)
const revealed = ref(false)
const skipReady = ref(false)
const remainingMs = ref(OFFER_MS)
const plans = ref<Plan[]>([])
const selectedId = ref<number | null>(null)
const deckIndex = ref(0)
const progress = ref(0)

let offerTimer: ReturnType<typeof setInterval> | null = null
let skipTimer: ReturnType<typeof setTimeout> | null = null
let deckTimer: ReturnType<typeof setInterval> | null = null
let progressRaf = 0
const deckStartedAt = ref(0)

const pains = [
  {
    before: 'Audios que se pierden.',
    after: 'Notas y seguimiento en el panel. El cliente no se queda en un hilo de 200 mensajes.',
  },
  {
    before: 'Capturas que nadie encuentra.',
    after: 'Cierre con ventas de tienda y volumen, sin Excel ni fotos de pantalla.',
  },
  {
    before: 'Links regados por todos lados.',
    after: 'Tu página, tu slug, tu cara. Un enlace. El tuyo.',
  },
  {
    before: 'Clientes que no ven tu tienda.',
    after: 'Tienda visible. Stock que se descuenta. El socio vende lo que le asignaste.',
  },
  {
    before: 'Equipo desordenado.',
    after: 'Invitación, ficha, siguiente contacto. Sabes en qué etapa está cada socio.',
  },
  {
    before: 'Tú apagando incendios todo el día.',
    after: 'Protocolo y herramientas. Operas. No persigues chats.',
  },
]

const solutions = ['Tu tienda visible.', 'Tu página lista.', 'Tu equipo conectado.', 'Tu operación con orden.']

const steps = [
  { n: '01', title: 'Entras. La presentación ya corre.', body: '30 segundos. Sin instalar. Primero lo ves.' },
  { n: '02', title: 'Tocas el panel.', body: 'Ves tu tienda, tu página y tu equipo funcionando. Como si lo tuvieras en la mano.' },
  { n: '03', title: 'Eliges plan. Te llevo al registro.', body: 'Hoy el primer ciclo sale US$ 1. El socio invitado no paga el software.' },
]

const faqs = [
  {
    q: '¿Qué veo en 30 segundos?',
    a: 'La presentación del panel: tienda, página y equipo. REXmlm es el software, no la marca de tus productos.',
  },
  {
    q: '¿Tengo que pagar para verlo?',
    a: 'No. Primero ves la presentación. Después eliges plan y te llevamos al registro.',
  },
  {
    q: '¿Cuánto cuesta hoy?',
    a: 'El primer ciclo sale US$ 1. El socio invitado no paga el software. Desde el ciclo 2, el precio de lista del plan. Cobra Paddle y te manda el recibo.',
  },
  {
    q: '¿Necesito experiencia?',
    a: 'No. El panel está pensado para operar simple y con orden.',
  },
  {
    q: '¿Qué pasa después de los 30 segundos?',
    a: 'Eliges plan y te llevo al registro con ese plan marcado.',
  },
  {
    q: '¿Me dan listas o el 20 % es una pirámide?',
    a: 'No vendemos listas, discado ni tu marca. Si alguien se registra en REXmlm por ti y paga el precio de lista del software, te llevas el 20 % de ese cobro. Una sola vez.',
  },
]

const deck = [
  { kicker: 'Paso 1', title: 'Entras. La presentación ya corre.', body: 'Sin instalar. 30 segundos. Primero lo ves, luego decides.' },
  { kicker: 'Paso 2', title: 'Tocas el panel.', body: 'Tienda, página y equipo en el aire. Como si los tocaras.' },
  { kicker: 'Paso 3', title: 'Eliges plan. Hoy el primer ciclo sale US$ 1.', body: 'El socio invitado no paga el software. Te llevo al registro.' },
]

const offerAlive = computed(() => remainingMs.value > 0)
const offerClock = computed(() => {
  const total = Math.max(0, Math.floor(remainingMs.value / 1000))
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
})

const monthly = computed(() => {
  const rows = plans.value.filter((plan) => plan.interval === 'month')
  return rows.length ? rows : plans.value
})

const selected = computed(() => monthly.value.find((plan) => plan.id === selectedId.value) ?? monthly.value[0] ?? null)

function tickOffer(): void {
  const until = Number(sessionStorage.getItem(OFFER_KEY) ?? 0)
  remainingMs.value = Math.max(0, until - Date.now())
}

function startOffer(): void {
  if (!sessionStorage.getItem(OFFER_KEY)) {
    sessionStorage.setItem(OFFER_KEY, String(Date.now() + OFFER_MS))
  }
  tickOffer()
  offerTimer = setInterval(tickOffer, 250)
}

function enterPanel(): void {
  if (revealed.value && selected.value) {
    choosePlan(selected.value)
    return
  }
  document.getElementById('promo-video')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  if (!playing.value && !revealed.value) {
    startPresentation()
  }
}

function reveal(): void {
  if (revealed.value) {
    return
  }
  revealed.value = true
  playing.value = false
  window.setTimeout(() => {
    document.getElementById('promo-dolor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 80)
}

function stopDeck(): void {
  if (deckTimer) {
    clearInterval(deckTimer)
    deckTimer = null
  }
  if (progressRaf) {
    cancelAnimationFrame(progressRaf)
    progressRaf = 0
  }
}

function animateDeckProgress(): void {
  const elapsed = Date.now() - deckStartedAt.value
  progress.value = Math.min(100, (elapsed / 30000) * 100)
  if (elapsed >= 30000) {
    stopDeck()
    reveal()
    return
  }
  progressRaf = requestAnimationFrame(animateDeckProgress)
}

function startDeck(): void {
  stopDeck()
  deckIndex.value = 0
  deckStartedAt.value = Date.now()
  playing.value = true
  animateDeckProgress()
  deckTimer = setInterval(() => {
    deckIndex.value = Math.min(deck.length - 1, deckIndex.value + 1)
  }, 10000)
}

function startPresentation(): void {
  skipReady.value = false
  skipTimer = setTimeout(() => {
    skipReady.value = true
  }, 8000)

  if (videoUrl && videoEl.value) {
    playing.value = true
    void videoEl.value.play().catch(() => {
      startDeck()
    })
    return
  }

  startDeck()
}

function onTime(): void {
  const el = videoEl.value
  if (!el || !el.duration) {
    return
  }
  progress.value = Math.min(100, (el.currentTime / Math.min(el.duration, 30)) * 100)
  if (el.currentTime >= 30) {
    el.pause()
    reveal()
  }
}

function choosePlan(plan: Plan): void {
  selectedId.value = plan.id
  rememberPendingPlan(plan.id)
  if (auth.isAuthenticated) {
    const canPay = auth.isPartnerOnly || (auth.isLeader && auth.hasPaidAccess === false) || auth.isAdmin
    void router.push(canPay ? { name: 'become-leader', query: { plan: String(plan.id) } } : { name: 'dashboard' })
    return
  }
  void router.push({ name: 'register', query: { plan: String(plan.id) } })
}

onMounted(async () => {
  startOffer()
  if (new URLSearchParams(window.location.search).get('skip') === '1') {
    revealed.value = true
  } else {
    startPresentation()
  }
  try {
    plans.value = await fetchPlans()
    selectedId.value = monthly.value.find((plan) => plan.recommended)?.id ?? monthly.value[0]?.id ?? null
  } catch {
    plans.value = []
  }
})

onUnmounted(() => {
  if (offerTimer) {
    clearInterval(offerTimer)
  }
  if (skipTimer) {
    clearTimeout(skipTimer)
  }
  stopDeck()
})
</script>

<template>
  <div class="promo">
    <header class="promo-top">
      <BrandLogo surface="dark" height-class="h-9 sm:h-10" tagline />
      <div class="promo-chip" :class="{ 'is-hot': offerAlive }">
        <span>US$ 1</span>
        <strong>{{ offerAlive ? offerClock : 'ahora' }}</strong>
      </div>
    </header>

    <section class="promo-hero">
      <div class="promo-hero-copy">
        <p class="promo-kicker">Para líderes de red que quieren escalar en serio</p>
        <h1>
          Siguiente nivel de tu red:
          <span>opera más allá del WhatsApp.</span>
        </h1>
        <p class="promo-lead">
          Entra a un panel con tu tienda, tu página y tu equipo en el aire, como si los tocaras. 30 segundos. Después
          eliges plan y te llevo al registro.
        </p>
        <div class="promo-cta-row">
          <button type="button" class="promo-btn" @click="enterPanel">
            {{
              revealed
                ? 'Entrar al panel ahora – US$ 1 primer ciclo'
                : playing
                  ? 'La presentación ya corre · mira abajo'
                  : 'Entrar al panel ahora – US$ 1 primer ciclo'
            }}
          </button>
          <p class="promo-note">La presentación ya corre. Sin instalar. Primero lo ves, luego decides.</p>
        </div>
      </div>

      <div class="promo-visual" aria-hidden="true">
        <img src="/promo/hero.jpg" alt="" class="promo-hero-img" width="1600" height="900" />
        <div class="promo-float promo-float-a">
          <small>Tienda</small>
          <strong>Tu inventario</strong>
          <em>en vivo</em>
        </div>
        <div class="promo-float promo-float-b">
          <small>Equipo</small>
          <strong>Socios</strong>
          <em>con ficha</em>
        </div>
        <div class="promo-float promo-float-c">
          <small>Landing</small>
          <strong>Tu enlace</strong>
          <em>no el de otro</em>
        </div>
      </div>

      <div class="promo-stats">
        <div>
          <strong>US$ 1</strong>
          <span>primer ciclo. El socio invitado no paga el software</span>
        </div>
        <div>
          <strong>30 s</strong>
          <span>lo ves funcionando. Después eliges</span>
        </div>
        <div>
          <strong>1 clic</strong>
          <span>un objetivo: entrar al panel</span>
        </div>
      </div>
    </section>

    <p class="promo-bar" role="status">
      Hoy el primer ciclo sale US$ 1. El socio invitado no paga el software.
    </p>

    <section id="promo-video" class="promo-stage">
      <div class="promo-stage-frame">
        <video
          v-if="videoUrl"
          ref="videoEl"
          class="promo-video"
          playsinline
          controls
          :src="videoUrl"
          @ended="reveal"
          @timeupdate="onTime"
        />
        <div v-else class="promo-deck">
          <p class="promo-deck-kicker">{{ deck[deckIndex].kicker }}</p>
          <h2>{{ deck[deckIndex].title }}</h2>
          <p>{{ deck[deckIndex].body }}</p>
        </div>
        <div class="promo-progress"><i :style="{ width: `${progress}%` }" /></div>
        <button v-if="skipReady && !revealed" type="button" class="promo-skip" @click="reveal">
          Saltar · quiero ver el panel
        </button>
      </div>
      <p v-if="!revealed" class="promo-wait">Cuando terminen los 30 segundos, eliges plan y te llevo al registro.</p>
    </section>

    <div v-show="revealed" class="promo-rest">
      <section id="promo-dolor" class="promo-block">
        <p class="promo-kicker">El problema</p>
        <h2>Si tu red todavía vive pegada al WhatsApp, estás operando en modo limitado.</h2>
        <div class="promo-pains">
          <article v-for="item in pains" :key="item.before">
            <p class="is-bad">Hoy</p>
            <h3>{{ item.before }}</h3>
            <p class="is-good">Con el panel</p>
            <p>{{ item.after }}</p>
          </article>
        </div>
        <p class="promo-close">Eso no escala. Eso te desgasta.</p>
      </section>

      <section class="promo-block">
        <p class="promo-kicker">La solución</p>
        <h2>Un panel donde tocas tu tienda, tu página y tu equipo.</h2>
        <p class="promo-lead">
          Todo junto. Todo en el aire. Como si lo tuvieras en la mano. Sin saltar entre chats. Sin depender de capturas.
          Sin caos. REXmlm es el software de tu operación, no la marca de tus productos.
        </p>
        <ul class="promo-sol">
          <li v-for="item in solutions" :key="item">{{ item }}</li>
        </ul>
        <button type="button" class="promo-btn" @click="enterPanel">Ver el panel ahora</button>
      </section>

      <section class="promo-block">
        <p class="promo-kicker">Cómo funciona</p>
        <h2>Así de simple: 30 segundos y decides.</h2>
        <ol class="promo-steps">
          <li v-for="step in steps" :key="step.n">
            <span>{{ step.n }}</span>
            <div>
              <strong>{{ step.title }}</strong>
              <p>{{ step.body }}</p>
            </div>
          </li>
        </ol>
        <button type="button" class="promo-btn" @click="enterPanel">Quiero ver el panel ahora</button>
      </section>

      <section class="promo-block promo-offer">
        <div>
          <p class="promo-kicker">Oferta</p>
          <h2>Entra hoy por US$ 1.</h2>
          <p>
            El primer ciclo sale US$ 1. El socio invitado no paga el software. Así de claro. El reloj no baja el precio:
            el US$ 1 sigue. Es para que dejes el “después lo veo” y entres al panel.
          </p>
          <p class="promo-note">Después eliges plan. Primero compruebas, luego decides.</p>
        </div>
        <div class="promo-timer" :class="{ 'is-dead': !offerAlive }">
          <span>Quedan</span>
          <strong>{{ offerClock }}</strong>
          <em>{{ offerAlive ? 'para ir al registro con el plan elegido' : 'el US$ 1 sigue; la prisa ya pasó' }}</em>
        </div>
      </section>

      <section class="promo-block">
        <p class="promo-kicker">Elige y entra</p>
        <h2>Elige plan. Te mando al registro.</h2>
        <p v-if="!monthly.length" class="promo-lead">Cargando planes… Si no aparecen, recarga. Sin plan no hay alta.</p>
        <div class="promo-plans">
          <button
            v-for="plan in monthly"
            :key="plan.id"
            type="button"
            class="promo-plan"
            :class="{ 'is-on': selectedId === plan.id }"
            @click="selectedId = plan.id"
          >
            <p>{{ plan.recommended ? 'Recomendado' : plan.name }}</p>
            <h3>{{ plan.name }}</h3>
            <p class="promo-price">
              {{ money(plan.intro_price ?? 1, plan.currency) }}
              <small>hoy</small>
            </p>
            <p class="promo-list">{{ money(plan.price, plan.currency) }} / mes desde el ciclo 2</p>
            <ul>
              <li v-for="row in planCatalogRows(plan.entitlements)" :key="row.key" :class="{ 'is-off': !row.included }">
                {{ row.included ? row.label : `${row.label} · mejora` }}
              </li>
            </ul>
            <span class="promo-btn promo-btn-sm" @click.stop="choosePlan(plan)">Entrar al panel – US$ 1</span>
          </button>
        </div>
        <p v-if="selected" class="promo-note">
          Plan marcado: {{ selected.name }}. Al registrarte te llevamos a pagar ese paquete.
        </p>
      </section>

      <section class="promo-block">
        <p class="promo-kicker">Confianza</p>
        <h2>No te pido que confíes a ciegas.</h2>
        <p class="promo-lead">
          Te pido 30 segundos. Entras, lo ves funcionando y después decides. No prometemos ingresos garantizados.
          Mostramos herramienta, orden y control. Si no es para ti, no sigues. Si es para ti, empiezas hoy por US$ 1.
        </p>
        <ul class="promo-sol">
          <li>Sin instalar.</li>
          <li>Sin compromiso de ingresos.</li>
          <li>Primero lo ves.</li>
          <li>Luego eliges.</li>
        </ul>
        <p class="promo-trust-note">
          Paddle cobra el plan y te manda el recibo. No vendemos listas, discado ni tu marca. Si alguien se registra en
          REXmlm por ti y paga el precio de lista del software, te llevas el <strong>20%</strong> de ese cobro. Una sola
          vez.
        </p>
      </section>

      <section class="promo-block">
        <p class="promo-kicker">Preguntas</p>
        <h2>Antes de entrar, esto.</h2>
        <div class="promo-faq">
          <details v-for="item in faqs" :key="item.q">
            <summary>{{ item.q }}</summary>
            <p>{{ item.a }}</p>
          </details>
        </div>
      </section>

      <section class="promo-end">
        <h2>Deja de operar como ayer.</h2>
        <p class="promo-end-lead">Sube al siguiente nivel de tu red. Entra, míralo, decide.</p>
        <button v-if="selected" type="button" class="promo-btn" @click="choosePlan(selected)">
          Entrar al panel – 30 segundos
        </button>
        <p class="promo-note">
          La presentación ya corre. El primer ciclo sale US$ 1. El socio invitado no paga el software.
        </p>
        <p class="promo-legal">
          <RouterLink to="/legal/privacidad">Privacidad</RouterLink>
          ·
          <RouterLink to="/legal/terminos">Términos</RouterLink>
          ·
          <RouterLink to="/legal/reembolsos">Reembolsos</RouterLink>
        </p>
      </section>
    </div>

    <aside v-if="revealed && selected" class="promo-sticky">
      <span>{{ offerAlive ? offerClock : 'US$ 1' }} · {{ selected.name }}</span>
      <button type="button" @click="choosePlan(selected)">Entrar al panel ahora</button>
    </aside>
  </div>
</template>

<style scoped>
.promo {
  --y: #ffd452;
  --ink: #fffdf7;
  --mute: #c4bfb4;
  --bg: #141312;
  min-height: 100svh;
  background:
    radial-gradient(80% 50% at 80% 10%, rgba(255, 212, 82, 0.18), transparent 50%),
    radial-gradient(60% 40% at 10% 80%, rgba(255, 212, 82, 0.08), transparent 45%),
    var(--bg);
  color: var(--ink);
  font-family: Geist, ui-sans-serif, system-ui, sans-serif;
  padding: 1.25rem 1.25rem 6rem;
}

.promo-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1120px;
  margin: 0 auto 2rem;
}

.promo-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  border-radius: 18px;
  background: #252525;
  padding: 0.55rem 0.9rem;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.promo-chip strong {
  font-family: 'IBM Plex Sans Condensed', Geist, sans-serif;
  font-size: 1.35rem;
  letter-spacing: 0;
  text-transform: none;
  color: var(--y);
}

.promo-chip.is-hot {
  box-shadow: 0 0 0 1px var(--y), 0 12px 40px rgba(255, 212, 82, 0.2);
  animation: promo-pulse 1.6s ease-in-out infinite;
}

.promo-hero,
.promo-stage,
.promo-block,
.promo-end {
  max-width: 1120px;
  margin: 0 auto;
}

.promo-bar {
  max-width: 1120px;
  margin: 1.6rem auto 0;
  border-radius: 999px;
  background: var(--y);
  color: #202020;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
  padding: 0.85rem 1.2rem;
}

.promo-kicker {
  margin: 0 0 0.75rem;
  color: var(--y);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.promo-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 1.5rem 2rem;
  align-items: center;
}

.promo-hero-copy {
  min-width: 0;
}

.promo-visual {
  position: relative;
  min-height: 280px;
}

.promo-hero-img {
  display: block;
  width: 100%;
  height: min(520px, 70vh);
  object-fit: cover;
  object-position: 70% 40%;
  border-radius: 28px;
  border: 1px solid rgba(255, 212, 82, 0.22);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
}

.promo-float {
  position: absolute;
  z-index: 2;
  width: 9.2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(20, 18, 28, 0.72);
  backdrop-filter: blur(12px);
  padding: 0.7rem 0.8rem;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  animation: promo-float 5s ease-in-out infinite;
}

.promo-float small {
  display: block;
  color: var(--y);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.promo-float strong {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.95rem;
}

.promo-float em {
  font-style: normal;
  color: var(--mute);
  font-size: 0.75rem;
}

.promo-float-a {
  top: 12%;
  left: -4%;
}

.promo-float-b {
  top: 42%;
  left: 6%;
  animation-delay: -1.6s;
}

.promo-float-c {
  right: 4%;
  bottom: 14%;
  animation-delay: -3s;
}

.promo-hero h1 {
  margin: 0;
  font-family: 'IBM Plex Sans Condensed', Geist, sans-serif;
  font-size: clamp(2.6rem, 8vw, 5.4rem);
  font-weight: 700;
  line-height: 0.92;
  letter-spacing: -0.04em;
}

.promo-hero h1 span {
  display: block;
  background: linear-gradient(90deg, var(--y), #fff1b8 55%, #fe9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.promo-lead,
.promo-note,
.promo-wait,
.promo-legal,
.promo-list {
  color: var(--mute);
}

.promo-lead {
  max-width: 36rem;
  margin: 1.25rem 0 1.5rem;
  font-size: 1.05rem;
  line-height: 1.55;
}

.promo-cta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
}

.promo-btn {
  border: 0;
  border-radius: 999px;
  background: var(--y);
  color: #202020;
  padding: 0.95rem 1.4rem;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 16px 40px rgba(255, 212, 82, 0.28);
}

.promo-btn:hover {
  transform: translateY(-1px);
}

.promo-btn-sm {
  display: inline-flex;
  margin-top: 1rem;
  padding: 0.7rem 1rem;
  font-size: 0.85rem;
}

.promo-stats {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.promo-stats div {
  border: 1px solid rgba(255, 212, 82, 0.2);
  border-radius: 20px;
  background: rgba(255, 253, 247, 0.04);
  padding: 1rem 1.1rem;
}

.promo-stats strong {
  display: block;
  font-family: 'IBM Plex Sans Condensed', Geist, sans-serif;
  font-size: 1.6rem;
  color: var(--y);
}

.promo-stats span {
  color: var(--mute);
  font-size: 0.82rem;
}

.promo-stage {
  margin-top: 2.5rem;
}

.promo-stage-frame {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid rgba(255, 212, 82, 0.28);
  background: #0e0d0c;
  min-height: 280px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
}

.promo-video {
  display: block;
  width: 100%;
  max-height: 70vh;
  background: #000;
}

.promo-deck {
  min-height: 320px;
  padding: 2.5rem 1.75rem;
}

.promo-deck-kicker {
  color: var(--y);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 700;
}

.promo-deck h2 {
  margin: 0.6rem 0 0.8rem;
  font-family: 'IBM Plex Sans Condensed', Geist, sans-serif;
  font-size: clamp(1.8rem, 4vw, 3rem);
}

.promo-progress {
  height: 4px;
  background: #2a2a2a;
}

.promo-progress i {
  display: block;
  height: 100%;
  background: var(--y);
}

.promo-skip {
  position: absolute;
  right: 1rem;
  bottom: 1.2rem;
  border: 0;
  background: transparent;
  color: var(--y);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.8rem;
}

.promo-wait {
  margin: 0.8rem 0 0;
  font-size: 0.9rem;
}

.promo-rest {
  animation: promo-in 0.6s ease;
}

.promo-block {
  margin-top: 3.5rem;
}

.promo-block h2,
.promo-end h2 {
  margin: 0 0 1rem;
  font-family: 'IBM Plex Sans Condensed', Geist, sans-serif;
  font-size: clamp(1.7rem, 4vw, 2.6rem);
  letter-spacing: -0.03em;
}

.promo-pains {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.promo-pains article {
  border-radius: 22px;
  background: #1c1b19;
  padding: 1.15rem 1.2rem;
  border: 1px solid #333;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.promo-pains article:hover {
  transform: translateY(-4px);
  border-color: var(--y);
}

.is-bad,
.is-good {
  margin: 0 0 0.35rem;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.is-bad {
  color: #ff8a80;
}

.is-good {
  margin-top: 0.9rem;
  color: var(--y);
}

.promo-pains h3 {
  margin: 0;
  font-size: 1.05rem;
}

.promo-close {
  margin: 1.4rem 0 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--y);
}

.promo-sol {
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin: 1.2rem 0 1.4rem;
  padding: 0;
  list-style: none;
}

.promo-sol li {
  border-radius: 16px;
  border: 1px solid #3a3a3a;
  background: #1c1b19;
  padding: 0.85rem 1rem;
  font-weight: 600;
}

.promo-steps {
  display: grid;
  gap: 1rem;
  margin: 1.2rem 0 1.5rem;
  padding: 0;
  list-style: none;
}

.promo-steps li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: start;
  border-radius: 20px;
  border: 1px solid #333;
  background: #1c1b19;
  padding: 1.1rem 1.2rem;
}

.promo-steps span {
  font-family: 'IBM Plex Sans Condensed', Geist, sans-serif;
  font-size: 1.6rem;
  color: var(--y);
  line-height: 1;
}

.promo-steps strong {
  display: block;
  margin-bottom: 0.35rem;
}

.promo-steps p {
  margin: 0;
  color: var(--mute);
}

.promo-faq {
  display: grid;
  gap: 0.65rem;
}

.promo-faq details {
  border-radius: 16px;
  border: 1px solid #333;
  background: #1c1b19;
  padding: 0.85rem 1.1rem;
}

.promo-faq summary {
  cursor: pointer;
  font-weight: 700;
}

.promo-faq p {
  margin: 0.7rem 0 0;
  color: var(--mute);
  line-height: 1.5;
}

.promo-trust-note {
  margin: 1.2rem 0 0;
  color: var(--mute);
  line-height: 1.55;
}

.promo-trust-note strong {
  color: var(--y);
}

.promo-legal {
  margin: 1.4rem 0 0;
  font-size: 0.85rem;
  color: var(--mute);
}

.promo-legal a {
  color: var(--ink);
}

.promo-offer {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: center;
}

.promo-timer {
  text-align: center;
  border-radius: 24px;
  background: var(--y);
  color: #202020;
  padding: 1.4rem 1rem;
}

.promo-timer strong {
  display: block;
  font-family: 'IBM Plex Sans Condensed', Geist, sans-serif;
  font-size: 3rem;
  line-height: 1;
}

.promo-timer.is-dead {
  background: #2a2a2a;
  color: var(--ink);
}

.promo-plans {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.promo-plan {
  text-align: left;
  border-radius: 24px;
  border: 1px solid #3a3a3a;
  background: #1a1917;
  color: inherit;
  padding: 1.2rem;
  cursor: pointer;
}

.promo-plan.is-on {
  border-color: var(--y);
  box-shadow: 0 0 0 1px var(--y);
}

.promo-plan h3 {
  margin: 0.2rem 0;
  font-family: 'IBM Plex Sans Condensed', Geist, sans-serif;
  font-size: 1.6rem;
}

.promo-price {
  margin: 0.4rem 0 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--y);
}

.promo-plan ul {
  margin: 0.8rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
  color: var(--mute);
}

.promo-plan li.is-off {
  color: #ff8a80;
}

.promo-end {
  margin-top: 3rem;
  padding: 2rem 0 1rem;
  text-align: center;
}

.promo-end-lead {
  max-width: 38rem;
  margin: 0 auto 0.85rem;
  color: var(--mute);
  line-height: 1.55;
}

.promo-end-lead strong {
  color: var(--y);
}

@keyframes promo-float {
  50% {
    transform: translateY(-8px);
  }
}

.promo-sticky {
  position: fixed;
  left: 50%;
  bottom: 1rem;
  z-index: 40;
  display: flex;
  gap: 1rem;
  align-items: center;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #252525;
  color: var(--ink);
  padding: 0.55rem 0.55rem 0.55rem 1.1rem;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.45);
}

.promo-sticky button {
  border: 0;
  border-radius: 999px;
  background: var(--y);
  color: #202020;
  font-weight: 700;
  padding: 0.7rem 1rem;
  cursor: pointer;
}

@keyframes promo-pulse {
  50% {
    transform: scale(1.03);
  }
}

@keyframes promo-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}

@media (max-width: 800px) {
  .promo-hero,
  .promo-stats,
  .promo-offer {
    grid-template-columns: 1fr;
  }

  .promo-float-a,
  .promo-float-b {
    display: none;
  }

  .promo-hero-img {
    height: 320px;
  }

  .promo-sticky {
    width: calc(100% - 1.5rem);
    justify-content: space-between;
  }
}
</style>
