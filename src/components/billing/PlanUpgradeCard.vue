<script setup lang="ts">
import { RouterLink } from 'vue-router'
import SoftCard from '@/components/ui/SoftCard.vue'
import { PLAN_MODULE_COPY, type PlanModuleKey } from '@/data/planModules'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  feature: PlanModuleKey
}>()

const auth = useAuthStore()
const copy = PLAN_MODULE_COPY[props.feature]
const planName = auth.user?.billing?.plan?.name ?? 'tu plan actual'
</script>

<template>
  <SoftCard class="mx-auto max-w-lg text-center">
    <p class="text-xs font-semibold uppercase tracking-wide text-muted">No incluido en {{ planName }}</p>
    <h2 class="mt-3 font-display text-2xl font-bold">{{ copy.title }}</h2>
    <p class="mt-3 text-sm text-muted">
      {{ copy.benefit }} Este módulo va en <strong class="text-ink">{{ copy.includedIn }}</strong>.
      Con tu plan actual lo ves para que sepas qué te estás perdiendo; para usarlo hay que mejorar el plan.
    </p>
    <RouterLink
      class="mt-6 inline-flex items-center justify-center rounded-btn bg-yellow px-5 py-2.5 text-sm font-medium text-on-yellow hover:bg-yellow-soft"
      to="/app/profile#mejorar-plan"
    >
      Mejorar mi plan
    </RouterLink>
  </SoftCard>
</template>
