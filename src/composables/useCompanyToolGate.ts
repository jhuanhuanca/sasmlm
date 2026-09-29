import { onMounted, unref, watch, type MaybeRef } from 'vue'
import type { CompanyToolKey } from '@/data/companyTools'
import { useCompanyToolsStore } from '@/stores/companyTools'

export function useCompanyToolGate(key: MaybeRef<CompanyToolKey>) {
  const companyTools = useCompanyToolsStore()

  async function enforce(): Promise<void> {
    await companyTools.load()
  }

  onMounted(enforce)
  watch(() => unref(key), enforce)
}
