<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import ClayTile from '@/components/ui/ClayTile.vue'
import CompanyScopeBar from '@/components/company/CompanyScopeBar.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import { COMPANY_TOOL_CARDS } from '@/data/companyTools'
import { PLAN_MODULE_COPY, toolNeedsPlan } from '@/data/planModules'
import { useCompanyToolsStore } from '@/stores/companyTools'
import { usePlanAccess } from '@/composables/usePlanAccess'

const companyTools = useCompanyToolsStore()
const { canUseTool } = usePlanAccess()

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
      body="Ves el kit completo. Si una tarjeta no está en tu plan, al abrirla te pedimos mejorar el plan."
      :actions="[
        'Elige una dolencia y copia el protocolo de tu empresa.',
        'Mide IMC y abre el paquete de peso.',
        'Descarga flyers, PDFs, videos o audios para compartir.',
        'Mide talla de anillo o prueba una joya en AR.',
        'Chatbot WhatsApp: ingresar, configurar o pedir ayuda (Premium).',
      ]"
    />
    </div>

    <CompanyScopeBar class="mt-4" label="Herramientas de" @changed="companyTools.load(true)" />

    <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-tour="tools-grid">
      <RouterLink v-for="tool in COMPANY_TOOL_CARDS" :key="tool.key" :to="tool.to || '/app/tools'" class="group">
        <SoftCard class="h-full transition group-hover:-translate-y-0.5">
          <ClayTile :name="tool.icon" :tone="tool.tone" size="md" />
          <h2 class="mt-4 text-lg font-semibold">{{ tool.title }}</h2>
          <p class="mt-2 text-sm text-muted">{{ tool.hint }}</p>
          <p v-if="canUseTool(tool.key)" class="mt-4 text-sm font-medium">Abrir →</p>
          <p v-else class="mt-4 text-sm font-medium text-red-700">
            En {{ PLAN_MODULE_COPY[toolNeedsPlan(tool.key)].includedIn }} →
          </p>
        </SoftCard>
      </RouterLink>
    </div>
  </div>
</template>
