<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { fetchMyLanding, toggleLandingPublish, updateMyLanding, uploadLandingAsset } from '@/api/landing'
import LandingPageCanvas from '@/components/landing/LandingPageCanvas.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import SoftField from '@/components/ui/SoftField.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import { useToast } from '@/composables/useToast'
import type { LandingBlock, LandingEditField, LandingPhotoFrame, LandingSummary } from '@/types/auth'
import { LANDING_PHOTO_FRAMES, isLandingPhotoFrame } from '@/data/landingLooks'
import LandingHexField from '@/components/landing/LandingHexField.vue'
import { parseBrandHex } from '@/utils/color'
import { errorMessage } from '@/utils/http'
import { fieldControlClass } from '@/utils/ui'
import { digitsOnly, looksLikePhoneLabel } from '@/utils/whatsapp'

const landing = ref<LandingSummary | null>(null)
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const message = ref('')
const activeField = ref<LandingEditField | null>(null)
const toast = useToast()
const photoInput = ref<HTMLInputElement | null>(null)
const backgroundInput = ref<HTMLInputElement | null>(null)
const reasonsInput = ref<HTMLInputElement | null>(null)
const logoInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  title: '',
  heroTitle: '',
  heroSubtitle: '',
  kicker: '',
  ctaLabel: '',
  ctaHref: '',
  photo: '',
  background: '',
  logo: '',
  whatsapp: '',
  whatsappLabel: '',
  reasonsPhoto: '',
  reasonsKicker: '',
  reasonsTitle: '',
  reasonsBody: '',
  reasonsBenefits: '',
  photoFrame: 'phone' as LandingPhotoFrame,
  principal: ['', ''] as [string, string],
  complementarios: ['', '', ''] as [string, string, string],
  blocks: [] as LandingBlock[],
})

const previewLanding = computed<LandingSummary | null>(() => {
  if (!landing.value) {
    return null
  }

  return {
    ...landing.value,
    title: form.title,
    content: {
      hero: {
        title: form.heroTitle,
        subtitle: form.heroSubtitle,
        kicker: form.kicker,
        cta_label: form.ctaLabel,
        cta_href: form.ctaHref,
        photo: form.photo,
        background: form.background,
        frame: form.photoFrame,
      },
      reasons: {
        photo: form.reasonsPhoto,
        kicker: form.reasonsKicker,
        title: form.reasonsTitle,
        body: form.reasonsBody,
        benefits: form.reasonsBenefits
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      },
      logo: form.logo,
      whatsapp: form.whatsapp,
      whatsapp_label: form.whatsappLabel,
      palette: {
        principal: packedHex(form.principal),
        complementarios: packedHex(form.complementarios),
      },
      blocks: form.blocks,
    },
  }
})

const previewLeader = computed(() => landing.value?.owner_name || form.title)
const previewStoreSlug = computed(() => landing.value?.store_slug || landing.value?.slug || '')
const blockIndex = computed(() => {
  if (!activeField.value?.startsWith('block:')) {
    return null
  }
  return Number(activeField.value.slice(6))
})
const activeBlock = computed(() => (blockIndex.value === null ? null : form.blocks[blockIndex.value] ?? null))
const panelTitle = computed(() => {
  switch (activeField.value) {
    case 'logo':
      return 'Logo'
    case 'title':
      return 'Nombre en la barra'
    case 'photo':
      return 'Foto de portada'
    case 'look':
      return 'Forma y colores'
    case 'background':
      return 'Foto de fondo'
    case 'kicker':
      return 'Frase pequeña'
    case 'headline':
      return 'Titular'
    case 'subtitle':
      return 'Subtítulo'
    case 'cta':
      return 'Botón de color'
    case 'whatsapp':
      return 'Botones de WhatsApp'
    case 'reasons_photo':
      return 'Segunda foto'
    case 'reasons_kicker':
      return 'Rótulo Reasons'
    case 'reasons_title':
      return 'Título de Reasons'
    case 'reasons_body':
      return 'Texto de Reasons'
    case 'reasons_benefits':
      return 'Lista de beneficios'
    case 'blocks':
      return 'Añadir bloque'
    default:
      return activeBlock.value ? 'Este bloque' : 'Qué vas a cambiar'
  }
})
const panelHint = computed(() => {
  switch (activeField.value) {
    case 'logo':
      return 'Va suelto en la barra, sin recuadro. Sube un PNG transparente para que se vea nítido.'
    case 'title':
      return 'Aparece al lado del logo, en mayúsculas. Suele ser tu nombre o el de tu marca.'
    case 'photo':
      return 'Elige si va en un celular, un círculo u otra silueta. La misma forma se usa en la segunda foto.'
    case 'look':
      return 'Pega los hex de tu manual: principales del logo y complementarios. Ejemplo #e72fb9.'
    case 'background':
      return 'Es el fondo grande detrás del texto. Puede ser otra foto distinta a la del celular.'
    case 'kicker':
      return 'La frase chica encima del nombre, por ejemplo We Created.'
    case 'headline':
      return 'La frase grande de la primera pantalla.'
    case 'subtitle':
      return 'El párrafo debajo del titular.'
    case 'cta':
      return 'Lo que se lee en el botón de color (el de al lado de «¿Aceptas el reto?»). El clic abre WhatsApp; el número va aparte.'
    case 'whatsapp':
      return 'El texto de la barra, el botón morado y el pie. El número solo sirve para abrir el chat, no se muestra.'
    case 'reasons_photo':
      return 'Foto dentro del segundo celular, en la sección de abajo. Independiente de la primera.'
    case 'reasons_kicker':
      return 'El rótulo pequeño, por ejemplo Reasons.'
    case 'reasons_title':
      return 'El título grande de esa sección.'
    case 'reasons_body':
      return 'El párrafo que explica tu red.'
    case 'reasons_benefits':
      return 'Un beneficio por línea. Ejemplo: Tienda propia'
    case 'blocks':
      return 'Un bloque extra debajo del hero: texto, imagen o botón a tu tienda.'
    default:
      return 'Haz clic en el logo, la foto, el fondo o un texto. Arriba a la derecha puedes cambiar la forma y tus colores.'
  }
})

function packedHex(values: string[]): string[] {
  return values.map((item) => parseBrandHex(item)).filter((item): item is string => Boolean(item))
}

function slotHex(list: string[] | undefined, index: number, fallback = ''): string {
  return parseBrandHex(list?.[index]) ?? fallback
}

function hydrate(next: LandingSummary): void {
  landing.value = next
  form.title = next.title
  form.heroTitle = next.content?.hero?.title ?? ''
  form.heroSubtitle = next.content?.hero?.subtitle ?? ''
  form.kicker = next.content?.hero?.kicker ?? ''
  const rawCta = next.content?.hero?.cta_label ?? ''
  const storedWhatsapp = next.whatsapp || next.content?.whatsapp || ''
  form.ctaHref = next.content?.hero?.cta_href ?? ''
  form.photo = next.content?.hero?.photo ?? ''
  form.background = next.content?.hero?.background ?? ''
  form.photoFrame = isLandingPhotoFrame(next.content?.hero?.frame) ? next.content.hero.frame : 'phone'
  form.logo = next.content?.logo ?? ''
  form.whatsappLabel = next.content?.whatsapp_label ?? ''
  if (looksLikePhoneLabel(rawCta)) {
    form.ctaLabel = ''
    form.whatsapp = storedWhatsapp || digitsOnly(rawCta)
  } else {
    form.ctaLabel = rawCta
    form.whatsapp = storedWhatsapp
  }
  const palette = next.content?.palette
  const company = next.company?.color_palette
  form.principal = [
    slotHex(palette?.principal, 0, parseBrandHex(palette?.primary) ?? parseBrandHex(company?.primary) ?? ''),
    slotHex(palette?.principal, 1, ''),
  ]
  form.complementarios = [
    slotHex(palette?.complementarios, 0, parseBrandHex(palette?.secondary) ?? parseBrandHex(company?.secondary) ?? ''),
    slotHex(palette?.complementarios, 1, ''),
    slotHex(palette?.complementarios, 2, ''),
  ]
  form.reasonsPhoto = next.content?.reasons?.photo ?? ''
  form.reasonsKicker = next.content?.reasons?.kicker ?? ''
  form.reasonsTitle = next.content?.reasons?.title ?? ''
  form.reasonsBody = next.content?.reasons?.body ?? ''
  form.reasonsBenefits = (next.content?.reasons?.benefits ?? []).filter(Boolean).join('\n')
  form.blocks = [...(next.content?.blocks ?? [])]
}

function closeEditor(): void {
  activeField.value = null
}

function onEditorKey(event: KeyboardEvent): void {
  if (event.key === 'Escape' && activeField.value) {
    closeEditor()
  }
}

onMounted(async () => {
  document.addEventListener('keydown', onEditorKey)
  try {
    hydrate(await fetchMyLanding())
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo cargar la landing')
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onEditorKey)
})

function payload() {
  return {
    title: form.title,
    content: {
      hero: {
        title: form.heroTitle,
        subtitle: form.heroSubtitle,
        kicker: form.kicker || undefined,
        cta_label: looksLikePhoneLabel(form.ctaLabel) ? '' : form.ctaLabel,
        cta_href: form.ctaHref,
        photo: form.photo || undefined,
        background: form.background || undefined,
        frame: form.photoFrame,
      },
      reasons: {
        photo: form.reasonsPhoto || undefined,
        kicker: form.reasonsKicker || undefined,
        title: form.reasonsTitle || undefined,
        body: form.reasonsBody || undefined,
        benefits: form.reasonsBenefits
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      },
      logo: form.logo || undefined,
      whatsapp: form.whatsapp,
      whatsapp_label: form.whatsappLabel || undefined,
      palette: {
        principal: packedHex(form.principal),
        complementarios: packedHex(form.complementarios),
        primary: packedHex(form.principal)[0],
        secondary: packedHex(form.complementarios)[0],
        accent: packedHex(form.principal)[1],
      },
      blocks: form.blocks,
    },
  }
}

async function save(silent = false): Promise<void> {
  saving.value = true
  if (!silent) {
    message.value = ''
  }

  try {
    hydrate(await updateMyLanding(payload()))
    if (!silent) {
      message.value = 'Landing guardada'
      toast.success('Los cambios de tu página pública ya están guardados.', 'Landing guardada')
    }
  } catch (error) {
    message.value = errorMessage(error)
    toast.fromError(error, 'No se pudo guardar la landing')
  } finally {
    saving.value = false
  }
}

async function toggle(): Promise<void> {
  try {
    hydrate(await toggleLandingPublish())
    toast.success(
      landing.value?.is_published ? 'Tu landing ya es pública.' : 'La landing quedó en borrador.',
      landing.value?.is_published ? 'Landing publicada' : 'Landing despublicada',
    )
  } catch (error) {
    toast.fromError(error, 'No se pudo cambiar la publicación')
  }
}

function addBlock(type: LandingBlock['type']): void {
  form.blocks.push({ type, body: '', path: '' })
  activeField.value = `block:${form.blocks.length - 1}`
}

function removeActiveBlock(): void {
  if (blockIndex.value === null) {
    return
  }
  form.blocks.splice(blockIndex.value, 1)
  activeField.value = 'blocks'
}

async function onAsset(kind: 'photo' | 'logo' | 'background' | 'reasons', event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }

  uploading.value = true
  try {
    hydrate(await uploadLandingAsset(kind, file))
    const labels = {
      logo: 'Logo actualizado.',
      photo: 'Foto de portada actualizada.',
      background: 'Fondo actualizado.',
      reasons: 'Segunda foto actualizada.',
    }
    toast.success(labels[kind], 'Imagen lista')
  } catch (error) {
    toast.fromError(error, 'No se pudo subir la imagen')
  } finally {
    uploading.value = false
  }
}

function clearPhoto(): void {
  form.photo = ''
  void save(true)
}

function clearBackground(): void {
  form.background = ''
  void save(true)
}

function clearReasonsPhoto(): void {
  form.reasonsPhoto = ''
  void save(true)
}

function clearLogo(): void {
  form.logo = ''
  void save(true)
}
</script>

<template>
  <div>
    <div data-tour="landing-welcome">
      <ModuleBanner
        icon="zap"
        eyebrow="Líder"
        title="Landing"
        body="Editas tu página como la ve el visitante: clic en el logo, tu foto o un texto y cambia eso. Cuando publicas, cualquiera abre /l/tu-slug."
        :actions="[
          'Clic en lo que quieres cambiar: se abre el formulario al instante.',
          'Elige la forma de tu foto y tu paleta de colores.',
          'Guarda y publica cuando esté lista.',
        ]"
      >
        <div class="flex flex-wrap items-center gap-2" data-tour="landing-actions">
        <a
          v-if="landing"
          :href="`/l/${landing.slug}`"
          class="rounded-full border border-line bg-card px-4 py-2 text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          Vista pública
        </a>
        <SoftButton variant="yellow" :disabled="!landing" @click="toggle">
          {{ landing?.is_published ? 'Despublicar' : 'Publicar' }}
        </SoftButton>
        </div>
      </ModuleBanner>
    </div>
    <p v-if="loading" class="mt-6 text-sm text-muted">Cargando…</p>
    <p v-else-if="message" class="mt-4 text-sm text-muted">{{ message }}</p>

    <div v-if="landing" class="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
      <div class="lp-studio" data-tour="landing-hero">
        <p class="mb-3 text-sm text-muted">
          Vista previa. Toca logo, foto, fondo o un texto: el cambio se abre en una ventana, sin bajar al panel.
        </p>
        <div class="lp-studio-stage">
          <LandingPageCanvas
            :landing="previewLanding"
            :brand="landing.company"
            :leader="previewLeader"
            :store-slug="previewStoreSlug"
            :whatsapp="form.whatsapp"
            editable
            :active-field="activeField"
            @edit="activeField = $event"
          />
        </div>
      </div>

      <SoftCard class="h-fit space-y-4 pb-28 xl:sticky xl:top-4 xl:pb-4" data-tour="landing-blocks">
        <div>
          <p class="text-xs uppercase tracking-[0.14em] text-muted">Estilo</p>
          <h2 class="mt-1 font-medium">Forma y colores</h2>
          <p class="mt-1 text-sm text-muted">
            La foto y los textos se editan tocando la vista previa. Aquí dejas la silueta y la paleta.
          </p>
        </div>

        <div class="space-y-3 rounded-xl bg-shell p-3">
          <p class="text-xs font-medium uppercase tracking-[0.12em] text-muted">Forma de la foto</p>
          <div class="grid grid-cols-5 gap-1.5">
            <button
              v-for="item in LANDING_PHOTO_FRAMES"
              :key="item.id"
              type="button"
              class="rounded-lg px-1 py-2 text-[11px] leading-tight"
              :class="form.photoFrame === item.id ? 'bg-charcoal text-on-charcoal' : 'bg-card'"
              :title="item.hint"
              @click="form.photoFrame = item.id"
            >
              {{ item.label }}
            </button>
          </div>
          <p class="text-xs font-medium uppercase tracking-[0.12em] text-muted">Colores principales por logo</p>
          <p class="text-[11px] text-muted">Pégalos como en tu manual, con #. Ejemplo: #e72fb9</p>
          <div class="grid gap-2">
            <LandingHexField v-model="form.principal[0]" label="Principal 1" placeholder="#e72fb9" />
            <LandingHexField v-model="form.principal[1]" label="Principal 2" placeholder="#cd8ddf" />
          </div>
          <p class="pt-1 text-xs font-medium uppercase tracking-[0.12em] text-muted">Colores complementarios</p>
          <div class="grid gap-2">
            <LandingHexField v-model="form.complementarios[0]" label="Complementario 1" placeholder="#5a006a" />
            <LandingHexField v-model="form.complementarios[1]" label="Complementario 2" placeholder="#71b7c1" />
            <LandingHexField v-model="form.complementarios[2]" label="Complementario 3" placeholder="#b34e8e" />
          </div>
        </div>

        <div class="flex flex-wrap gap-2 border-t border-line pt-4">
          <SoftButton type="button" :disabled="saving" @click="save(false)">Guardar landing</SoftButton>
        </div>
      </SoftCard>
    </div>

    <Teleport to="body">
      <div
        v-if="activeField"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
        @click.self="closeEditor"
      >
        <div
          class="flex max-h-[88svh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-card shadow-lg sm:rounded-card"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="'landing-edit-title'"
        >
          <div class="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div class="min-w-0">
              <p class="text-xs uppercase tracking-[0.14em] text-muted">Estás editando</p>
              <h2 id="landing-edit-title" class="mt-1 font-medium">{{ panelTitle }}</h2>
              <p class="mt-1 text-sm text-muted">{{ panelHint }}</p>
            </div>
            <button type="button" class="shrink-0 rounded-full px-2 py-1 text-sm text-muted" @click="closeEditor">
              Cerrar
            </button>
          </div>
          <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <template v-if="activeField === 'logo'">
              <div v-if="form.logo" class="bg-transparent">
                <img :src="form.logo" alt="" class="mx-auto h-24 w-auto max-w-full object-contain" />
              </div>
              <SoftButton variant="outline" type="button" :disabled="uploading" @click="logoInput?.click()">
                {{ form.logo ? 'Cambiar logo' : 'Subir logo' }}
              </SoftButton>
              <button v-if="form.logo" type="button" class="text-sm text-muted" @click="clearLogo">Quitar logo</button>
            </template>

            <SoftField v-else-if="activeField === 'title'" label="Nombre">
              <input v-model="form.title" :class="fieldControlClass" />
            </SoftField>

            <template v-else-if="activeField === 'photo'">
              <div v-if="form.photo" class="overflow-hidden rounded-xl border border-line">
                <img :src="form.photo" alt="" class="h-40 w-full object-cover" />
              </div>
              <SoftButton variant="outline" type="button" :disabled="uploading" @click="photoInput?.click()">
                {{ form.photo ? 'Cambiar foto' : 'Subir foto' }}
              </SoftButton>
              <button v-if="form.photo" type="button" class="text-sm text-muted" @click="clearPhoto">Quitar foto</button>
            </template>

            <template v-else-if="activeField === 'background'">
              <div v-if="form.background" class="overflow-hidden rounded-xl border border-line">
                <img :src="form.background" alt="" class="h-40 w-full object-cover" />
              </div>
              <SoftButton variant="outline" type="button" :disabled="uploading" @click="backgroundInput?.click()">
                {{ form.background ? 'Cambiar fondo' : 'Subir fondo' }}
              </SoftButton>
              <button v-if="form.background" type="button" class="text-sm text-muted" @click="clearBackground">
                Quitar fondo
              </button>
            </template>

            <SoftField v-else-if="activeField === 'kicker'" label="Frase pequeña">
              <input v-model="form.kicker" :class="fieldControlClass" placeholder="We Created" />
            </SoftField>

            <SoftField v-else-if="activeField === 'headline'" label="Titular">
              <input v-model="form.heroTitle" :class="fieldControlClass" />
            </SoftField>

            <SoftField v-else-if="activeField === 'subtitle'" label="Subtítulo">
              <textarea v-model="form.heroSubtitle" :class="fieldControlClass" rows="4" />
            </SoftField>

            <template v-else-if="activeField === 'cta'">
              <SoftField label="Texto del botón" hint="Ejemplo: Conversa con Raquel">
                <input v-model="form.ctaLabel" :class="fieldControlClass" placeholder="Conversa con Raquel" />
              </SoftField>
              <SoftField label="Número de WhatsApp" hint="Sin + ni espacios. Ahí se abre el chat.">
                <input v-model="form.whatsapp" :class="fieldControlClass" placeholder="59168785473" inputmode="tel" />
              </SoftField>
            </template>

            <template v-else-if="activeField === 'whatsapp'">
              <SoftField label="Texto del botón" hint="Barra, botón morado y pie. Ejemplo: Conversa con Raquel">
                <input
                  v-model="form.whatsappLabel"
                  :class="fieldControlClass"
                  placeholder="Conversa con Raquel"
                />
              </SoftField>
              <SoftField label="Número" hint="Sin + ni espacios. No se muestra en el botón.">
                <input v-model="form.whatsapp" :class="fieldControlClass" placeholder="59168785473" inputmode="tel" />
              </SoftField>
            </template>

            <template v-else-if="activeField === 'reasons_photo'">
              <div v-if="form.reasonsPhoto" class="overflow-hidden rounded-xl border border-line">
                <img :src="form.reasonsPhoto" alt="" class="h-40 w-full object-cover" />
              </div>
              <SoftButton variant="outline" type="button" :disabled="uploading" @click="reasonsInput?.click()">
                {{ form.reasonsPhoto ? 'Cambiar segunda foto' : 'Subir segunda foto' }}
              </SoftButton>
              <button v-if="form.reasonsPhoto" type="button" class="text-sm text-muted" @click="clearReasonsPhoto">
                Quitar segunda foto
              </button>
            </template>

            <SoftField v-else-if="activeField === 'reasons_kicker'" label="Rótulo">
              <input v-model="form.reasonsKicker" :class="fieldControlClass" placeholder="Reasons" />
            </SoftField>

            <SoftField v-else-if="activeField === 'reasons_title'" label="Título">
              <input v-model="form.reasonsTitle" :class="fieldControlClass" />
            </SoftField>

            <SoftField v-else-if="activeField === 'reasons_body'" label="Texto">
              <textarea v-model="form.reasonsBody" :class="fieldControlClass" rows="5" />
            </SoftField>

            <SoftField v-else-if="activeField === 'reasons_benefits'" label="Beneficios" hint="Uno por línea.">
              <textarea v-model="form.reasonsBenefits" :class="fieldControlClass" rows="6" />
            </SoftField>

            <template v-else-if="activeField === 'blocks'">
              <div class="flex flex-wrap gap-2">
                <SoftButton variant="outline" type="button" @click="addBlock('text')">Texto</SoftButton>
                <SoftButton variant="outline" type="button" @click="addBlock('image')">Imagen</SoftButton>
                <SoftButton variant="outline" type="button" @click="addBlock('store_cta')">CTA tienda</SoftButton>
              </div>
            </template>

            <template v-else-if="activeBlock">
              <textarea
                v-if="activeBlock.type !== 'image'"
                v-model="activeBlock.body"
                :class="fieldControlClass"
                rows="4"
                :placeholder="activeBlock.type === 'store_cta' ? 'Texto del botón a la tienda' : 'Contenido'"
              />
              <input
                v-else
                v-model="activeBlock.path"
                :class="fieldControlClass"
                placeholder="URL https de la imagen"
              />
              <button type="button" class="text-sm text-muted" @click="removeActiveBlock">Quitar este bloque</button>
            </template>
          </div>
          <div class="flex flex-wrap gap-2 border-t border-line px-5 py-4">
            <SoftButton type="button" variant="outline" @click="closeEditor">Listo</SoftButton>
            <SoftButton type="button" variant="yellow" :disabled="saving" @click="save(false)">Guardar</SoftButton>
          </div>
        </div>
      </div>
    </Teleport>

    <input ref="photoInput" class="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="onAsset('photo', $event)" />
    <input ref="backgroundInput" class="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="onAsset('background', $event)" />
    <input ref="reasonsInput" class="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="onAsset('reasons', $event)" />
    <input ref="logoInput" class="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="onAsset('logo', $event)" />
  </div>
</template>
