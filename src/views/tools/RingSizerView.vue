<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import { useCompanyToolGate } from '@/composables/useCompanyToolGate'
import {
  CREDIT_CARD_HEIGHT_MM,
  CREDIT_CARD_WIDTH_MM,
  RING_RANGE,
  chartForGender,
  nearestRingSize,
  type RingGender,
  type RingSizeRow,
} from '@/data/ringSizes'

useCompanyToolGate('ring_sizer')

type Workspace = 'sizer' | 'ar'
type SizerMode = 'ring' | 'finger' | 'chart'
type ArPiece = 'anillo' | 'aretes' | 'collar' | 'pulsera'

const workspace = ref<Workspace>('sizer')
const mode = ref<SizerMode>('ring')
const gender = ref<RingGender>('mujer')
const diameter = ref(RING_RANGE.mujer.initial)
const result = ref<RingSizeRow | null>(null)
const calibrating = ref(false)
const cardScale = ref(1)
const fallbackPxPerMm = 96 / 25.4
const calibratedPxPerMm = ref<number | null>(null)

const arPiece = ref<ArPiece>('anillo')
const arPieces: ArPiece[] = ['anillo', 'aretes', 'collar', 'pulsera']
const videoEl = ref<HTMLVideoElement | null>(null)
const fileEl = ref<HTMLInputElement | null>(null)
const cameraError = ref('')
const photo = ref('')
const overlayX = ref(50)
const overlayY = ref(42)
const overlayScale = ref(1)
const dragging = ref(false)
let mediaStream: MediaStream | null = null

const range = computed(() => RING_RANGE[gender.value])
const pxPerMm = computed(() => calibratedPxPerMm.value ?? fallbackPxPerMm)
const circlePx = computed(() => Math.max(24, diameter.value * pxPerMm.value))
const fingerGap = computed(() => Math.max(16, diameter.value * pxPerMm.value))
const chart = computed(() => chartForGender(gender.value))
const cardWidthPx = computed(() => CREDIT_CARD_WIDTH_MM * fallbackPxPerMm * cardScale.value)
const cardHeightPx = computed(() => CREDIT_CARD_HEIGHT_MM * fallbackPxPerMm * cardScale.value)

watch(gender, (next) => {
  const nextRange = RING_RANGE[next]
  diameter.value = Math.min(nextRange.max, Math.max(nextRange.min, diameter.value))
  result.value = null
})

watch(diameter, () => {
  result.value = null
})

function showSize(): void {
  result.value = nearestRingSize(diameter.value)
}

function applyCalibration(): void {
  const renderedWidth = CREDIT_CARD_WIDTH_MM * fallbackPxPerMm * cardScale.value
  calibratedPxPerMm.value = renderedWidth / CREDIT_CARD_WIDTH_MM
  calibrating.value = false
}

function resetCalibration(): void {
  calibratedPxPerMm.value = null
  cardScale.value = 1
}

async function startCamera(): Promise<void> {
  cameraError.value = ''
  stopCamera()
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = 'Este dispositivo no permite cámara. Sube una foto.'
    return
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    })
    if (videoEl.value) {
      videoEl.value.srcObject = mediaStream
      await videoEl.value.play()
    }
  } catch {
    cameraError.value = 'No se pudo abrir la cámara. Permite el acceso o sube una foto.'
  }
}

function stopCamera(): void {
  mediaStream?.getTracks().forEach((track) => track.stop())
  mediaStream = null
  if (videoEl.value) {
    videoEl.value.srcObject = null
  }
}

function captureFrame(): void {
  const video = videoEl.value
  if (!video || video.videoWidth === 0) {
    return
  }

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }
  ctx.drawImage(video, 0, 0)
  photo.value = canvas.toDataURL('image/jpeg', 0.9)
  stopCamera()
}

function onPhotoFile(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    photo.value = String(reader.result || '')
    stopCamera()
  }
  reader.readAsDataURL(file)
}

function clearPhoto(): void {
  photo.value = ''
  overlayX.value = 50
  overlayY.value = 42
  overlayScale.value = 1
}

function onOverlayPointerDown(event: PointerEvent): void {
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onOverlayPointerMove(event: PointerEvent): void {
  if (!dragging.value) {
    return
  }
  const stage = (event.currentTarget as HTMLElement).closest('[data-ar-stage]') as HTMLElement | null
  if (!stage) {
    return
  }
  const box = stage.getBoundingClientRect()
  overlayX.value = Math.min(92, Math.max(8, ((event.clientX - box.left) / box.width) * 100))
  overlayY.value = Math.min(92, Math.max(8, ((event.clientY - box.top) / box.height) * 100))
}

function onOverlayPointerUp(): void {
  dragging.value = false
}

onMounted(() => {
  if (workspace.value === 'ar') {
    void startCamera()
  }
})

watch(workspace, (next) => {
  if (next === 'ar' && !photo.value) {
    void startCamera()
    return
  }
  stopCamera()
})

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<template>
  <div class="mx-auto max-w-xl">
    <RouterLink to="/app/tools" class="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
      <span class="rotate-180"><AppIcon name="chevron" :size="14" /></span>
      Herramientas
    </RouterLink>

    <ModuleBanner
      class="mt-4"
      icon="star"
      eyebrow="Herramientas"
      title="Medidor de anillos"
      body="Mide la talla con un anillo que ya calce o con el dedo. Sirve para mujer y hombre. La prueba AR es orientativa: coloca la pieza sobre una foto."
      :actions="[
        'Calibra con una tarjeta si quieres 1:1 en pantalla.',
        'Elige mujer u hombre para el rango de tallas.',
        'Por anillo, por dedo o consulta la tabla.',
        'En AR prueba anillo, aretes, collar o pulsera.',
      ]"
    />

    <div class="mt-5 flex justify-center">
      <div class="inline-flex rounded-full bg-shell p-1">
        <button type="button" class="ws-tab" :class="{ 'is-on': workspace === 'sizer' }" @click="workspace = 'sizer'">
          Medidor
        </button>
        <button type="button" class="ws-tab" :class="{ 'is-on': workspace === 'ar' }" @click="workspace = 'ar'">
          Probar AR
        </button>
      </div>
    </div>

    <SoftCard v-if="workspace === 'sizer'" :padded="false" class="mt-5 overflow-hidden">
      <div class="px-5 py-6 sm:px-8">
        <h2 class="font-display text-center text-2xl tracking-tight">Averigua tu talla de anillo</h2>

        <div class="mt-4 flex justify-center gap-2">
          <button type="button" class="chip" :class="{ 'is-on': gender === 'mujer' }" @click="gender = 'mujer'">
            Mujer
          </button>
          <button type="button" class="chip" :class="{ 'is-on': gender === 'hombre' }" @click="gender = 'hombre'">
            Hombre
          </button>
        </div>

        <div class="mt-5 flex justify-center">
          <div class="inline-flex max-w-full flex-wrap justify-center rounded-full bg-shell p-1">
            <button type="button" class="ws-tab" :class="{ 'is-on': mode === 'ring' }" @click="mode = 'ring'">
              Por anillo
            </button>
            <button type="button" class="ws-tab" :class="{ 'is-on': mode === 'finger' }" @click="mode = 'finger'">
              Por dedo
            </button>
            <button type="button" class="ws-tab" :class="{ 'is-on': mode === 'chart' }" @click="mode = 'chart'">
              Referencia
            </button>
          </div>
        </div>

        <template v-if="mode !== 'chart'">
          <div class="stage mt-5">
            <div v-if="mode === 'ring'" class="grid h-full place-items-center">
              <div
                class="ring-circle"
                :style="{ width: `${circlePx}px`, height: `${circlePx}px` }"
              >
                <span>{{ diameter.toFixed(2) }} mm</span>
              </div>
            </div>
            <div v-else class="flex h-full flex-col items-center justify-center gap-3 px-6">
              <div class="finger-line" />
              <p class="text-sm italic text-muted">Coloca tu dedo aquí</p>
              <div
                class="grid place-items-center rounded-md border border-charcoal/20 bg-white px-2 py-1 text-xs font-semibold text-charcoal"
                :style="{ minHeight: `${fingerGap}px` }"
              >
                {{ diameter.toFixed(2) }} mm
              </div>
              <div class="finger-line" />
            </div>
          </div>

          <p class="mt-3 text-center text-sm text-muted">
            <template v-if="mode === 'ring'">
              Coloca el anillo sobre el círculo. Ajusta hasta que el borde interno coincida.
            </template>
            <template v-else>
              Coloca el dedo entre las dos líneas. Usa el control para ajustar la separación.
            </template>
          </p>

          <div class="mt-4 flex items-center gap-3">
            <span class="dot" />
            <input
              v-model.number="diameter"
              class="slider"
              type="range"
              :min="range.min"
              :max="range.max"
              step="0.05"
            />
            <span class="dot" />
          </div>

          <div class="mt-4 flex items-center gap-3">
            <button type="button" class="cta" @click="showSize">Mostrar la talla del anillo</button>
            <button
              type="button"
              class="cal-box"
              :title="'Calibrar con tarjeta'"
              @click="calibrating = !calibrating"
            />
          </div>

          <p class="mt-2 text-center text-xs text-muted">
            {{
              calibratedPxPerMm
                ? 'Pantalla calibrada con tarjeta.'
                : 'Sin calibrar el tamaño en pantalla es aproximado. Toca el recuadro para calibrar con una tarjeta.'
            }}
            <button v-if="calibratedPxPerMm" type="button" class="underline" @click="resetCalibration">
              Quitar calibración
            </button>
          </p>

          <div v-if="calibrating" class="mt-4 rounded-card-sm border border-line bg-shell p-4">
            <p class="text-sm font-medium">Calibrar con tarjeta de crédito o débito</p>
            <p class="mt-1 text-xs text-muted">
              Pon la tarjeta física sobre el rectángulo y mueve la barra hasta que coincidan los bordes.
            </p>
            <div class="mt-3 grid place-items-center overflow-auto">
              <div
                class="rounded-md border-2 border-dashed border-charcoal/40 bg-white"
                :style="{ width: `${cardWidthPx}px`, height: `${cardHeightPx}px` }"
              />
            </div>
            <input v-model.number="cardScale" class="slider mt-3" type="range" min="0.45" max="1.8" step="0.01" />
            <div class="mt-3 flex gap-2">
              <SoftButton variant="yellow" type="button" @click="applyCalibration">Usar esta escala</SoftButton>
              <SoftButton variant="ghost" type="button" @click="calibrating = false">Cerrar</SoftButton>
            </div>
          </div>

          <div v-if="result" class="result mt-5">
            <p class="text-sm font-medium text-coral-ink">Tu talla</p>
            <p class="mt-3 text-sm"><b>Diámetro:</b> {{ result.diameter.toFixed(2) }} mm</p>
            <p class="mt-1 text-sm"><b>Circunferencia:</b> {{ result.circumference.toFixed(2) }} mm</p>
            <p class="mt-1 text-sm"><b>Europa (EU):</b> {{ result.eu }}</p>
            <p class="mt-1 text-sm"><b>Estados Unidos:</b> {{ result.us }}</p>
            <p class="mt-1 text-sm"><b>Reino Unido:</b> {{ result.uk }}</p>
            <p class="mt-1 text-sm"><b>Referencia BO:</b> {{ result.bo ?? '—' }}</p>
            <p class="mt-3 text-xs text-muted">
              Rango {{ gender === 'mujer' ? 'de mujer' : 'de hombre' }}. La talla exacta puede variar 0.5 según el
              fabricante.
            </p>
          </div>
        </template>

        <div v-else class="mt-5 overflow-auto">
          <table class="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr class="border-b border-line bg-shell text-muted">
                <th class="px-3 py-2 font-medium">EU</th>
                <th class="px-3 py-2 font-medium">US</th>
                <th class="px-3 py-2 font-medium">UK</th>
                <th class="px-3 py-2 font-medium">Ø mm</th>
                <th class="px-3 py-2 font-medium">Circ. mm</th>
                <th class="px-3 py-2 font-medium">BO</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in chart" :key="row.us" class="border-b border-line/70">
                <td class="px-3 py-2">{{ row.eu }}</td>
                <td class="px-3 py-2">{{ row.us }}</td>
                <td class="px-3 py-2">{{ row.uk }}</td>
                <td class="px-3 py-2">{{ row.diameter }}</td>
                <td class="px-3 py-2">{{ row.circumference }}</td>
                <td class="px-3 py-2">{{ row.bo ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </SoftCard>

    <SoftCard v-else :padded="false" class="mt-5 overflow-hidden">
      <div class="px-5 py-6 sm:px-8">
        <h2 class="font-display text-center text-2xl tracking-tight">Probar accesorio en AR</h2>
        <p class="mx-auto mt-2 max-w-md text-center text-sm text-muted">
          Simula cómo lucirá la joya. Elige el tipo de pieza y captura una foto.
        </p>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <button
            v-for="piece in arPieces"
            :key="piece"
            type="button"
            class="piece"
            :class="{ 'is-on': arPiece === piece }"
            @click="arPiece = piece"
          >
            {{ piece.charAt(0).toUpperCase() + piece.slice(1) }}
          </button>
        </div>

        <div class="mt-5 overflow-hidden rounded-card-sm border border-line bg-shell" data-ar-stage>
          <div class="relative aspect-[3/4] bg-charcoal/10">
            <video
              v-if="!photo"
              ref="videoEl"
              class="h-full w-full object-cover"
              playsinline
              muted
              autoplay
            />
            <img v-else :src="photo" alt="Foto para prueba AR" class="h-full w-full object-cover" />
            <div
              class="overlay"
              :style="{
                left: `${overlayX}%`,
                top: `${overlayY}%`,
                transform: `translate(-50%, -50%) scale(${overlayScale})`,
              }"
              @pointerdown="onOverlayPointerDown"
              @pointermove="onOverlayPointerMove"
              @pointerup="onOverlayPointerUp"
              @pointercancel="onOverlayPointerUp"
            >
              <svg v-if="arPiece === 'anillo'" viewBox="0 0 80 80" class="h-24 w-24">
                <ellipse cx="40" cy="40" rx="28" ry="18" fill="none" stroke="#d4a017" stroke-width="6" />
                <ellipse cx="40" cy="40" rx="18" ry="10" fill="none" stroke="#f3e6b3" stroke-width="2" />
              </svg>
              <svg v-else-if="arPiece === 'aretes'" viewBox="0 0 80 80" class="h-24 w-24">
                <circle cx="28" cy="28" r="10" fill="none" stroke="#d4a017" stroke-width="4" />
                <circle cx="52" cy="28" r="10" fill="none" stroke="#d4a017" stroke-width="4" />
                <circle cx="28" cy="28" r="3" fill="#d4a017" />
                <circle cx="52" cy="28" r="3" fill="#d4a017" />
              </svg>
              <svg v-else-if="arPiece === 'collar'" viewBox="0 0 120 80" class="h-20 w-32">
                <path d="M10 18 Q60 78 110 18" fill="none" stroke="#d4a017" stroke-width="4" />
                <circle cx="60" cy="62" r="7" fill="#d4a017" />
              </svg>
              <svg v-else viewBox="0 0 120 60" class="h-16 w-32">
                <ellipse cx="60" cy="30" rx="48" ry="16" fill="none" stroke="#d4a017" stroke-width="5" />
              </svg>
            </div>
          </div>
        </div>

        <p v-if="cameraError" class="mt-3 text-sm text-red-600">{{ cameraError }}</p>

        <div class="mt-4 flex flex-wrap gap-2">
          <SoftButton v-if="!photo" variant="yellow" type="button" @click="captureFrame">Capturar foto</SoftButton>
          <SoftButton v-if="!photo" variant="outline" type="button" @click="startCamera">Abrir cámara</SoftButton>
          <SoftButton variant="outline" type="button" @click="fileEl?.click()">Subir foto</SoftButton>
          <SoftButton v-if="photo" variant="ghost" type="button" @click="clearPhoto">Otra foto</SoftButton>
          <input ref="fileEl" class="hidden" type="file" accept="image/*" capture="user" @change="onPhotoFile" />
        </div>

        <label class="mt-4 block text-sm">
          Tamaño de la pieza
          <input v-model.number="overlayScale" class="slider mt-2" type="range" min="0.4" max="2.4" step="0.05" />
        </label>
        <p class="mt-3 text-xs text-muted">
          Arrastra la joya sobre la foto. La vista AR es orientativa. Para un ajuste perfecto usa el medidor de anillos.
        </p>
      </div>
    </SoftCard>
  </div>
</template>

<style scoped>
.ws-tab {
  border: 0;
  border-radius: 999px;
  background: transparent;
  padding: 0.55rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--rex-muted);
  cursor: pointer;
}
.ws-tab.is-on {
  background: var(--rex-charcoal);
  color: var(--rex-on-charcoal);
}
.chip {
  border: 1px solid var(--rex-line);
  border-radius: 999px;
  background: white;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}
.chip.is-on {
  background: var(--rex-charcoal);
  color: var(--rex-on-charcoal);
  border-color: var(--rex-charcoal);
}
.stage {
  height: 260px;
  border-radius: 1rem;
  background-color: #e8f4ff;
  background-image:
    linear-gradient(#cfe6fb 1px, transparent 1px),
    linear-gradient(90deg, #cfe6fb 1px, transparent 1px);
  background-size: 18px 18px;
}
.ring-circle {
  display: grid;
  place-items: center;
  border: 3px solid #3b82c4;
  border-radius: 999px;
  background: transparent;
  color: #1d4f7a;
  font-size: 0.75rem;
  font-weight: 700;
}
.finger-line {
  width: 72%;
  height: 3px;
  background: #3b82c4;
}
.dot {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid var(--rex-line);
  background: white;
  flex-shrink: 0;
}
.slider {
  width: 100%;
  accent-color: #e2557a;
}
.cta {
  flex: 1;
  border: 0;
  border-radius: 999px;
  background: #e2557a;
  color: white;
  padding: 0.9rem 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}
.cal-box {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 8px;
  border: 1px solid var(--rex-line);
  background: white;
  cursor: pointer;
}
.result {
  border-radius: 1rem;
  border: 1px solid #f3c5d1;
  background: #fff1f5;
  padding: 1.1rem 1.2rem;
}
.text-coral-ink {
  color: #e2557a;
}
.piece {
  border: 1px solid var(--rex-line);
  border-radius: 0.85rem;
  background: white;
  padding: 1rem 0.75rem;
  font-weight: 600;
  cursor: pointer;
}
.piece.is-on {
  border-color: #e2557a;
  color: #e2557a;
}
.overlay {
  position: absolute;
  cursor: grab;
  touch-action: none;
  filter: drop-shadow(0 4px 8px rgb(0 0 0 / 0.25));
}
</style>
