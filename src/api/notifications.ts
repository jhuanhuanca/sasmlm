import { api } from '@/api/client'
import type { InventoryNotification } from '@/types/notifications'

export async function fetchNotifications(): Promise<{ unread_count: number; data: InventoryNotification[] }> {
  return api<{ unread_count: number; data: InventoryNotification[] }>('/notifications')
}

export async function markNotificationRead(id: string): Promise<void> {
  await api(`/notifications/${id}/read`, { method: 'POST' })
}

export async function markAllNotificationsRead(): Promise<void> {
  await api('/notifications/read-all', { method: 'POST' })
}
