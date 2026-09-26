<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchToolCatalogProducts } from '@/api/tools'
import AppIcon from '@/components/ui/AppIcon.vue'
import CompanyScopeBar from '@/components/company/CompanyScopeBar.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import { useBodyFit } from '@/composables/useBodyFit'
import { useCompanyToolGate } from '@/composables/useCompanyToolGate'
import {
  inferJewelryKind,
  JEWELRY_KINDS,
  type CatalogJewelryProduct,
  type JewelryKind,
} from '@/data/jewelryTryOn'
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

const workspace = ref<Workspace>('sizer')
const mode = ref<SizerMode>('ring')
const gender = ref<RingGender>('mujer')
const diameter = ref(RING_RANGE.mujer.initial)
const result = ref<RingSizeRow | null>(null)
const calibrating = ref(false)
const cardScale = ref(1)
const fallbackPxPerMm = 96 / 25.4
const calibratedPxPerMm = ref<number | null>(null)

const arPiece = ref<JewelryKind>('anillo')
const videoEl = ref<HTMLVideoElement | null>(null)
const fileEl = ref<HTMLInputElement | null>(null)
const cameraError = ref('')
const photo = ref('')
const overlayX = ref(50)
const overlayY = ref(42)
const overlayScale = ref(1)
const dragging = ref(false)
const facing = ref<'user' | 'environment'>('user')
const autoFit = ref(true)
const catalogProducts = ref<CatalogJewelryProduct[]>([])
const selectedProductId = ref<string | number | null>(null)
const productsError = ref('')
let mediaStream: MediaStream | null = null

const mirrored = computed(() => facing.value === 'user' && !photo.value)
const bodyFit = useBodyFit(videoEl, arPiece, mirrored, computed(() => autoFit.value && workspace.value === 'ar' && !photo.value))

const range = computed(() => RING_RANGE[gender.value])
const pxPerMm = computed(() => calibratedPxPerMm.value ?? fallbackPxPerMm)
const circlePx = computed(() => Math.max(24, diameter.value * pxPerMm.value))
const fingerGap = computed(() => Math.max(16, diameter.value * pxPerMm.value))
const chart = computed(() => chartForGender(gender.value))
const cardWidthPx = computed(() => CREDIT_CARD_WIDTH_MM * fallbackPxPerMm * cardScale.value)
const cardHeightPx = computed(() => CREDIT_CARD_HEIGHT_MM * fallbackPxPerMm * cardScale.value)
const visibleProducts = computed(() => catalogProducts.value.filter((item) => item.kind === arPiece.value))
const selectedProduct = computed(
  () => catalogProducts.value.find((item) => String(item.id) === String(selectedProductId.value)) ?? null,
)
const overlayStyle = computed(() => {
  const tracked = autoFit.value && !photo.value ? bodyFit.pose.value : null
  const x = tracked?.x ?? overlayX.value
  const y = tracked?.y ?? overlayY.value
  const scale = (tracked?.scale ?? 1) * overlayScale.value
  const rotate = tracked?.rotate ?? 0

  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`,
  }
})

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
      video: {
        facingMode: { ideal: facing.value },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })
    if (videoEl.value) {
      videoEl.value.srcObject = mediaStream
      await videoEl.value.play()
    }
    if (autoFit.value) {
      await bodyFit.start()
    }
  } catch {
    cameraError.value = 'No se pudo abrir la cámara. Permite el acceso o sube una foto.'
  }
}

function stopCamera(): void {
  bodyFit.stop()
  mediaStream?.getTracks().forEach((track) => track.stop())
  mediaStream = null
  if (videoEl.value) {
    videoEl.value.srcObject = null
  }
}

async function flipCamera(): Promise<void> {
  facing.value = facing.value === 'user' ? 'environment' : 'user'
  photo.value = ''
  await nextTick()
  await startCamera()
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
  if (facing.value === 'user') {
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
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
  void nextTick().then(() => startCamera())
}

function onOverlayPointerDown(event: PointerEvent): void {
  autoFit.value = false
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

function pickProduct(product: CatalogJewelryProduct): void {
  selectedProductId.value = product.id
  arPiece.value = product.kind
}

async function loadCatalogProducts(): Promise<void> {
  productsError.value = ''
  try {
    const payload = await fetchToolCatalogProducts()
    catalogProducts.value = payload.data
      .filter((row) => Boolean(row.image))
      .map((row) => ({
        id: row.id,
        name: row.name,
        image: row.image,
        category: row.category,
        kind: inferJewelryKind(row.name, row.category),
      }))
    if (
      selectedProductId.value &&
      !catalogProducts.value.some((row) => String(row.id) === String(selectedProductId.value))
    ) {
      selectedProductId.value = null
    }
  } catch {
    catalogProducts.value = []
    productsError.value = 'No se pudieron cargar los productos del catálogo.'
  }
}

onMounted(() => {
  void loadCatalogProducts()
})

watch(workspace, async (next) => {
  if (next === 'ar' && !photo.value) {
    await nextTick()
    await startCamera()
    return
  }
  stopCamera()
})

watch(autoFit, (on) => {
  if (on && workspace.value === 'ar' && !photo.value) {
    void bodyFit.start()
    return
  }
  if (!on) {
    bodyFit.stop()
  }
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
      body="Mide la talla con un anillo que ya calce o con el dedo. En AR pruebas productos del catálogo sobre la mano o el cuerpo."
      :actions="[
        'Calibra con una tarjeta si quieres 1:1 en pantalla.',
        'Elige mujer u hombre para el rango de tallas.',
        'Cambia entre cámara frontal y trasera.',
        'El ajuste a la mano corre en el dispositivo, sin un servicio de IA de pago.',
      ]"
    />

    <CompanyScopeBar class="mt-4" label="Catálogo de" @changed="loadCatalogProducts" />

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
        <h2 class="font-display text-center text-2xl tracking-tight">Probar producto en AR</h2>
        <p class="mx-auto mt-2 max-w-md text-center text-sm text-muted">
          Usa la foto del catálogo sobre la cámara. El modelo corre en tu teléfono: no hace falta un servicio de IA
          externo. El resultado es orientativo.
        </p>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <button
            v-for="piece in JEWELRY_KINDS"
            :key="piece.key"
            type="button"
            class="piece"
            :class="{ 'is-on': arPiece === piece.key }"
            @click="arPiece = piece.key"
          >
            {{ piece.label }}
          </button>
        </div>

        <div v-if="productsError" class="mt-3 text-sm text-red-600">{{ productsError }}</div>
        <p v-else-if="!visibleProducts.length" class="mt-3 text-sm text-muted">
          Esta empresa no tiene productos con foto para {{ arPiece }}. Cárgalos en el catálogo (con imagen) y vuelve a
          entrar.
        </p>
        <div v-else class="mt-4 grid max-h-48 grid-cols-3 gap-2 overflow-auto">
          <button
            v-for="product in visibleProducts"
            :key="String(product.id)"
            type="button"
            class="product-card"
            :class="{ 'is-on': String(selectedProductId) === String(product.id) }"
            @click="pickProduct(product)"
          >
            <img :src="product.image" :alt="product.name" />
            <span>{{ product.name }}</span>
          </button>
        </div>

        <div class="mt-5 overflow-hidden rounded-card-sm border border-line bg-shell" data-ar-stage>
          <div class="relative aspect-[3/4] bg-charcoal/10">
            <video
              v-show="!photo"
              ref="videoEl"
              class="h-full w-full object-cover"
              :class="{ 'is-mirror': mirrored }"
              playsinline
              muted
              autoplay
            />
            <img v-if="photo" :src="photo" alt="Foto para prueba AR" class="h-full w-full object-cover" />
            <div
              class="overlay"
              :style="overlayStyle"
              @pointerdown="onOverlayPointerDown"
              @pointermove="onOverlayPointerMove"
              @pointerup="onOverlayPointerUp"
              @pointercancel="onOverlayPointerUp"
            >
              <img
                v-if="selectedProduct"
                :src="selectedProduct.image"
                :alt="selectedProduct.name"
                class="product-overlay"
              />
              <svg v-else-if="arPiece === 'anillo'" viewBox="0 0 80 80" class="h-24 w-24">
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
            <button v-if="!photo" type="button" class="cam-flip" @click="flipCamera">
              {{ facing === 'user' ? 'Cámara trasera' : 'Cámara frontal' }}
            </button>
          </div>
        </div>

        <p v-if="cameraError" class="mt-3 text-sm text-red-600">{{ cameraError }}</p>
        <p v-else-if="bodyFit.hint" class="mt-3 text-xs text-muted">{{ bodyFit.hint }}</p>

        <div class="mt-4 flex flex-wrap gap-2">
          <SoftButton v-if="!photo" variant="yellow" type="button" @click="captureFrame">Capturar foto</SoftButton>
          <SoftButton v-if="!photo" variant="outline" type="button" @click="startCamera">Abrir cámara</SoftButton>
          <SoftButton variant="outline" type="button" @click="fileEl?.click()">Subir foto</SoftButton>
          <SoftButton v-if="photo" variant="ghost" type="button" @click="clearPhoto">Otra foto</SoftButton>
          <input ref="fileEl" class="hidden" type="file" accept="image/*" capture="environment" @change="onPhotoFile" />
        </div>

        <label class="mt-4 flex items-center gap-2 text-sm">
          <input v-model="autoFit" type="checkbox" />
          Ajuste automático a la mano o al cuerpo
        </label>

        <label class="mt-4 block text-sm">
          Tamaño de la pieza
          <input v-model.number="overlayScale" class="slider mt-2" type="range" min="0.4" max="2.4" step="0.05" />
        </label>
        <p class="mt-3 text-xs text-muted">
          Arrastrar la pieza desactiva el ajuste automático. Vuelve a marcarlo para seguir el dedo, la oreja o el cuello.
          Un try-on fotorealista (brillo del metal sobre la piel) sí pediría un servicio especializado; esto ancla el
          producto del catálogo a la postura.
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
.product-overlay {
  width: 96px;
  height: 96px;
  object-fit: contain;
  pointer-events: none;
}
.product-card {
  border: 1px solid var(--rex-line);
  border-radius: 0.7rem;
  background: white;
  padding: 0.35rem;
  text-align: left;
  cursor: pointer;
}
.product-card.is-on {
  border-color: #e2557a;
}
.product-card img {
  height: 56px;
  width: 100%;
  object-fit: contain;
}
.product-card span {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 0.25rem;
  font-size: 0.7rem;
  line-height: 1.2;
}
.cam-flip {
  position: absolute;
  right: 0.7rem;
  bottom: 0.7rem;
  border: 0;
  border-radius: 999px;
  background: rgb(37 37 37 / 0.82);
  color: white;
  padding: 0.45rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}
video.is-mirror {
  transform: scaleX(-1);
}
</style>
