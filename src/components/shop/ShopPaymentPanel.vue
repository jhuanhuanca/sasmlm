<script setup lang="ts">
import { computed } from 'vue'
import {
  PAYMENT_METHODS,
  availablePaymentMethods,
  paymentMethodAvailable,
  type ShopPaymentMethod,
  type ShopPayments,
} from '@/data/shopPayments'

const props = defineProps<{
  payments: ShopPayments
  modelValue: ShopPaymentMethod | ''
  whatsapp?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ShopPaymentMethod]
}>()

const methods = computed(() =>
  PAYMENT_METHODS.filter((item) => availablePaymentMethods(props.payments).includes(item.id)),
)
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm font-medium">Cómo vas a pagar</p>
    <p class="text-xs text-[var(--shop-muted)]">
      Elige un medio. El pedido queda pendiente hasta que el líder confirme el dinero.
    </p>
    <div class="grid gap-2">
      <label
        v-for="method in methods"
        :key="method.id"
        class="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--shop-line)] p-3"
        :class="modelValue === method.id ? 'bg-[var(--shop-panel)]' : ''"
      >
        <input
          type="radio"
          class="mt-1"
          :value="method.id"
          :checked="modelValue === method.id"
          @change="emit('update:modelValue', method.id)"
        />
        <span>
          <span class="block text-sm font-medium">{{ method.label }}</span>
          <span class="block text-xs text-[var(--shop-muted)]">{{ method.hint }}</span>
        </span>
      </label>
    </div>

    <div v-if="modelValue === 'qr' && paymentMethodAvailable(payments, 'qr')" class="space-y-2 rounded-lg bg-[var(--shop-panel)] p-4">
      <img :src="payments.qr_image" alt="QR de pago" class="mx-auto max-h-56 w-auto rounded-md bg-white p-2" />
      <p v-if="payments.qr_notes" class="text-sm">{{ payments.qr_notes }}</p>
    </div>

    <div v-if="modelValue === 'qr_binance' && paymentMethodAvailable(payments, 'qr_binance')" class="space-y-2 rounded-lg bg-[var(--shop-panel)] p-4">
      <img
        v-if="payments.binance_image"
        :src="payments.binance_image"
        alt="QR Binance"
        class="mx-auto max-h-56 w-auto rounded-md bg-white p-2"
      />
      <p v-if="payments.binance_pay_id" class="text-sm">Pay ID: <strong>{{ payments.binance_pay_id }}</strong></p>
      <p v-if="payments.binance_notes" class="text-sm">{{ payments.binance_notes }}</p>
    </div>

    <div
      v-if="(modelValue === 'deposit' || modelValue === 'transfer') && paymentMethodAvailable(payments, modelValue)"
      class="space-y-1 rounded-lg bg-[var(--shop-panel)] p-4 text-sm"
    >
      <p v-if="payments.bank_name"><span class="text-[var(--shop-muted)]">Banco:</span> {{ payments.bank_name }}</p>
      <p v-if="payments.bank_account_holder"><span class="text-[var(--shop-muted)]">Titular:</span> {{ payments.bank_account_holder }}</p>
      <p v-if="payments.bank_account_number"><span class="text-[var(--shop-muted)]">Cuenta:</span> {{ payments.bank_account_number }}</p>
      <p v-if="payments.bank_account_type">
        <span class="text-[var(--shop-muted)]">Tipo:</span>
        {{ payments.bank_account_type === 'corriente' ? 'Corriente' : 'Ahorros' }}
      </p>
      <p v-if="payments.bank_document"><span class="text-[var(--shop-muted)]">Documento:</span> {{ payments.bank_document }}</p>
      <p v-if="modelValue === 'deposit' && payments.deposit_notes">{{ payments.deposit_notes }}</p>
      <p v-if="modelValue === 'transfer' && payments.transfer_notes">{{ payments.transfer_notes }}</p>
    </div>
    <p v-if="whatsapp" class="text-xs text-[var(--shop-muted)]">
      Si quieres, avisa por WhatsApp al {{ whatsapp }} cuando ya hayas subido el comprobante aquí.
    </p>
  </div>
</template>
