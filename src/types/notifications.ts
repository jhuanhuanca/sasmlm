export type InventoryAlertKind = 'low_stock' | 'expiring' | 'expired' | string

export interface InventoryNotification {
  id: string
  kind: InventoryAlertKind
  title: string
  body: string
  product_id: number | null
  product_name: string | null
  stock: number | null
  expires_at: string | null
  read_at: string | null
  created_at: string
}
