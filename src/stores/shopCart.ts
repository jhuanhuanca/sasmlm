import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ShopCartLine, ShopProduct } from '@/types/shop'
import { normalizeCurrency } from '@/data/currencies'

export const useShopCartStore = defineStore('shop-cart', () => {
  const lines = ref<ShopCartLine[]>([])
  const open = ref(false)

  const count = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0))
  const currency = computed(() =>
    lines.value[0] ? normalizeCurrency(lines.value[0].product.currency) : 'USD',
  )
  const subtotal = computed(() =>
    lines.value.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  )

  function add(product: ShopProduct, quantity = 1): string | null {
    const nextCurrency = normalizeCurrency(product.currency)
    const conflict = lines.value.find(
      (line) => normalizeCurrency(line.product.currency) !== nextCurrency,
    )
    if (conflict) {
      return `El carrito solo admite una moneda (${normalizeCurrency(conflict.product.currency)}). Quita esos productos para agregar uno en ${nextCurrency}.`
    }

    const current = lines.value.find((line) => line.product.id === product.id)

    if (current) {
      current.quantity += quantity
      return null
    }

    lines.value.push({ product, quantity })
    return null
  }

  function setQuantity(productId: number, quantity: number): void {
    if (quantity < 1) {
      remove(productId)
      return
    }

    const current = lines.value.find((line) => line.product.id === productId)
    if (current) {
      current.quantity = quantity
    }
  }

  function remove(productId: number): void {
    lines.value = lines.value.filter((line) => line.product.id !== productId)
  }

  function clear(): void {
    lines.value = []
  }

  return { lines, open, count, currency, subtotal, add, setQuantity, remove, clear }
})
