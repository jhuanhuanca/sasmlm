import { onMounted, unref, watch, type MaybeRef } from 'vue'
import { useRouter } from 'vue-router'
import type { CompanyToolKey } from '@/data/companyTools'
import { useCompanyToolsStore } from '@/stores/companyTools'

export function useCompanyToolGate(key: MaybeRef<CompanyToolKey>) {
  const router = useRouter()
  const companyTools = useCompanyToolsStore()

  async function enforce(): Promise<void> {
    await companyTools.load()
    if (!companyTools.allows(unref(key))) {
      await router.replace({ name: 'tools' })
    }
  }

  onMounted(enforce)
  watch(() => unref(key), enforce)
}