<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ClayTile from '@/components/ui/ClayTile.vue'
import type { ClayTone } from '@/components/ui/ClayTile.vue'
import type { IconName } from '@/components/ui/AppIcon.vue'
import CompanyScopeBar from '@/components/company/CompanyScopeBar.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftCard from '@/components/ui/SoftCard.vue'

const tools: Array<{
  to: string
  title: string
  hint: string
  icon: IconName
  tone: ClayTone
}> = [
  {
    to: '/app/tools/wellness',
    title: 'Bienestar y salud',
    hint: 'Elige una dolencia y arma la recomendación con productos de tu empresa.',
    icon: 'heart',
    tone: 'mint',
  },
  {
    to: '/app/tools/imc',
    title: 'Calculadora IMC',
    hint: 'Mide el índice de masa corporal y abre el paquete para bajar o subir de peso.',
    icon: 'star',
    tone: 'yellow',
  },
  {
    to: '/app/tools/wellness/consulta',
    title: 'Consulta personalizada',
    hint: 'Cuestionario de hábitos e historial. Las recomendaciones de productos salen del catálogo de tu empresa.',
    icon: 'clipboard',
    tone: 'lavender',
  },
  {
    to: '/app/tools/flyers',
    title: 'Flyers',
    hint: 'Imágenes descargables para compartir.',
    icon: 'folder',
    tone: 'sky',
  },
  {
    to: '/app/tools/pdfs',
    title: 'PDFs',
    hint: 'Documentos PDF para ver y descargar.',
    icon: 'file',
    tone: 'mint',
  },
  {
    to: '/app/tools/videos',
    title: 'Videos',
    hint: 'Videos para ver y descargar.',
    icon: 'play',
    tone: 'coral',
  },
  {
    to: '/app/tools/audios',
    title: 'Audios',
    hint: 'Audios para escuchar y descargar.',
    icon: 'alarm',
    tone: 'orange',
  },
]
</script>

<template>
  <div>
    <div data-tour="tools-welcome">
    <ModuleBanner
      icon="heart"
      eyebrow="Herramientas"
      title="Kit para asesorar"
      body="Recursos para hablar con claridad con un cliente o un socio: protocolos de bienestar, IMC, material descargable y WhatsApp. No reemplazan una consulta médica."
      :actions="[
        'Elige una dolencia y copia el protocolo de tu empresa.',
        'Mide IMC y abre el paquete de peso.',
        'Descarga flyers, PDFs, videos o audios para compartir.',
        'Instala el buscador de grupos de WhatsApp si prospectas ahí.',
      ]"
    />
    </div>

    <CompanyScopeBar class="mt-4" label="Herramientas de" />

    <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-tour="tools-grid">
      <RouterLink v-for="tool in tools" :key="tool.to" :to="tool.to" class="group">
        <SoftCard class="h-full transition group-hover:-translate-y-0.5">
          <ClayTile :name="tool.icon" :tone="tool.tone" size="md" />
          <h2 class="mt-4 text-lg font-semibold">{{ tool.title }}</h2>
          <p class="mt-2 text-sm text-muted">{{ tool.hint }}</p>
          <p class="mt-4 text-sm font-medium">Abrir →</p>
        </SoftCard>
      </RouterLink>
    </div>
  </div>
</template>
