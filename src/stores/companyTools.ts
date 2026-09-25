import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchAvailableCompanyTools } from '@/api/tools'
import { COMPANY_TOOL_KEYS, type CompanyToolKey } from '@/data/companyTools'
import { useAuthStore } from '@/stores/auth'

export const useCompanyToolsStore = defineStore('companyTools', () => {
  const keys = ref<string[]>([...COMPANY_TOOL_KEYS])
  const loaded = ref(false)
  const companyId = ref(0)

  const auth = useAuthStore()

  const activeCompanyId = computed(
    () => auth.user?.active_catalog_company_id || auth.user?.catalog_company_id || 0,
  )

  async function load(force = false): Promise<void> {
    const nextId = activeCompanyId.value
    if (!force && loaded.value && companyId.value === nextId) {
      return
    }

    try {
      const payload = await fetchAvailableCompanyTools()
      const next = Array.isArray(payload.tools) ? payload.tools : [...COMPANY_TOOL_KEYS]
      keys.value = next.filter((key) => COMPANY_TOOL_KEYS.includes(key as CompanyToolKey))
    } catch {
      keys.value = [...COMPANY_TOOL_KEYS]
    } finally {
      companyId.value = nextId
      loaded.value = true
    }
  }

  function allows(key: CompanyToolKey): boolean {
    return keys.value.includes(key)
  }

  return { keys, loaded, load, allows }
})
