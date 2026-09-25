<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import ClayTile from '@/components/ui/ClayTile.vue'
import CompanyScopeBar from '@/components/company/CompanyScopeBar.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import { COMPANY_TOOL_CARDS } from '@/data/companyTools'
import { useCompanyToolsStore } from '@/stores/companyTools'

const companyTools = useCompanyToolsStore()
const tools = computed(() => COMPANY_TOOL_CARDS.filter((tool) => companyTools.allows(tool.key)))

onMounted(() => {
  void companyTools.load()
})
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
        'Mide talla de anillo o prueba una joya en AR.',
        'Instala el buscador de grupos de WhatsApp si prospectas ahí.',
      ]"
    />
    </div>

    <CompanyScopeBar class="mt-4" label="Herramientas de" @changed="companyTools.load(true)" />

    <p v-if="companyTools.loaded && !tools.length" class="mt-8 text-sm text-muted">
      Esta empresa no tiene herramientas activas. El administrador las elige en el catálogo.
    </p>

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
