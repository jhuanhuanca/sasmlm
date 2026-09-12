<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import SoftField from '@/components/ui/SoftField.vue'
import ShopPaymentPanel from '@/components/shop/ShopPaymentPanel.vue'
import { fetchShippingQuote, placePublicOrder } from '@/api/store'
import { useShop } from '@/composables/useShop'
import { useShopCartStore } from '@/stores/shopCart'
import { useToast } from '@/composables/useToast'
import { SHIPPING_COUNTRIES, departmentsOf, hydrateDropshipping, type ShippingQuote } from '@/data/shipping'
import {
  availablePaymentMethods,
  hydrateShopPayments,
  type ShopPaymentMethod,
} from '@/data/shopPayments'
import { money } from '@/utils/format'
import { errorMessage } from '@/utils/http'
import { fieldControlClass } from '@/utils/ui'

const { slug, store, partnerRef } = useShop()
const cart = useShopCartStore()
const toast = useToast()
const placed = ref(false)
const message = ref('')
const loading = ref(false)
const quoting = ref(false)
const quote = ref<ShippingQuote | null>(null)
const paymentMethod = ref<ShopPaymentMethod | ''>('')
const voucher = ref<File | null>(null)
const voucherPreview = ref('')
const form = reactive({
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  shipping_country: '',
  shipping_department: '',
  shipping_area: '',
  shipping_address: '',
})

const shipping = computed(() => hydrateDropshipping(store.value?.dropshipping ?? store.value?.settings?.dropshipping))
const payments = computed(() => hydrateShopPayments(store.value?.payments ?? store.value?.settings?.payments))
const methods = computed(() => availablePaymentMethods(payments.value))
const shippingOn = computed(() => shipping.value.enabled)
const departments = computed(() => departmentsOf(form.shipping_country))
const realLines = () => cart.lines.filter((line) => !line.product.demo)
const shippingFee = computed(() => (quote.value?.applies ? quote.value.fee : 0))
const grandTotal = computed(() => cart.subtotal + shippingFee.value)
const whatsapp = computed(() => String(store.value?.whatsapp || store.value?.settings?.whatsapp || '').trim())
const whatsappHref = computed(() => {
  const digits = whatsapp.value.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : ''
})
const canSubmit = computed(() => {
  if (!cart.lines.length || loading.value) {
    return false
  }
  if (methods.value.length && !paymentMethod.value) {
    return false
  }
  if (methods.value.length && realLines().length && !voucher.value) {
    return false
  }
  return true
})

function onVoucher(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  voucher.value = file
  if (voucherPreview.value) {
    URL.revokeObjectURL(voucherPreview.value)
  }
  voucherPreview.value = file ? URL.createObjectURL(file) : ''
}

watch(
  methods,
  (list) => {
    if (list.length && !list.includes(paymentMethod.value as ShopPaymentMethod)) {
      paymentMethod.value = list[0]
    }
  },
  { immediate: true },
)

async function refreshQuote(): Promise<void> {
  if (!shippingOn.value || !form.shipping_country || !store.value) {
    quote.value = null
    return
  }

  quoting.value = true
  try {
    quote.value = await fetchShippingQuote(slug.value, {
      country: form.shipping_country,
      department: form.shipping_department,
      area: form.shipping_area,
      subtotal: cart.subtotal,
    })
  } catch {
    quote.value = null
  } finally {
    quoting.value = false
  }
}

watch(
  () => shipping.value.origin_country,
  (code) => {
    if (shippingOn.value && !form.shipping_country && code) {
      form.shipping_country = code
    }
  },
  { immediate: true },
)

watch(
  () => [form.shipping_country, form.shipping_department, form.shipping_area, cart.subtotal, shippingOn.value],
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

async function submit(): Promise<void> {
  if (!cart.lines.length) {
    return
  }

  if (methods.value.length && !paymentMethod.value) {
    message.value = 'Elige un medio de pago.'
    return
  }

  if (methods.value.length && realLines().length && !voucher.value) {
    message.value = 'Sube la foto del comprobante de pago.'
    return
  }

  const sellable = realLines()
  loading.value = true
  message.value = ''

  try {
    if (sellable.length && store.value) {
      await placePublicOrder(slug.value, {
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone || undefined,
        items: sellable.map((line) => ({
          product_id: line.product.id,
          quantity: line.quantity,
        })),
        ...(partnerRef.value ? { partner_user_id: partnerRef.value } : {}),
        ...(paymentMethod.value ? { payment_method: paymentMethod.value } : {}),
        ...(shippingOn.value
          ? {
              shipping_country: form.shipping_country,
              shipping_department: form.shipping_department,
              shipping_area: form.shipping_area,
              shipping_address: form.shipping_address,
            }
          : {}),
      }, voucher.value)
    }

    placed.value = true
    cart.clear()
    toast.success('El líder verá el comprobante en la orden y la marcará pagada cuando confirme el dinero.', 'Pedido registrado')
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo crear la orden')
    toast.fromError(error, 'No se pudo crear la orden')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="shop-wrap max-w-xl py-12">
    <h1 class="font-display text-4xl font-bold">Finalizar compra</h1>
    <p class="mt-2 text-sm text-[var(--shop-muted)]">
      El pedido queda pendiente hasta que el líder confirme el pago.
      <template v-if="partnerRef"> Esta compra queda asociada al socio que compartió la tienda.</template>
    </p>

    <div v-if="placed" class="mt-6 space-y-4">
      <p class="bg-[var(--shop-panel)] px-4 py-3 text-sm">
        Pedido registrado. Si ya subiste el comprobante, el líder lo tiene en la orden.
      </p>
      <img
        v-if="voucherPreview"
        :src="voucherPreview"
        alt="Comprobante enviado"
        class="max-h-48 w-auto rounded-lg bg-white p-2"
      />
      <ShopPaymentPanel
        v-if="paymentMethod"
        :payments="payments"
        :model-value="paymentMethod"
        :whatsapp="whatsapp"
      />
      <a
        v-if="whatsappHref"
        :href="whatsappHref"
        class="inline-flex bg-charcoal px-5 py-3 text-xs tracking-[0.16em] text-white uppercase"
        target="_blank"
        rel="noreferrer"
      >
        Enviar comprobante por WhatsApp
      </a>
    </div>

    <form v-else class="mt-8 space-y-4" @submit.prevent="submit">
      <p v-if="message" class="text-sm text-red-600">{{ message }}</p>
      <ul class="space-y-2 text-sm">
        <li v-for="line in cart.lines" :key="line.product.id" class="flex justify-between">
          <span>{{ line.product.name }} × {{ line.quantity }}</span>
          <span>{{ money(line.product.price * line.quantity, line.product.currency) }}</span>
        </li>
      </ul>
      <p class="flex justify-between text-sm">
        <span>Productos</span>
        <span>{{ money(cart.subtotal, cart.currency) }}</span>
      </p>
      <p v-if="shippingOn" class="flex justify-between text-sm">
        <span>{{ quote?.free ? 'Envío (gratis)' : quote?.zone ? `Envío · ${quote.zone}` : 'Envío' }}</span>
        <span>{{ quoting ? '…' : money(shippingFee, quote?.currency || cart.currency) }}</span>
      </p>
      <p v-if="quote?.eta_days != null" class="text-xs text-[var(--shop-muted)]">
        Entrega estimada: {{ quote.eta_days }} día{{ quote.eta_days === 1 ? '' : 's' }}.
      </p>
      <p class="text-lg font-semibold">{{ money(grandTotal, quote?.currency || cart.currency) }}</p>

      <SoftField label="Nombre">
        <input v-model="form.customer_name" :class="fieldControlClass" required />
      </SoftField>
      <SoftField label="Correo">
        <input v-model="form.customer_email" :class="fieldControlClass" type="email" required />
      </SoftField>
      <SoftField label="WhatsApp / teléfono">
        <input v-model="form.customer_phone" :class="fieldControlClass" inputmode="tel" />
      </SoftField>

      <template v-if="shippingOn">
        <p class="pt-2 text-sm font-medium">Entrega</p>
        <SoftField label="País">
          <select v-model="form.shipping_country" :class="fieldControlClass" required>
            <option value="">Elige país</option>
            <option v-for="country in SHIPPING_COUNTRIES" :key="country.code" :value="country.code">
              {{ country.name }}
            </option>
          </select>
        </SoftField>
        <SoftField label="Departamento">
          <select v-if="departments.length" v-model="form.shipping_department" :class="fieldControlClass">
            <option value="">—</option>
            <option v-for="item in departments" :key="item" :value="item">{{ item }}</option>
          </select>
          <input v-else v-model="form.shipping_department" :class="fieldControlClass" placeholder="Departamento o estado" />
        </SoftField>
        <SoftField label="Área local / ciudad">
          <input v-model="form.shipping_area" :class="fieldControlClass" placeholder="Ciudad, zona o barrio" />
        </SoftField>
        <SoftField label="Dirección">
          <input v-model="form.shipping_address" :class="fieldControlClass" />
        </SoftField>
        <p v-if="shipping.notes" class="text-xs text-[var(--shop-muted)]">{{ shipping.notes }}</p>
      </template>

      <ShopPaymentPanel
        v-if="methods.length"
        :payments="payments"
        :model-value="paymentMethod"
        :whatsapp="whatsapp"
        @update:model-value="paymentMethod = $event"
      />
      <SoftField v-if="methods.length" label="Foto del comprobante" hint="Captura o foto nítida del QR pagado o de la transferencia.">
        <input
          class="text-sm"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          @change="onVoucher"
        />
      </SoftField>
      <img
        v-if="voucherPreview && !placed"
        :src="voucherPreview"
        alt="Vista previa del comprobante"
        class="max-h-40 w-auto rounded-lg bg-white p-2"
      />
      <p v-else class="text-sm text-[var(--shop-muted)]">
        El líder aún no publicó un QR ni una cuenta. Confirma el pedido y coordina el cobro por WhatsApp.
      </p>

      <button
        type="submit"
        class="w-full bg-charcoal py-3 text-xs tracking-[0.16em] text-white uppercase disabled:opacity-50"
        :disabled="!canSubmit"
      >
        Confirmar pedido
      </button>
      <p v-if="cart.lines.some((line) => line.product.demo)" class="text-xs text-[var(--shop-muted)]">
        Los productos de muestra no se envían al servidor; sirven para ver el diseño.
      </p>
    </form>

    <RouterLink :to="{ name: 'public-store', params: { slug } }" class="mt-8 inline-block text-sm underline">
      Volver a la tienda
    </RouterLink>
  </div>
</template>
