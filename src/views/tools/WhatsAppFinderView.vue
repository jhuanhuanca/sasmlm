<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import ClayTile from '@/components/ui/ClayTile.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import { ownWaExtensionId, WA_STORE_EXTENSION_ID, WA_STORE_NAME, WA_STORE_URL, WA_STORE_VERSION } from '@/data/waExtension'
import {
  canProbeExtensions,
  isChromiumBrowser,
  probeChromeExtension,
  probeRexmlmBridge,
  type ExtensionProbe,
} from '@/utils/chromeExtension'

type Status = 'checking' | ExtensionProbe
type Notice = { tone: 'ok' | 'no' | 'warn'; text: string } | null

const storeStatus = ref<Status>('checking')
const ownStatus = ref<Status>('checking')
const checking = ref(false)
const notice = ref<Notice>(null)

const ownId = computed(() => ownWaExtensionId())
const chromium = computed(() => isChromiumBrowser())

const installed = computed(
  () => storeStatus.value === 'installed' || storeStatus.value === 'blocked' || ownStatus.value === 'installed',
)

const headline = computed(() => {
  if (checking.value || storeStatus.value === 'checking') {
    return 'Comprobando la extensión…'
  }
  if (installed.value) {
    return 'La extensión ya está instalada'
  }
  if (!chromium.value) {
    return 'Instálala en Chrome o Edge'
  }
  return 'Instala el buscador de WhatsApp'
})

function noticeFromStatus(): Notice {
  if (installed.value) {
    return { tone: 'ok', text: 'Confirmado: la extensión ya está instalada en este navegador.' }
  }
  if (storeStatus.value === 'missing') {
    return { tone: 'no', text: 'No está instalada. Pulsa “Instalar extensión” y vuelve a verificar.' }
  }
  return {
    tone: 'warn',
    text: 'No se pudo confirmar desde esta pestaña. Si la ves en chrome://extensions, ya está instalada.',
  }
}

async function probe(): Promise<void> {
  if (!canProbeExtensions()) {
    storeStatus.value = 'unknown'
    ownStatus.value = await probeRexmlmBridge(ownId.value)
    return
  }

  storeStatus.value = await probeChromeExtension(WA_STORE_EXTENSION_ID)
  ownStatus.value = await probeRexmlmBridge(ownId.value)
}

async function verify(): Promise<void> {
  checking.value = true
  notice.value = null
  await probe()
  notice.value = noticeFromStatus()
  checking.value = false
}

const canOpen = computed(() => installed.value || storeStatus.value === 'blocked')

function openExtension(): void {
  const runtime = (
    window as Window & {
      chrome?: { runtime?: { sendMessage?: (id: string, message: unknown, cb?: () => void) => void; lastError?: unknown } }
    }
  ).chrome?.runtime

  try {
    runtime?.sendMessage?.(WA_STORE_EXTENSION_ID, { type: 'rexmlm.open', source: 'sasmlm', action: 'scrape' }, () => {
      void runtime?.lastError
    })
  } catch {
    /* la extensión de la tienda no tiene por qué aceptar mensajes; igual abrimos WhatsApp Web */
  }

  window.location.assign('https://web.whatsapp.com/')
}

function onVisible(): void {
  if (document.visibilityState === 'visible') {
    void probe()
  }
}

onMounted(() => {
  void probe()
  document.addEventListener('visibilitychange', onVisible)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisible)
})
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <RouterLink to="/app/tools" class="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
      <span class="rotate-180"><AppIcon name="chevron" :size="14" /></span>
      Herramientas
    </RouterLink>

    <ModuleBanner
      class="mt-4"
      icon="whatsapp"
      eyebrow="Herramientas"
      title="Buscador de WhatsApp"
      body="Instalas la extensión en Chrome o Edge y luego la usas en Google o WhatsApp Web para encontrar grupos y contactos. Este panel solo te lleva a la tienda y confirma si ya está instalada."
      :actions="[
        'Abre Chrome Web Store y elige “Usar en Chrome”.',
        'Acepta permisos y fija el icono en la barra.',
        'Vuelve aquí y pulsa Verificar instalación.',
      ]"
    />

    <SoftCard>
      <div class="flex items-start gap-4">
        <ClayTile :name="installed ? 'check' : 'whatsapp'" :tone="installed ? 'mint' : 'royal'" />
        <div class="min-w-0">
          <p class="text-lg font-semibold">{{ headline }}</p>
          <p class="mt-1 text-sm text-muted">
            {{ WA_STORE_NAME }} {{ WA_STORE_VERSION }}.
            <span class="break-all">ID {{ WA_STORE_EXTENSION_ID }}</span>
          </p>
        </div>
      </div>

      <p v-if="!chromium" class="mt-6 rounded-input bg-shell px-4 py-3 text-sm">
        Chrome Web Store funciona mejor en <strong>Google Chrome</strong> o <strong>Microsoft Edge</strong>. Puedes abrir
        el enlace igual desde aquí.
      </p>

      <ol class="mt-6 space-y-4">
        <li class="flex gap-3">
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-charcoal text-xs text-on-charcoal">1</span>
          <div>
            <p class="font-medium">Abre la ficha de Chrome Web Store</p>
            <p class="mt-1 text-sm text-muted">Pulsa el botón amarillo. En la tienda elige “Usar en Chrome”.</p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-charcoal text-xs text-on-charcoal">2</span>
          <div>
            <p class="font-medium">Confirma la instalación</p>
            <p class="mt-1 text-sm text-muted">Acepta permisos y fija el icono en la barra del navegador.</p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-charcoal text-xs text-on-charcoal">3</span>
          <div>
            <p class="font-medium">Vuelve y verifica</p>
            <p class="mt-1 text-sm text-muted">Pulsa “Ya la instalé, verificar” para ver si quedó instalada.</p>
          </div>
        </li>
        <li class="flex gap-3">
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-charcoal text-xs text-on-charcoal">4</span>
          <div>
            <p class="font-medium">Úsala en Google o WhatsApp Web</p>
            <p class="mt-1 text-sm text-muted">Pulsa “Abrir extensión”: se abre WhatsApp Web en esta misma pestaña para el scraping. El service worker puede verse inactivo hasta entonces.</p>
          </div>
        </li>
      </ol>

      <p
        v-if="notice"
        class="mt-6 rounded-input px-4 py-3 text-sm"
        :class="
          notice.tone === 'ok'
            ? 'bg-yellow-soft text-ink'
            : notice.tone === 'no'
              ? 'bg-red-50 text-red-700'
              : 'bg-shell text-ink'
        "
      >
        {{ notice.text }}
      </p>

      <div class="mt-6 flex flex-wrap gap-3">
        <a
          :href="WA_STORE_URL"
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center justify-center rounded-btn bg-yellow px-5 py-2.5 text-sm font-medium text-on-yellow hover:bg-yellow-soft"
        >
          Instalar extensión
        </a>
        <SoftButton variant="outline" :disabled="checking" @click="verify">
          {{ checking ? 'Comprobando…' : 'Ya la instalé, verificar' }}
        </SoftButton>
        <SoftButton
          variant="charcoal"
          :disabled="!canOpen"
          title="Abre WhatsApp Web en esta misma pestaña para el scraping"
          @click="openExtension"
        >
          Abrir extensión
        </SoftButton>
      </div>
    </SoftCard>
  </div>
</template>
