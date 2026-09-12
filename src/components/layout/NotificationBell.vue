<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ClayTile from '@/components/ui/ClayTile.vue'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/api/notifications'
import type { InventoryNotification } from '@/types/notifications'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const open = ref(false)
const loading = ref(false)
const unread = ref(0)
const items = ref<InventoryNotification[]>([])
const menu = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

async function load(): Promise<void> {
  try {
    const payload = await fetchNotifications()
    unread.value = payload.unread_count
    items.value = payload.data
  } catch {
    unread.value = 0
  }
}

async function toggle(): Promise<void> {
  open.value = !open.value
  if (open.value) {
    loading.value = true
    await load()
    loading.value = false
  }
}

async function openItem(item: InventoryNotification): Promise<void> {
  if (!item.read_at) {
    try {
      await markNotificationRead(item.id)
      item.read_at = new Date().toISOString()
      unread.value = Math.max(0, unread.value - 1)
    } catch {
      // keep the list usable even if the mark-read call fails
    }
  }
  open.value = false
  await router.push({ name: 'store' })
}

async function markAll(): Promise<void> {
  await markAllNotificationsRead()
  items.value = items.value.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() }))
  unread.value = 0
}

function onDocumentClick(event: MouseEvent): void {
  if (!menu.value?.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  void load()
  timer = setInterval(() => {
    void load()
  }, 60000)
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="menu" class="relative">
    <button
      type="button"
      class="relative grid place-items-center"
      title="Notificaciones"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <ClayTile name="bell" size="sm" />
      <span
        v-if="unread > 0"
        class="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-yellow px-1 text-[10px] font-semibold text-on-yellow"
      >
        {{ unread > 9 ? '9+' : unread }}
      </span>
    </button>
    <div
      v-if="open"
      class="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-card border border-line bg-card shadow-lg"
      role="menu"
    >
      <div class="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <p class="text-sm font-medium">Avisos de inventario</p>
        <button
          v-if="unread > 0"
          type="button"
          class="text-xs text-muted hover:text-ink"
          @click="markAll"
        >
          Marcar leídos
        </button>
      </div>
      <p v-if="loading" class="px-4 py-6 text-sm text-muted">Cargando…</p>
      <p v-else-if="!items.length" class="px-4 py-6 text-sm text-muted">No hay avisos de stock ni vencimiento.</p>
      <ul v-else class="max-h-80 overflow-y-auto">
        <li v-for="item in items" :key="item.id">
          <button
            type="button"
            class="flex w-full flex-col gap-1 px-4 py-3 text-left text-sm hover:bg-shell"
            :class="item.read_at ? 'text-muted' : 'text-ink'"
            @click="openItem(item)"
          >
            <span class="flex items-center justify-between gap-2">
              <span class="font-medium">{{ item.title }}</span>
              <span v-if="!item.read_at" class="h-2 w-2 shrink-0 rounded-full bg-yellow" />
            </span>
            <span>{{ item.body }}</span>
            <span class="text-xs text-muted">{{ formatDateTime(item.created_at) }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
