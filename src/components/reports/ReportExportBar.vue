<script setup lang="ts">
import { ref } from 'vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useToast } from '@/composables/useToast'
import { errorMessage } from '@/utils/http'
import { filenameFromDisposition, saveBlob } from '@/utils/downloadFile'
import { api } from '@/api/client'

const props = defineProps<{
  label: string
  hint?: string
  path: string
  query?: Record<string, string>
  fileBase: string
}>()

const toast = useToast()
const busy = ref<'xlsx' | 'pdf' | null>(null)

async function download(format: 'xlsx' | 'pdf'): Promise<void> {
  busy.value = format
  try {
    const response = await api.raw<Blob, 'blob'>(props.path, {
      query: { ...props.query, format },
      responseType: 'blob',
    })
    const blob = response._data
    if (!blob) {
      throw new Error('empty')
    }
    const name = filenameFromDisposition(
      response.headers.get('content-disposition'),
      `${props.fileBase}.${format}`,
    )
    saveBlob(blob, name)
    toast.success(format === 'pdf' ? 'PDF listo.' : 'Excel listo.', props.label)
  } catch (error) {
    toast.fromError(error, errorMessage(error, 'No se pudo descargar el reporte'))
  } finally {
    busy.value = null
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <p class="mr-1 text-sm text-muted">
      <span class="font-medium text-ink">{{ label }}</span>
      <span v-if="hint"> · {{ hint }}</span>
    </p>
    <SoftButton variant="outline" :disabled="busy !== null" @click="download('xlsx')">
      <AppIcon name="download" :size="15" />
      {{ busy === 'xlsx' ? 'Excel…' : 'Excel' }}
    </SoftButton>
    <SoftButton variant="outline" :disabled="busy !== null" @click="download('pdf')">
      <AppIcon name="file" :size="15" />
      {{ busy === 'pdf' ? 'PDF…' : 'PDF' }}
    </SoftButton>
  </div>
</template>
