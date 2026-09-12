<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { fetchOrderVoucherBlob } from '@/api/store'

const props = defineProps<{
  orderId: number
}>()

const src = ref('')
const failed = ref(false)

async function load(): Promise<void> {
  failed.value = false
  if (src.value) {
    URL.revokeObjectURL(src.value)
    src.value = ''
  }

  try {
    const blob = await fetchOrderVoucherBlob(props.orderId)
    src.value = URL.createObjectURL(blob)
  } catch {
    failed.value = true
  }
}

onMounted(() => {
  void load()
})

watch(
  () => props.orderId,
  () => {
    void load()
  },
)

onBeforeUnmount(() => {
  if (src.value) {
    URL.revokeObjectURL(src.value)
  }
})
</script>

<template>
  <a
    v-if="src"
    :href="src"
    class="block h-16 w-16 overflow-hidden rounded-md border border-line bg-white"
    target="_blank"
    rel="noreferrer"
    title="Ver comprobante"
  >
    <img :src="src" alt="Comprobante" class="h-full w-full object-cover" />
  </a>
  <span v-else class="text-muted">{{ failed ? 'No se pudo abrir' : 'Cargando…' }}</span>
</template>
