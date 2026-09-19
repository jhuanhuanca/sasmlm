<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftField from '@/components/ui/SoftField.vue'
import { fetchMyShippingQuote, fetchShippingQuote } from '@/api/store'
import type { PlacePosOrderPayload, Product } from '@/types/store'
import {
  SHIPPING_COUNTRIES,
  departmentsOf,
  type DropshippingSettings,
  type ShippingQuote,
} from '@/data/shipping'
import { money } from '@/utils/format'
import { normalizeCurrency } from '@/data/currencies'
import { fieldControlClass } from '@/utils/ui'

const props = defineProps<{
  open: boolean
  products: Product[]
  seed: Product | null
  shipping: DropshippingSettings
  saving?: boolean
  errors?: Record<string, string[]>
  storeSlug?: string
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: PlacePosOrderPayload]
}>()

const search = ref('')
const quoting = ref(false)
const quote = ref<ShippingQuote | null>(null)
const lines = ref<Array<{ product: Product; quantity: number }>>([])
const form = reactive({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  delivery: 'pickup' as 'pickup' | 'shipping',
  shipping_country: '',
  shipping_department: '',
  shipping_area: '',
  shipping_address: '',
  mark_paid: true,
})

const shippingOn = computed(() => props.shipping.enabled)
const departments = computed(() => departmentsOf(form.shipping_country))
const catalog = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.products.filter((product) => {
    if (!canSell(product)) {
      return false
    }
    if (!q) {
      return true
    }
    return product.name.toLowerCase().includes(q)
  })
})
const subtotal = computed(() =>
  lines.value.reduce((sum, line) => sum + Number(line.product.price) * line.quantity, 0),
)
const shippingFee = computed(() =>
  form.delivery === 'shipping' && quote.value?.applies ? quote.value.fee : 0,
)
const saleCurrency = computed(() =>
  lines.value[0] ? normalizeCurrency(lines.value[0].product.currency) : 'USD',
)
const grandTotal = computed(() => subtotal.value + shippingFee.value)

function canSell(product: Product): boolean {
  if (!product.is_active || product.is_expired) {
    return false
  }
  if (product.fulfillment === 'dropship') {
    return true
  }
  return product.stock > 0
}

function maxQty(product: Product): number {
  if (product.fulfillment === 'dropship' && product.stock === 0) {
    return 99
  }
  return Math.max(1, product.stock)
}

function add(product: Product): void {
  const next = normalizeCurrency(product.currency)
  const conflict = lines.value.find((line) => normalizeCurrency(line.product.currency) !== next)
  if (conflict) {
    window.alert(`Esta venta solo admite una moneda (${normalizeCurrency(conflict.product.currency)}).`)
    return
  }
  const existing = lines.value.find((line) => line.product.id === product.id)
  if (existing) {
    existing.quantity = Math.min(maxQty(product), existing.quantity + 1)
    return
  }
  lines.value = [...lines.value, { product, quantity: 1 }]
}

function setQty(id: number, quantity: number): void {
  lines.value = lines.value
    .map((line) =>
      line.product.id === id
        ? { ...line, quantity: Math.min(maxQty(line.product), Math.max(1, quantity)) }
        : line,
    )
    .filter((line) => line.quantity > 0)
}

function remove(id: number): void {
  lines.value = lines.value.filter((line) => line.product.id !== id)
}

async function refreshQuote(): Promise<void> {
  if (!shippingOn.value || form.delivery !== 'shipping' || !form.shipping_country) {
    quote.value = null
    return
  }
  quoting.value = true
  try {
    const query = {
      country: form.shipping_country,
      department: form.shipping_department,
      area: form.shipping_area,
      subtotal: subtotal.value,
    }
    quote.value = props.storeSlug
      ? await fetchShippingQuote(props.storeSlug, query)
      : await fetchMyShippingQuote(query)
  } catch {
    quote.value = null
  } finally {
    quoting.value = false
  }
}

watch(
  () => props.open,
  (open) => {
    if (!open) {
      return
    }
    search.value = ''
    form.customer_name = ''
    form.customer_email = ''
    form.customer_phone = ''
    form.delivery = 'pickup'
    form.shipping_country = props.shipping.origin_country || ''
    form.shipping_department = ''
    form.shipping_area = ''
    form.shipping_address = ''
    form.mark_paid = true
    lines.value = props.seed && canSell(props.seed) ? [{ product: props.seed, quantity: 1 }] : []
  },
)

watch(
  () => [form.delivery, form.shipping_country, form.shipping_department, form.shipping_area, subtotal.value],
  () => {
    void refreshQuote()
  },
)

watch(
  () => form.shipping_country,
  (next, prev) => {
    if (prev && next !== prev) {
      form.shipping_department = ''
    }
  },
)

function submit(): void {
  if (!lines.value.length || !form.customer_name.trim()) {
    return
  }
  emit('submit', {
    customer_name: form.customer_name.trim(),
    customer_email: form.customer_email.trim() || undefined,
    customer_phone: form.customer_phone.trim() || undefined,
    items: lines.value.map((line) => ({
      product_id: line.product.id,
      quantity: line.quantity,
    })),
    delivery: shippingOn.value ? form.delivery : 'pickup',
    mark_paid: form.mark_paid,
    ...(form.delivery === 'shipping' && shippingOn.value
      ? {
          shipping_country: form.shipping_country,
          shipping_department: form.shipping_department || undefined,
          shipping_area: form.shipping_area || undefined,
          shipping_address: form.shipping_address || undefined,
        }
      : {}),
  })
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center"
    @click.self="emit('close')"
  >
    <div class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-card shadow-lg">
      <div class="border-b border-line px-5 py-4">
        <h2 class="font-medium">Registrar venta directa</h2>
        <p class="mt-1 text-sm text-muted">
          Sin pasar por la tienda pública. Descuenta stock de tu bodega. Si activaste envíos, usa las mismas tarifas.
        </p>
      </div>
      <form class="flex min-h-0 flex-1 flex-col overflow-auto px-5 py-4" @submit.prevent="submit">
        <div class="grid gap-4 lg:grid-cols-2">
          <div class="space-y-3">
            <SoftField label="Cliente" :error="errors?.customer_name?.[0]">
              <input v-model="form.customer_name" :class="fieldControlClass" required placeholder="Nombre y apellido" />
            </SoftField>
            <SoftField label="WhatsApp / teléfono">
              <input v-model="form.customer_phone" :class="fieldControlClass" inputmode="tel" />
            </SoftField>
            <SoftField label="Correo (opcional)">
              <input v-model="form.customer_email" :class="fieldControlClass" type="email" />
            </SoftField>
            <template v-if="shippingOn">
              <SoftField label="Entrega">
                <select v-model="form.delivery" :class="fieldControlClass">
                  <option value="pickup">Retiro / entrega en mano</option>
                  <option value="shipping">Envío</option>
                </select>
              </SoftField>
              <template v-if="form.delivery === 'shipping'">
                <SoftField label="País" :error="errors?.shipping_country?.[0]">
                  <select v-model="form.shipping_country" :class="fieldControlClass" required>
                    <option value="">Elige país</option>
                    <option v-for="country in SHIPPING_COUNTRIES" :key="country.code" :value="country.code">
                      {{ country.name }}
                    </option>
                  </select>
                </SoftField>
                <SoftField v-if="departments.length" label="Departamento">
                  <select v-model="form.shipping_department" :class="fieldControlClass">
                    <option value="">Elige departamento</option>
                    <option v-for="item in departments" :key="item" :value="item">{{ item }}</option>
                  </select>
                </SoftField>
                <SoftField label="Zona / ciudad">
                  <input v-model="form.shipping_area" :class="fieldControlClass" />
                </SoftField>
                <SoftField label="Dirección">
                  <input v-model="form.shipping_address" :class="fieldControlClass" />
                </SoftField>
              </template>
            </template>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.mark_paid" type="checkbox" />
              Ya cobré (queda como venta pagada)
            </label>
          </div>
          <div class="space-y-3">
            <SoftField label="Buscar producto">
              <input v-model="search" :class="fieldControlClass" placeholder="Nombre" />
            </SoftField>
            <ul class="max-h-40 space-y-1 overflow-auto rounded-lg border border-line p-2">
              <li v-if="!catalog.length" class="px-1 py-2 text-sm text-muted">No hay stock vendible.</li>
              <li v-for="product in catalog" :key="product.id" class="flex items-center justify-between gap-2 text-sm">
                <span class="min-w-0 truncate">
                  {{ product.name }}
                  <span class="text-muted">· {{ money(product.price, product.currency) }}</span>
                </span>
                <SoftButton variant="outline" type="button" @click="add(product)">Añadir</SoftButton>
              </li>
            </ul>
            <ul v-if="lines.length" class="space-y-2">
              <li v-for="line in lines" :key="line.product.id" class="flex items-center gap-2 text-sm">
                <span class="min-w-0 flex-1 truncate">{{ line.product.name }}</span>
                <input
                  :value="line.quantity"
                  :class="fieldControlClass"
                  class="w-16"
                  type="number"
                  min="1"
                  :max="maxQty(line.product)"
                  @input="setQty(line.product.id, Number(($event.target as HTMLInputElement).value))"
                />
                <span class="w-20 text-right">{{ money(Number(line.product.price) * line.quantity, line.product.currency) }}</span>
                <button type="button" class="text-muted" @click="remove(line.product.id)">Quitar</button>
              </li>
            </ul>
            <p class="flex justify-between text-sm">
              <span>Productos</span>
              <span>{{ money(subtotal, saleCurrency) }}</span>
            </p>
            <p v-if="shippingOn && form.delivery === 'shipping'" class="flex justify-between text-sm">
              <span>{{ quote?.free ? 'Envío (gratis)' : quote?.zone ? `Envío · ${quote.zone}` : 'Envío' }}</span>
              <span>{{ quoting ? '…' : money(shippingFee, quote?.currency || saleCurrency) }}</span>
            </p>
            <p class="text-lg font-semibold">{{ money(grandTotal, quote?.currency || saleCurrency) }}</p>
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <SoftButton variant="outline" type="button" @click="emit('close')">Cancelar</SoftButton>
          <SoftButton variant="yellow" type="submit" :disabled="saving || !lines.length">Registrar venta</SoftButton>
        </div>
      </form>
    </div>
  </div>
</template>
