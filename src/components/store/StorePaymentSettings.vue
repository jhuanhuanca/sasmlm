<script setup lang="ts">
import { ref } from 'vue'
import SoftField from '@/components/ui/SoftField.vue'
import SettingsBlock from '@/components/store/SettingsBlock.vue'
import { uploadStorePaymentAsset } from '@/api/store'
import { PAYMENT_METHODS, hydrateShopPayments, type ShopPayments } from '@/data/shopPayments'
import { useToast } from '@/composables/useToast'
import { fieldControlClass } from '@/utils/ui'
import type { Store } from '@/types/store'

defineProps<{
  modelValue: ShopPayments
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ShopPayments]
  uploaded: [store: Store]
}>()

const toast = useToast()
const uploading = ref<'qr' | 'binance_qr' | null>(null)

function patch(partial: Partial<ShopPayments>, current: ShopPayments): void {
  emit('update:modelValue', { ...current, ...partial })
}

async function onFile(kind: 'qr' | 'binance_qr', event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }

  uploading.value = kind
  try {
    const store = await uploadStorePaymentAsset(kind, file)
    emit('uploaded', store)
    emit('update:modelValue', hydrateShopPayments(store.payments ?? store.settings?.payments))
    toast.success('La imagen ya está lista para el checkout.', 'QR guardado')
  } catch (error) {
    toast.fromError(error, 'No se pudo subir el QR')
  } finally {
    uploading.value = null
  }
}
</script>

<template>
  <SettingsBlock
    tone="emerald"
    icon="wallet"
    title="Cobro de la tienda"
    body="Sube tus QR y completa la cuenta bancaria. El cliente elige el medio, paga y carga el comprobante en el checkout."
  >
    <div class="space-y-4">
      <label class="flex items-center gap-2 text-sm">
        <input
          :checked="modelValue.qr_enabled"
          type="checkbox"
          @change="patch({ qr_enabled: ($event.target as HTMLInputElement).checked }, modelValue)"
        />
        Activar QR bancario / billetera
      </label>
      <div v-if="modelValue.qr_enabled" class="grid gap-3 md:grid-cols-2">
        <SoftField label="Imagen del QR" hint="JPG, PNG o WebP. Se guarda al subirla.">
          <input
            class="text-sm"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            :disabled="uploading === 'qr'"
            @change="onFile('qr', $event)"
          />
        </SoftField>
        <SoftField label="Indicaciones">
          <input
            :value="modelValue.qr_notes"
            :class="fieldControlClass"
            placeholder="Banco, monto exacto, referencia…"
            @input="patch({ qr_notes: ($event.target as HTMLInputElement).value }, modelValue)"
          />
        </SoftField>
        <img
          v-if="modelValue.qr_image"
          :src="modelValue.qr_image"
          alt="QR de cobro"
          class="max-h-40 w-auto rounded-lg border border-line bg-white p-2 md:col-span-2"
        />
      </div>

      <label class="flex items-center gap-2 text-sm">
        <input
          :checked="modelValue.binance_enabled"
          type="checkbox"
          @change="patch({ binance_enabled: ($event.target as HTMLInputElement).checked }, modelValue)"
        />
        Activar QR Binance
      </label>
      <div v-if="modelValue.binance_enabled" class="grid gap-3 md:grid-cols-2">
        <SoftField label="Imagen del QR Binance">
          <input
            class="text-sm"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            :disabled="uploading === 'binance_qr'"
            @change="onFile('binance_qr', $event)"
          />
        </SoftField>
        <SoftField label="Pay ID / ID Binance">
          <input
            :value="modelValue.binance_pay_id"
            :class="fieldControlClass"
            @input="patch({ binance_pay_id: ($event.target as HTMLInputElement).value }, modelValue)"
          />
        </SoftField>
        <SoftField label="Indicaciones" class="md:col-span-2">
          <input
            :value="modelValue.binance_notes"
            :class="fieldControlClass"
            placeholder="Red, moneda, que pague el monto exacto…"
            @input="patch({ binance_notes: ($event.target as HTMLInputElement).value }, modelValue)"
          />
        </SoftField>
        <img
          v-if="modelValue.binance_image"
          :src="modelValue.binance_image"
          alt="QR Binance"
          class="max-h-40 w-auto rounded-lg border border-line bg-white p-2 md:col-span-2"
        />
      </div>

      <label class="flex items-center gap-2 text-sm">
        <input
          :checked="modelValue.deposit_enabled"
          type="checkbox"
          @change="patch({ deposit_enabled: ($event.target as HTMLInputElement).checked }, modelValue)"
        />
        Activar depósito bancario
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input
          :checked="modelValue.transfer_enabled"
          type="checkbox"
          @change="patch({ transfer_enabled: ($event.target as HTMLInputElement).checked }, modelValue)"
        />
        Activar transferencia bancaria
      </label>

      <div v-if="modelValue.deposit_enabled || modelValue.transfer_enabled" class="grid gap-3 md:grid-cols-2">
        <SoftField label="Banco">
          <input
            :value="modelValue.bank_name"
            :class="fieldControlClass"
            @input="patch({ bank_name: ($event.target as HTMLInputElement).value }, modelValue)"
          />
        </SoftField>
        <SoftField label="Titular">
          <input
            :value="modelValue.bank_account_holder"
            :class="fieldControlClass"
            @input="patch({ bank_account_holder: ($event.target as HTMLInputElement).value }, modelValue)"
          />
        </SoftField>
        <SoftField label="Número de cuenta">
          <input
            :value="modelValue.bank_account_number"
            :class="fieldControlClass"
            @input="patch({ bank_account_number: ($event.target as HTMLInputElement).value }, modelValue)"
          />
        </SoftField>
        <SoftField label="Tipo de cuenta">
          <select
            :value="modelValue.bank_account_type"
            :class="fieldControlClass"
            @change="patch({ bank_account_type: ($event.target as HTMLSelectElement).value }, modelValue)"
          >
            <option value="ahorros">Ahorros</option>
            <option value="corriente">Corriente</option>
          </select>
        </SoftField>
        <SoftField label="CI / NIT / documento">
          <input
            :value="modelValue.bank_document"
            :class="fieldControlClass"
            @input="patch({ bank_document: ($event.target as HTMLInputElement).value }, modelValue)"
          />
        </SoftField>
        <SoftField v-if="modelValue.deposit_enabled" label="Notas de depósito">
          <input
            :value="modelValue.deposit_notes"
            :class="fieldControlClass"
            @input="patch({ deposit_notes: ($event.target as HTMLInputElement).value }, modelValue)"
          />
        </SoftField>
        <SoftField v-if="modelValue.transfer_enabled" label="Notas de transferencia" class="md:col-span-2">
          <input
            :value="modelValue.transfer_notes"
            :class="fieldControlClass"
            @input="patch({ transfer_notes: ($event.target as HTMLInputElement).value }, modelValue)"
          />
        </SoftField>
      </div>
      <p class="text-xs text-muted">
        Métodos listos:
        {{
          PAYMENT_METHODS.filter((item) =>
            item.id === 'qr'
              ? modelValue.qr_enabled
              : item.id === 'qr_binance'
                ? modelValue.binance_enabled
                : item.id === 'deposit'
                  ? modelValue.deposit_enabled
                  : modelValue.transfer_enabled,
          )
            .map((item) => item.label)
            .join(' · ') || 'ninguno todavía'
        }}.
      </p>
    </div>
  </SettingsBlock>
</template>
