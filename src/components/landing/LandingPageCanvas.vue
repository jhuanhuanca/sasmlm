<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import LandingHotspot from '@/components/landing/LandingHotspot.vue'
import LandingIncomeTest from '@/components/landing/LandingIncomeTest.vue'
import LandingPhone from '@/components/landing/LandingPhone.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { CompanyBrand, LandingBlock, LandingEditField, LandingPhotoFrame, LandingSummary } from '@/types/auth'
import { DEFAULT_LANDING_BENEFITS, isLandingPhotoFrame } from '@/data/landingLooks'
import { landingThemeVars } from '@/utils/brand'
import { firstName } from '@/utils/format'
import { looksLikePhoneLabel, whatsappUrl } from '@/utils/whatsapp'
import '@/styles/landing.css'

const props = withDefaults(
  defineProps<{
    landing: LandingSummary | null
    brand?: CompanyBrand | null
    leader: string
    storeSlug: string
    whatsapp: string
    editable?: boolean
    activeField?: string | null
  }>(),
  {
    brand: null,
    editable: false,
    activeField: null,
  },
)

const emit = defineEmits<{
  edit: [field: LandingEditField]
}>()

const DEFAULT_HERO =
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80'
const DEFAULT_REASONS =
  'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80'

const menuOpen = ref(false)
const scrolled = ref(false)
const section = ref<'home' | 'test'>('home')

const hero = computed(() => props.landing?.content?.hero)
const reasons = computed(() => props.landing?.content?.reasons)
const blocks = computed<LandingBlock[]>(() => props.landing?.content?.blocks ?? [])
const pageTitle = computed(() => props.landing?.title?.trim() || '')
const placeholders = computed(() => Boolean(props.editable))
const kicker = computed(() => hero.value?.kicker?.trim() || (placeholders.value ? 'We Created' : ''))
const headline = computed(() => hero.value?.title?.trim() || (placeholders.value ? 'Revolución en tus ingresos' : ''))
const subtitle = computed(() => {
  const custom = hero.value?.subtitle?.trim()
  if (custom) {
    return custom
  }
  if (!placeholders.value) {
    return ''
  }
  return `${firstName(props.leader)} te abre una red y una tienda propia: deja de cambiar horas por un sueldo fijo.`
})
const shopLabel = computed(() => {
  const custom = hero.value?.cta_label?.trim() || ''
  if (custom && !looksLikePhoneLabel(custom)) {
    return custom
  }
  const name = firstName(props.leader)
  return name ? `Conversa con ${name}` : 'Conversemos'
})
const waLabel = computed(() => {
  const custom = props.landing?.content?.whatsapp_label?.trim() || ''
  if (custom) {
    return custom
  }
  const name = props.leader.trim()
  return name ? `Hablar con ${name}` : 'Hablar por WhatsApp'
})
const phonePhoto = computed(() => safeImage(hero.value?.photo))
const heroBackground = computed(
  () => safeImage(hero.value?.background) || phonePhoto.value || (placeholders.value ? DEFAULT_HERO : ''),
)
const heroImage = computed(() => phonePhoto.value || (placeholders.value ? DEFAULT_HERO : ''))
const reasonsImage = computed(() => safeImage(reasons.value?.photo) || (placeholders.value ? DEFAULT_REASONS : ''))
const reasonsKicker = computed(() => reasons.value?.kicker?.trim() || (placeholders.value ? 'Reasons' : ''))
const reasonsTitle = computed(() => {
  const custom = reasons.value?.title?.trim()
  if (custom) {
    return custom
  }
  if (!placeholders.value) {
    return ''
  }
  return `¿Por qué la red de ${firstName(props.leader) || 'este líder'}?`
})
const reasonsBody = computed(() => {
  const custom = reasons.value?.body?.trim()
  if (custom) {
    return custom
  }
  if (!placeholders.value) {
    return ''
  }
  return 'No es solo una tienda. Es la vitrina del líder y una red donde cada socio puede vender, invitar y escalar sin cambiar horas por un sueldo plano.'
})
const reasonsBenefits = computed(() => {
  const items = (reasons.value?.benefits ?? []).map((item) => item.trim()).filter(Boolean)
  return items.length ? items : DEFAULT_LANDING_BENEFITS
})
const heroPhotoStyle = computed(() =>
  isSafeImageUrl(heroBackground.value) ? { '--lp-hero-photo': `url("${heroBackground.value}")` } : {},
)
const extraBlocks = computed(() =>
  blocks.value.flatMap((block, index) => {
    if (block.type === 'image' && !isSafeImageUrl(block.path)) {
      return []
    }
    if (props.editable || Boolean(block.body?.trim()) || (block.type === 'image' && block.path)) {
      return [{ block, index }]
    }
    return []
  }),
)
const waMessage = computed(() => `Hola ${props.leader || ''}, vi tu landing y quiero más información.`)
const waHref = computed(() => whatsappUrl(props.whatsapp, waMessage.value))
const shopTo = computed(() => ({ name: 'public-store' as const, params: { slug: props.storeSlug } }))
const themeVars = computed(() => landingThemeVars(props.brand, props.landing?.content?.palette))
const photoFrame = computed<LandingPhotoFrame>(() =>
  isLandingPhotoFrame(hero.value?.frame) ? hero.value.frame : 'phone',
)
const pageLogo = computed(() => {
  const custom = props.landing?.content?.logo?.trim()
  if (custom && isSafeImageUrl(custom)) {
    return custom
  }
  return props.brand?.logo || ''
})
const companyName = computed(() => props.brand?.name || '')

function safeImage(value: string | null | undefined): string {
  const photo = value?.trim() ?? ''
  return photo && isSafeImageUrl(photo) ? photo : ''
}

function isSafeImageUrl(value: string | null | undefined): value is string {
  const raw = value?.trim() ?? ''
  if (!raw) {
    return false
  }
  return /^https?:\/\//i.test(raw) || raw.startsWith('/storage/') || /^data:image\//i.test(raw)
}

function isActive(field: string): boolean {
  return props.editable && props.activeField === field
}

function edit(field: LandingEditField): void {
  if (props.editable) {
    emit('edit', field)
  }
}

function goSection(id: 'home' | 'test'): void {
  section.value = id
  menuOpen.value = false
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let observer: IntersectionObserver | null = null

function onScroll(event?: Event): void {
  const target = event?.currentTarget
  if (target instanceof HTMLElement) {
    scrolled.value = target.scrollTop > 18
    return
  }
  scrolled.value = window.scrollY > 18
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((entry) => entry.isIntersecting)
      if (visible?.target.id === 'home' || visible?.target.id === 'test') {
        section.value = visible.target.id as 'home' | 'test'
      }
    },
    { rootMargin: '-35% 0px -50% 0px', threshold: 0.1 },
  )

  const home = document.getElementById('home')
  const test = document.getElementById('test')
  if (home) {
    observer.observe(home)
  }
  if (test) {
    observer.observe(test)
  }
})

onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="lp-root" :class="{ 'is-studio': editable }" :style="themeVars">
    <header class="lp-nav" :class="{ 'is-scrolled': scrolled, 'is-open': menuOpen }">
      <div class="lp-wrap">
        <div class="lp-nav-row">
          <a class="lp-brand" href="#home" @click.prevent="!editable && goSection('home')">
            <LandingHotspot
              hint="Cambiar logo"
              bare
              :editable="editable"
              :active="isActive('logo')"
              @edit="edit('logo')"
            >
              <span class="lp-mark" :class="{ 'is-logo': pageLogo }">
                <img v-if="pageLogo" :src="pageLogo" alt="" />
                <AppIcon v-else name="play" :size="14" />
              </span>
            </LandingHotspot>
            <LandingHotspot hint="Cambiar nombre" :editable="editable" :active="isActive('title')" @edit="edit('title')">
              <span class="min-w-0 text-left">
                <strong class="truncate">{{ pageTitle || leader || 'REXmlm' }}</strong>
                <small>{{ companyName || 'Mobile Revolution' }}</small>
              </span>
            </LandingHotspot>
          </a>

          <nav class="lp-menu">
            <button type="button" class="lp-link" :class="{ 'is-active': section === 'home' }" @click="goSection('home')">
              Inicio
            </button>
            <button type="button" class="lp-link" :class="{ 'is-active': section === 'test' }" @click="goSection('test')">
              Test
            </button>
            <RouterLink v-if="!editable" :to="shopTo" class="lp-link">Tienda</RouterLink>
            <span v-else class="lp-link">Tienda</span>
          </nav>

          <LandingHotspot hint="Cambiar texto y WhatsApp" :editable="editable" :active="isActive('whatsapp')" @edit="edit('whatsapp')">
            <a
              v-if="!editable"
              :href="waHref"
              class="lp-shop-btn"
              target="_blank"
              rel="noreferrer"
            >
              <AppIcon name="whatsapp" :size="14" />
              {{ waLabel }}
            </a>
            <span v-else class="lp-shop-btn">
              <AppIcon name="whatsapp" :size="14" />
              {{ waLabel }}
            </span>
          </LandingHotspot>

          <button type="button" class="lp-burger" aria-label="Menú" @click="menuOpen = !menuOpen">
            <AppIcon :name="menuOpen ? 'close' : 'menu'" :size="18" />
          </button>
        </div>

        <div v-if="menuOpen" class="lp-mobile-menu">
          <button type="button" class="lp-link is-active" @click="goSection('home')">Inicio</button>
          <button type="button" class="lp-link" @click="goSection('test')">Test</button>
          <RouterLink v-if="!editable" :to="shopTo" class="lp-link" @click="menuOpen = false">Tienda</RouterLink>
        </div>
      </div>
    </header>

    <section id="home" class="lp-hero" :style="heroPhotoStyle">
      <button
        v-if="editable"
        type="button"
        class="lp-bg-edit"
        :class="{ 'is-active': isActive('background') }"
        @click="edit('background')"
      >
        Cambiar fondo
      </button>
      <div class="lp-wrap lp-hero-grid">
        <LandingPhone
          v-if="heroImage"
          :image="heroImage"
          :href="editable ? '' : waHref"
          :label="shopLabel"
          :frame="photoFrame"
          :hint="photoFrame === 'phone' ? 'Cambiar foto del celular' : 'Cambiar foto'"
          :editable="editable"
          :active="isActive('photo')"
          @edit="edit('photo')"
        />

        <div>
          <LandingHotspot
            hint="Cambiar 'We Created'"
            :editable="editable"
            :active="isActive('kicker')"
            @edit="edit('kicker')"
          >
            <p class="lp-kicker">{{ kicker }}</p>
          </LandingHotspot>
          <LandingHotspot
            hint="Cambiar titular"
            block
            :editable="editable"
            :active="isActive('headline')"
            @edit="edit('headline')"
          >
            <h1 class="lp-title font-display">{{ headline }}</h1>
          </LandingHotspot>
          <LandingHotspot
            hint="Cambiar subtítulo"
            block
            :editable="editable"
            :active="isActive('subtitle')"
            @edit="edit('subtitle')"
          >
            <p class="lp-lead">{{ subtitle }}</p>
          </LandingHotspot>
          <div class="lp-cta-row">
            <button type="button" class="lp-pill is-challenge" @click="goSection('test')">
              ¿Aceptas el reto?
            </button>
            <LandingHotspot hint="Cambiar texto del botón" :editable="editable" :active="isActive('cta')" @edit="edit('cta')">
              <a v-if="!editable" :href="waHref" class="lp-pill is-yellow" target="_blank" rel="noreferrer">
                {{ shopLabel }}
              </a>
              <span v-else class="lp-pill is-yellow">{{ shopLabel }}</span>
            </LandingHotspot>
          </div>
        </div>
      </div>
    </section>

    <section v-if="extraBlocks.length || editable" class="lp-section">
      <div class="lp-wrap lp-blocks">
        <p v-if="editable && !extraBlocks.length" class="lp-block-text text-muted">
          Aún no hay bloques extra. Úsalos para un texto, otra foto o un botón a tu tienda.
        </p>
        <template v-for="{ block, index } in extraBlocks" :key="`${block.type}-${index}`">
          <LandingHotspot
            :hint="block.type === 'image' ? 'Cambiar imagen' : 'Editar este bloque'"
            block
            :editable="editable"
            :active="isActive(`block:${index}`)"
            @edit="edit(`block:${index}`)"
          >
            <p v-if="block.type === 'text'" class="lp-block-text">{{ block.body || 'Texto del bloque' }}</p>
            <figure v-else-if="block.type === 'image' && block.path" class="lp-block-image">
              <img :src="block.path" alt="" />
            </figure>
            <div v-else-if="block.type === 'store_cta'" class="lp-block-cta">
              <RouterLink v-if="!editable" :to="shopTo" class="lp-pill is-yellow">
                {{ block.body?.trim() || 'Ir a la tienda' }}
              </RouterLink>
              <span v-else class="lp-pill is-yellow">{{ block.body?.trim() || 'Ir a la tienda' }}</span>
            </div>
          </LandingHotspot>
        </template>
        <button
          v-if="editable"
          type="button"
          class="lp-pill is-challenge"
          @click="edit('blocks')"
        >
          Añadir bloque
        </button>
      </div>
    </section>

    <section id="test" class="lp-section lp-test">
      <div class="lp-wrap text-center">
        <p class="lp-label"><i /> Test de ingresos</p>
        <h2 class="lp-h2 font-display">Descubre cuánto vale tu hora</h2>
        <p class="lp-copy mx-auto">
          Acepta el reto y calcula el valor real de tu tiempo de trabajo.
        </p>
        <LandingIncomeTest :leader="leader || 'este líder'" :whatsapp="whatsapp" />
      </div>
    </section>

    <section class="lp-section">
      <div class="lp-wrap lp-reasons">
        <LandingPhone
          v-if="reasonsImage"
          :image="reasonsImage"
          :href="editable ? '' : waHref"
          :label="shopLabel"
          :frame="photoFrame"
          hint="Cambiar segunda foto"
          :editable="editable"
          :active="isActive('reasons_photo')"
          @edit="edit('reasons_photo')"
        />
        <div>
          <LandingHotspot
            hint="Cambiar rótulo"
            :editable="editable"
            :active="isActive('reasons_kicker')"
            @edit="edit('reasons_kicker')"
          >
            <p class="lp-label"><i /> {{ reasonsKicker }}</p>
          </LandingHotspot>
          <LandingHotspot
            hint="Cambiar título"
            block
            :editable="editable"
            :active="isActive('reasons_title')"
            @edit="edit('reasons_title')"
          >
            <h2 class="lp-h2 font-display">{{ reasonsTitle }}</h2>
          </LandingHotspot>
          <LandingHotspot
            hint="Cambiar texto"
            block
            :editable="editable"
            :active="isActive('reasons_body')"
            @edit="edit('reasons_body')"
          >
            <p class="lp-copy">{{ reasonsBody }}</p>
          </LandingHotspot>
          <LandingHotspot
            hint="Cambiar beneficios"
            block
            :editable="editable"
            :active="isActive('reasons_benefits')"
            @edit="edit('reasons_benefits')"
          >
            <ul class="lp-benefits">
              <li v-for="item in reasonsBenefits" :key="item" class="lp-benefit">
                <span class="lp-check"><AppIcon name="check" :size="14" /></span>
                {{ item }}
              </li>
            </ul>
          </LandingHotspot>
          <div class="lp-cta-row">
            <LandingHotspot hint="Cambiar texto y WhatsApp" :editable="editable" :active="isActive('whatsapp')" @edit="edit('whatsapp')">
              <a v-if="!editable" :href="waHref" class="lp-pill is-dark" target="_blank" rel="noreferrer">
                <AppIcon name="whatsapp" :size="16" />
                {{ waLabel }}
              </a>
              <span v-else class="lp-pill is-dark">
                <AppIcon name="whatsapp" :size="16" />
                {{ waLabel }}
              </span>
            </LandingHotspot>
          </div>
        </div>
      </div>
    </section>

    <footer class="lp-footer">
      <div class="lp-wrap flex flex-wrap items-center justify-between gap-3">
        <p>{{ pageTitle || leader }} · Landing oficial</p>
        <a v-if="!editable" :href="waHref" target="_blank" rel="noreferrer">{{ waLabel }}</a>
      </div>
    </footer>

    <aside v-if="!editable" class="cz_switcher" aria-label="Accesos rápidos">
      <button type="button" @click="goSection('home')">
        <AppIcon name="home" :size="18" />
        <span>Inicio</span>
      </button>
      <button type="button" @click="goSection('test')">
        <AppIcon name="zap" :size="18" />
        <span>Test</span>
      </button>
      <RouterLink :to="shopTo">
        <AppIcon name="bag" :size="18" />
        <span>Tienda</span>
      </RouterLink>
    </aside>
  </div>
</template>
