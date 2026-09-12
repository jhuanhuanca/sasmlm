<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import { useToast } from '@/composables/useToast'
import { useThemeStore } from '@/stores/theme'
import type { PaletteTokens } from '@/data/palettes'

const theme = useThemeStore()
const toast = useToast()
const { mode, tokens, presets, isCustom, palette } = storeToRefs(theme)

const fields: Array<{ key: keyof PaletteTokens; label: string; hint: string }> = [
  { key: 'primary', label: 'Color principal', hint: 'Botones, acentos y progreso' },
  { key: 'secondary', label: 'Color secundario', hint: 'Navegación activa y bloques fuertes' },
  { key: 'background', label: 'Fondo', hint: 'Fondo del panel' },
  { key: 'card', label: 'Tarjetas', hint: 'Cajas y menús' },
  { key: 'text', label: 'Texto', hint: 'Títulos y contenido' },
]

function updateToken(key: keyof PaletteTokens, event: Event): void {
  const target = event.target
  if (target instanceof HTMLInputElement) {
    theme.setToken(key, target.value)
  }
}
</script>

<template>
  <section class="space-y-6">
    <div>
      <p class="text-xs tracking-[0.18em] text-muted uppercase">Apariencia</p>
      <h2 class="font-display mt-2 text-2xl font-bold tracking-tight md:text-3xl">Paleta del dashboard</h2>
      <p class="mt-2 max-w-2xl text-sm text-muted">
        Elige una paleta o ajusta los colores. Se guardan en este navegador y se aplican al modo
        {{ mode === 'dark' ? 'oscuro' : 'claro' }}.
      </p>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-full px-4 py-2 text-sm font-medium"
        :class="mode === 'dark' ? 'bg-yellow text-on-yellow' : 'border border-line bg-card text-ink'"
        @click="theme.setMode('dark'); toast.info('El panel quedó en modo oscuro.', 'Apariencia')"
      >
        Oscuro
      </button>
      <button
        type="button"
        class="rounded-full px-4 py-2 text-sm font-medium"
        :class="mode === 'light' ? 'bg-yellow text-on-yellow' : 'border border-line bg-card text-ink'"
        @click="theme.setMode('light'); toast.info('El panel quedó en modo claro.', 'Apariencia')"
      >
        Claro
      </button>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        class="rounded-card border p-4 text-left transition"
        :class="
          palette.presetId === preset.id
            ? 'border-yellow bg-card'
            : 'border-line bg-card hover:border-gray-mid'
        "
        @click="theme.setPreset(preset.id); toast.success(`${preset.name} aplicada en este dispositivo.`, 'Paleta aplicada')"
      >
        <span class="flex gap-1.5">
          <span
            class="h-7 w-7 rounded-full border border-line"
            :style="{ background: preset[mode].primary }"
          />
          <span
            class="h-7 w-7 rounded-full border border-line"
            :style="{ background: preset[mode].secondary }"
          />
          <span
            class="h-7 w-7 rounded-full border border-line"
            :style="{ background: preset[mode].background }"
          />
          <span
            class="h-7 w-7 rounded-full border border-line"
            :style="{ background: preset[mode].card }"
          />
        </span>
        <span class="mt-3 block font-medium">{{ preset.name }}</span>
        <span class="mt-1 block text-sm text-muted">{{ preset.hint }}</span>
      </button>
    </div>

    <SoftCard>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold">Colores personalizados</h3>
          <p class="mt-1 text-sm text-muted">
            {{ isCustom ? 'Estás usando una paleta propia.' : 'Cambia un color para crear tu paleta.' }}
          </p>
        </div>
        <SoftButton variant="outline" @click="theme.resetPalette(); toast.success('Volviste a los colores de REXmlm.', 'Paleta restaurada')">Restaurar REXmlm</SoftButton>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <label v-for="field in fields" :key="field.key" class="block">
          <span class="mb-1.5 block text-[13px] font-medium text-muted">{{ field.label }}</span>
          <span class="flex items-center gap-3 rounded-input border border-line bg-shell px-3 py-2">
            <input
              :value="tokens[field.key]"
              type="color"
              class="h-9 w-9 cursor-pointer rounded-full border-0 bg-transparent p-0"
              :aria-label="field.label"
              @input="updateToken(field.key, $event)"
            />
            <input
              :value="tokens[field.key]"
              type="text"
              maxlength="7"
              class="min-w-0 flex-1 bg-transparent text-sm uppercase outline-none"
              :aria-label="`${field.label} hexadecimal`"
              @change="updateToken(field.key, $event)"
            />
          </span>
          <span class="mt-1.5 block text-xs text-muted">{{ field.hint }}</span>
        </label>
      </div>

      <div class="mt-8 overflow-hidden rounded-card-sm border border-line">
        <div class="bg-shell px-5 py-4">
          <p class="text-xs tracking-[0.18em] text-muted uppercase">Vista previa</p>
          <p class="mt-2 font-display text-2xl font-bold">Tu panel</p>
        </div>
        <div class="grid gap-3 bg-shell p-5 sm:grid-cols-3">
          <div class="rounded-card-sm bg-card p-4">
            <span class="grid h-9 w-9 place-items-center rounded-full bg-yellow text-on-yellow text-sm font-semibold">
              R
            </span>
            <p class="mt-3 font-medium">Acento</p>
            <p class="mt-1 text-sm text-muted">Color principal</p>
          </div>
          <div class="rounded-card-sm bg-charcoal p-4 text-on-charcoal">
            <p class="text-sm opacity-70">Secundario</p>
            <p class="mt-2 font-display text-2xl font-bold">55%</p>
          </div>
          <div class="rounded-card-sm bg-card p-4">
            <span class="mb-3 block h-2 rounded-full bg-line">
              <span class="block h-2 w-2/3 rounded-full bg-yellow" />
            </span>
            <p class="font-medium">Progreso</p>
            <p class="mt-1 text-sm text-muted">Fondo, tarjeta y texto</p>
          </div>
        </div>
      </div>
    </SoftCard>
  </section>
</template>
