<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import SoftButton from '@/components/ui/SoftButton.vue'
import { dinoTours, isLightTone, tourIdForRoute, tourToneVars } from '@/data/dinoTours'
import { useAuthStore } from '@/stores/auth'
import { useDinoTourStore } from '@/stores/dinoTour'

const DINO_SRC = '/gif/dino.gif'
const PAD = 10

const route = useRoute()
const tour = useDinoTourStore()
const auth = useAuthStore()
const { active, current, index, total, isFirst, isLast, tone, tourId } = storeToRefs(tour)
const { isPartnerOnly } = storeToRefs(auth)

const spot = ref<{ top: number; left: number; width: number; height: number } | null>(null)
const guideLeft = ref(false)

const pageTourId = computed(() => tourIdForRoute(route.name, isPartnerOnly.value))
const palette = computed(() => tourToneVars[tone.value])
const light = computed(() => isLightTone(tone.value))
const pagePalette = computed(() =>
  pageTourId.value ? tourToneVars[dinoTours[pageTourId.value].tone] : tourToneVars.green,
)
const pageLauncher = computed(() =>
  pageTourId.value ? dinoTours[pageTourId.value].launcher : '¿Te explico?',
)

const showLauncher = computed(() => {
  const id = pageTourId.value
  return Boolean(id) && !active.value && tour.hasSeen(id as NonNullable<typeof id>)
})

const themeStyle = computed(() => ({
  '--dino-bubble': palette.value.bubble,
  '--dino-ink': palette.value.ink,
  '--dino-shadow': palette.value.shadow,
}))

const launcherStyle = computed(() => ({
  '--dino-bubble': pagePalette.value.bubble,
  '--dino-ink': pagePalette.value.ink,
}))

const spotStyle = computed(() => {
  if (!spot.value) {
    return { display: 'none' }
  }

  return {
    top: `${spot.value.top}px`,
    left: `${spot.value.left}px`,
    width: `${spot.value.width}px`,
    height: `${spot.value.height}px`,
    outlineColor: palette.value.bubble,
  }
})

function queryTarget(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-tour="${name}"]`)
}

async function measure(): Promise<void> {
  const step = current.value
  if (!step || !active.value) {
    spot.value = null
    return
  }

  await nextTick()
  const el = queryTarget(step.target)

  if (!el) {
    if (step.optional) {
      tour.next()
      return
    }
    spot.value = null
    guideLeft.value = false
    return
  }

  const mobile = window.matchMedia('(max-width: 640px)').matches
  el.scrollIntoView({
    behavior: 'smooth',
    block: mobile ? 'start' : 'nearest',
    inline: 'nearest',
  })
  await new Promise((resolve) => window.setTimeout(resolve, 280))

  const rect = el.getBoundingClientRect()
  const reserveBottom = mobile ? 290 : 12
  const maxBottom = window.innerHeight - reserveBottom
  const top = Math.max(8, Math.min(rect.top - PAD, maxBottom - 72))
  const left = Math.max(8, rect.left - PAD)
  const width = Math.min(window.innerWidth - left - 8, rect.width + PAD * 2)
  const height = Math.max(48, Math.min(maxBottom - top, rect.height + PAD * 2))

  spot.value = { top, left, width, height }
  guideLeft.value = rect.left + rect.width / 2 > window.innerWidth * 0.55
}

function onKey(event: KeyboardEvent): void {
  if (!active.value) {
    return
  }
  if (event.key === 'Escape') {
    tour.stop()
  }
  if (event.key === 'ArrowRight' || event.key === 'Enter') {
    event.preventDefault()
    tour.next()
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    tour.prev()
  }
}

function queueStart(): void {
  const id = pageTourId.value
  if (!id || String(route.name) === 'dashboard') {
    return
  }

  window.setTimeout(() => {
    if (pageTourId.value === id) {
      tour.maybeStart(id)
    }
  }, 480)
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', measure)
  document.querySelector('main')?.addEventListener('scroll', measure, { passive: true })
  queueStart()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', measure)
  document.querySelector('main')?.removeEventListener('scroll', measure)
})

watch(
  () => [active.value, current.value?.id, current.value?.panel],
  () => {
    void measure()
  },
  { flush: 'post' },
)

watch(
  () => String(route.name ?? ''),
  (name) => {
    if (active.value) {
      const nextId = tourIdForRoute(name, isPartnerOnly.value)
      if (nextId !== tourId.value) {
        tour.stop()
      }
    }
    queueStart()
  },
)
</script>

<template>
  <button
    v-if="showLauncher && pageTourId"
    type="button"
    class="dino-launcher"
    :style="launcherStyle"
    :title="pageLauncher"
    @click="tour.replay(pageTourId)"
  >
    <img :src="DINO_SRC" alt="" width="112" height="112" />
    <span>{{ pageLauncher }}</span>
  </button>

  <Teleport to="body">
    <div
      v-if="active && current"
      class="dino-root"
      :class="{ 'is-light': light }"
      :style="themeStyle"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="'dino-title'"
    >
      <div class="dino-mask" @click="tour.next()" />
      <div class="dino-spot" :style="spotStyle" />

      <div class="dino-guide" :class="guideLeft ? 'is-left' : 'is-right'">
        <div class="dino-bubble">
          <p class="dino-step">{{ index + 1 }} / {{ total }}</p>
          <h2 id="dino-title" class="dino-title">{{ current.title }}</h2>
          <p class="dino-body">{{ current.body }}</p>
          <div class="dino-actions">
            <button type="button" class="dino-skip" @click="tour.stop()">Saltar</button>
            <div class="dino-nav">
              <SoftButton v-if="!isFirst" variant="outline" @click="tour.prev()">Atrás</SoftButton>
              <SoftButton :variant="light ? 'charcoal' : 'yellow'" @click="tour.next()">
                {{ isLast ? 'Listo' : 'Siguiente' }}
              </SoftButton>
            </div>
          </div>
        </div>
        <img class="dino-gif" :src="DINO_SRC" alt="Rex pensando" width="240" height="240" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dino-launcher {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 40;
  display: flex;
  align-items: flex-end;
  gap: 0.35rem;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--color-ink);
}

.dino-launcher img {
  width: 96px;
  height: 96px;
  object-fit: contain;
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.28));
}

.dino-launcher span {
  margin-bottom: 0.6rem;
  max-width: 9.5rem;
  border-radius: 16px;
  background: var(--dino-bubble, #3ecf4a);
  padding: 0.45rem 0.7rem;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--dino-ink, #fff);
  box-shadow: 0 8px 18px -8px rgba(0, 0, 0, 0.35);
}

.dino-root {
  position: fixed;
  inset: 0;
  z-index: 70;
}

.dino-mask {
  position: absolute;
  inset: 0;
}

.dino-spot {
  position: fixed;
  z-index: 71;
  border-radius: 22px;
  box-shadow: 0 0 0 9999px rgba(12, 14, 18, 0.62);
  outline: 3px solid var(--dino-bubble, #3ecf4a);
  outline-offset: 2px;
  pointer-events: none;
  transition:
    top 0.28s ease,
    left 0.28s ease,
    width 0.28s ease,
    height 0.28s ease,
    outline-color 0.28s ease;
}

.dino-guide {
  position: fixed;
  z-index: 72;
  display: flex;
  align-items: flex-end;
  gap: 0.15rem;
  max-width: min(36rem, calc(100vw - 1.5rem));
  pointer-events: auto;
}

.dino-guide.is-right {
  right: 0.75rem;
  bottom: 0.75rem;
  flex-direction: row;
}

.dino-guide.is-left {
  left: 0.75rem;
  bottom: 0.75rem;
  flex-direction: row-reverse;
}

.dino-bubble {
  position: relative;
  max-width: 22rem;
  border-radius: 22px;
  background: var(--dino-bubble, #3ecf4a);
  padding: 1rem 1.1rem 0.9rem;
  color: var(--dino-ink, #fff);
  box-shadow: 0 16px 32px -16px var(--dino-shadow, rgba(20, 90, 30, 0.7));
}

.dino-guide.is-right .dino-bubble::after {
  content: '';
  position: absolute;
  right: -10px;
  bottom: 108px;
  border: 10px solid transparent;
  border-left-color: var(--dino-bubble, #3ecf4a);
}

.dino-guide.is-left .dino-bubble::after {
  content: '';
  position: absolute;
  left: -10px;
  bottom: 108px;
  border: 10px solid transparent;
  border-right-color: var(--dino-bubble, #3ecf4a);
}

.dino-step {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.85;
}

.dino-title {
  margin: 0.35rem 0 0;
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.dino-body {
  margin: 0.45rem 0 0;
  font-size: 0.9rem;
  line-height: 1.45;
}

.dino-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-top: 0.9rem;
}

.dino-skip {
  border: 0;
  background: transparent;
  padding: 0;
  font-size: 0.8rem;
  color: inherit;
  opacity: 0.85;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.dino-nav {
  display: flex;
  gap: 0.4rem;
}

.dino-gif {
  width: 240px;
  height: auto;
  flex-shrink: 0;
  object-fit: contain;
  filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.28));
}

@media (max-width: 640px) {
  .dino-launcher {
    right: 0.65rem;
    bottom: max(0.65rem, env(safe-area-inset-bottom));
  }

  .dino-launcher img {
    width: 72px;
    height: 72px;
  }

  .dino-launcher span {
    display: none;
  }

  .dino-spot {
    border-radius: 16px;
    outline-width: 2px;
  }

  .dino-guide.is-right,
  .dino-guide.is-left {
    left: 0.75rem;
    right: 0.75rem;
    bottom: max(0.75rem, env(safe-area-inset-bottom));
    max-width: none;
    flex-direction: column;
    align-items: stretch;
    padding-top: 72px;
  }

  .dino-gif {
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 2;
    width: 132px;
    margin: 0;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .dino-bubble {
    width: 100%;
    max-width: none;
    border-radius: 24px;
    padding: 3.1rem 1.05rem 1rem;
  }

  .dino-guide.is-right .dino-bubble::after,
  .dino-guide.is-left .dino-bubble::after {
    left: 50%;
    right: auto;
    bottom: auto;
    top: 100%;
    border: 12px solid transparent;
    border-top-color: var(--dino-bubble, #3ecf4a);
    border-left-color: transparent;
    border-right-color: transparent;
    transform: translateX(-50%);
  }

  .dino-step {
    font-size: 10px;
  }

  .dino-title {
    font-size: 1.2rem;
  }

  .dino-body {
    font-size: 0.84rem;
    line-height: 1.4;
  }

  .dino-actions {
    margin-top: 1rem;
    gap: 0.75rem;
  }

  .dino-skip {
    min-height: 44px;
    padding: 0.35rem 0.2rem;
    font-size: 0.9rem;
  }

  .dino-nav :deep(button) {
    min-height: 44px;
    padding-inline: 1.15rem;
  }
}
</style>
