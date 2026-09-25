<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/components/ui/AppIcon.vue'
import ClayTile from '@/components/ui/ClayTile.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import { fetchCompanyDocuments } from '@/api/tools'
import { useCompanyToolGate } from '@/composables/useCompanyToolGate'
import { mediaKindToToolKey } from '@/data/companyTools'
import {
  kindFromRoute,
  mediaKindMeta,
  type MediaFormat,
  type MediaItem,
} from '@/data/mediaLibrary'
import type { CompanyMediaItem } from '@/types/tools'

const route = useRoute()
const preview = ref<MediaItem | null>(null)
const downloading = ref<string | null>(null)
const loading = ref(true)
const message = ref('')
const remote = ref<MediaItem[]>([])

const kind = computed(() => kindFromRoute(String(route.params.kind ?? 'flyers')))
const toolKey = computed(() => mediaKindToToolKey(kind.value))
useCompanyToolGate(toolKey)
const meta = computed(() => mediaKindMeta[kind.value])
const items = computed(() => remote.value)
const bannerIcon = computed<IconName>(() => {
  if (kind.value === 'video') {
    return 'play'
  }
  if (kind.value === 'audio') {
    return 'alarm'
  }
  return 'file'
})
const bannerActions = computed(() => [
  'Abre la vista previa antes de compartir.',
  'Escucha o mira el material aquí mismo.',
  'Descarga el archivo si el enlace lo permite.',
])

function asMedia(item: CompanyMediaItem): MediaItem {
  const format = (item.file_type === 'image' ? 'image' : item.file_type) as MediaFormat

  return {
    id: String(item.id ?? item.url),
    kind: kind.value,
    format,
    title: item.title,
    url: item.url,
    filename: item.filename || item.title,
    thumb: item.thumbnail || (format === 'image' ? item.url : undefined),
    player: item.player ?? undefined,
    embedUrl: item.embed_url ?? undefined,
    description: item.description ?? undefined,
  }
}

async function load(): Promise<void> {
  loading.value = true
  message.value = ''
  closePreview()
  try {
    const payload = await fetchCompanyDocuments(kind.value === 'flyer' ? 'image' : kind.value)
    remote.value = payload.data.map(asMedia)
  } catch {
    remote.value = []
    message.value = 'No se pudo cargar el material del catálogo.'
  } finally {
    loading.value = false
  }
}

function openPreview(item: MediaItem): void {
  preview.value = item
}

function closePreview(): void {
  preview.value = null
}

function onKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closePreview()
  }
}

async function downloadItem(item: MediaItem): Promise<void> {
  downloading.value = item.id

  try {
    const response = await fetch(item.url)
    if (!response.ok) {
      throw new Error('download')
    }

    const blob = await response.blob()
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = item.filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(href)
  } catch {
    window.open(item.url, '_blank', 'noopener')
  } finally {
    downloading.value = null
  }
}

watch(
  () => route.fullPath,
  () => {
    void load()
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKey)
  void load()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <RouterLink to="/app/tools" class="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
      <span class="rotate-180"><AppIcon name="chevron" :size="14" /></span>
      Herramientas
    </RouterLink>

    <ModuleBanner
      class="mt-4"
      :icon="bannerIcon"
      eyebrow="Herramientas"
      :title="meta.title"
      :body="meta.hint + ' El material lo registra la empresa en el catálogo.'"
      :actions="bannerActions"
    />

    <p v-if="loading" class="mt-8 text-sm text-muted">Cargando…</p>
    <p v-else-if="message" class="mt-8 rounded-card bg-card px-5 py-8 text-sm text-muted soft-shadow">{{ message }}</p>
    <p v-else-if="!items.length" class="mt-8 rounded-card bg-card px-5 py-8 text-sm text-muted soft-shadow">
      {{ meta.empty }}
    </p>

    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SoftCard v-for="item in items" :key="item.id" :padded="false" class="flex flex-col overflow-hidden">
        <button type="button" class="media-thumb" @click="openPreview(item)">
          <img v-if="item.format === 'image' || item.thumb" :src="item.thumb || item.url" :alt="item.title" />
          <span v-else class="grid h-full place-items-center bg-shell">
            <ClayTile
              :name="item.format === 'pdf' ? 'file' : item.format === 'audio' ? 'alarm' : 'play'"
              :tone="item.format === 'pdf' ? 'mint' : item.format === 'audio' ? 'orange' : 'coral'"
              size="lg"
            />
          </span>
        </button>
        <div class="flex flex-1 flex-col p-4">
          <p class="text-xs uppercase tracking-wide text-muted">{{ item.format }}</p>
          <h2 class="mt-1 font-medium">{{ item.title }}</h2>
          <div class="mt-4 flex gap-2">
            <SoftButton variant="yellow" @click="openPreview(item)">
              {{ item.format === 'audio' ? 'Escuchar' : 'Ver' }}
            </SoftButton>
            <SoftButton variant="outline" :disabled="downloading === item.id" @click="downloadItem(item)">
              <AppIcon name="download" :size="15" />
              {{ downloading === item.id ? '…' : 'Descargar' }}
            </SoftButton>
          </div>
        </div>
      </SoftCard>
    </div>

    <Teleport to="body">
      <div v-if="preview" class="media-layer" @click.self="closePreview">
        <div class="media-panel">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="font-medium">{{ preview.title }}</h2>
            <button type="button" class="text-sm text-muted" @click="closePreview">Cerrar</button>
          </div>

          <img v-if="preview.format === 'image'" :src="preview.url" :alt="preview.title" class="max-h-[70vh] w-full rounded-card-sm object-contain" />
          <iframe
            v-else-if="preview.format === 'pdf'"
            :src="preview.url"
            class="h-[70vh] w-full rounded-card-sm bg-white"
            title="Vista PDF"
          />
          <iframe
            v-else-if="preview.player === 'iframe' && preview.embedUrl"
            :src="preview.embedUrl"
            class="h-[70vh] w-full rounded-card-sm bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            title="Reproductor"
          />
          <video
            v-else-if="preview.format === 'video'"
            :src="preview.url"
            class="max-h-[70vh] w-full rounded-card-sm"
            controls
            playsinline
          />
          <audio v-else :src="preview.url" class="w-100 w-full" controls />

          <div class="mt-4 flex flex-wrap gap-2">
            <SoftButton variant="yellow" @click="downloadItem(preview)">
              <AppIcon name="download" :size="15" />
              Descargar
            </SoftButton>
            <a
              :href="preview.url"
              target="_blank"
              rel="noreferrer"
              class="inline-flex items-center justify-center rounded-btn border border-line bg-card px-5 py-2.5 text-sm font-medium"
            >
              Abrir en pestaña
            </a>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.media-thumb {
  display: block;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: var(--rex-shell);
  cursor: pointer;
}

.media-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-layer {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgba(17, 17, 17, 0.72);
}

.media-panel {
  width: min(920px, 100%);
  max-height: 90vh;
  overflow: auto;
  border-radius: 26px;
  background: var(--rex-card);
  padding: 1.25rem;
}
</style>
