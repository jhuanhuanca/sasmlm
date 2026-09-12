<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import CompanyScopeBar from '@/components/company/CompanyScopeBar.vue'
import FwpQvitalConsult from '@/views/tools/FwpQvitalConsult.vue'
import HgwQvitalConsult from '@/views/tools/HgwQvitalConsult.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isFwp = computed(() => {
  const activeId = auth.user?.active_catalog_company_id || auth.user?.catalog_company_id || 0
  const fromMembership = auth.user?.companies?.find((row) => row.catalog_company_id === activeId)?.catalog_company_name
  const name = (fromMembership || auth.user?.company?.name || auth.user?.catalog_company_name || '').toLowerCase()
  return name.includes('fwp') || name.includes('future world')
})
</script>

<template>
  <div class="mx-auto max-w-5xl pb-10">
    <RouterLink to="/app/tools/wellness" class="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
      <span class="rotate-180"><AppIcon name="chevron" :size="14" /></span>
      Bienestar y salud
    </RouterLink>

    <CompanyScopeBar class="mt-4" />
    <FwpQvitalConsult v-if="isFwp" />
    <HgwQvitalConsult v-else />
  </div>
</template>
