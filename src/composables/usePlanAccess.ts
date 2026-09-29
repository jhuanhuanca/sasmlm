import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  featureAllowed,
  PLAN_MODULE_COPY,
  toolNeedsPlan,
  type PlanModuleKey,
} from '@/data/planModules'
import type { CompanyToolKey } from '@/data/companyTools'

export function usePlanAccess() {
  const auth = useAuthStore()

  const flags = computed(() => auth.entitlements)

  function canUse(feature: PlanModuleKey): boolean {
    if (auth.isAdmin) {
      return true
    }

    const flags = auth.entitlements
    if (feature === 'whatsapp_chatbot') {
      if (flags?.whatsapp_chatbot === true) {
        return true
      }
      const hay = `${auth.user?.billing?.plan?.slug ?? ''} ${auth.user?.billing?.plan?.name ?? ''}`.toLowerCase()
      return hay.includes('premium') || hay.includes('enterprise')
    }

    return featureAllowed(flags, feature)
  }

  function canUseTool(key: CompanyToolKey): boolean {
    return canUse(toolNeedsPlan(key))
  }

  function lockCopy(feature: PlanModuleKey) {
    return PLAN_MODULE_COPY[feature]
  }

  return { canUse, canUseTool, lockCopy, flags }
}
