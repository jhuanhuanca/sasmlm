<script setup lang="ts">
import { computed, reactive } from 'vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftField from '@/components/ui/SoftField.vue'
import SettingsBlock from '@/components/store/SettingsBlock.vue'
import { fieldControlClass } from '@/utils/ui'
import { money } from '@/utils/format'
import { STORE_CURRENCIES } from '@/data/currencies'
import type { Product } from '@/types/store'

const props = defineProps<{
  products: Product[]
  companyName: string
  savingId?: number | null
}>()

const emit = defineEmits<{
  publish: [product: Product, published: boolean]
  patch: [product: Product, patch: { stock?: number; fulfillment?: 'stock' | 'dropship'; expires_at?: string | null; price?: number; currency?: string }]
  sell: [product: Product]
}>()

const publishedCount = computed(() => props.products.filter((item) => item.is_published).length)
const expiryDraft = reactive<Record<number, string>>({})

function dateInputValue(value?: string | null): string {
  const match = String(value ?? '').match(/^(\d{4}-\d{2}-\d{2})/)
  return match && isCompleteExpiry(match[1]) ? match[1] : ''
}

function isCompleteExpiry(value: string): boolean {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return false
  }
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 2000 || year > 2099 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false
  }
  const parsed = new Date(`${value}T00:00:00`)
  return !Number.isNaN(parsed.getTime()) && parsed.getFullYear() === year
}

function expiryValue(product: Product): string {
  return expiryDraft[product.id] ?? dateInputValue(product.expires_at)
}

function onStock(product: Product, event: Event): void {
  const target = event.target as HTMLInputElement
  const stock = Number(target.value || 0)
  emit('patch', product, {
    stock,
    fulfillment: stock > 0 ? 'stock' : product.fulfillment === 'dropship' ? 'dropship' : 'stock',
  })
}

function onExpiryInput(product: Product, event: Event): void {
  const target = event.target as HTMLInputElement
  expiryDraft[product.id] = target.value
}

function commitExpiry(product: Product): void {
  const raw = expiryDraft[product.id]
  const next = raw === undefined ? dateInputValue(product.expires_at) : raw.trim()
  const saved = dateInputValue(product.expires_at)

  if (next === '') {
    delete expiryDraft[product.id]
    if (saved !== '') {
      emit('patch', product, { expires_at: null })
    }
    return
  }

  if (!isCompleteExpiry(next)) {
    expiryDraft[product.id] = saved
    return
  }

  delete expiryDraft[product.id]
  if (next !== saved) {
    emit('patch', product, { expires_at: next })
  }
}

function onPrice(product: Product, event: Event): void {
  const target = event.target as HTMLInputElement
  emit('patch', product, { price: Number(target.value || 0) })
}

function onCurrency(product: Product, event: Event): void {
  const target = event.target as HTMLSelectElement
  emit('patch', product, { currency: target.value })
}

function onFulfillment(product: Product, event: Event): void {
  const target = event.target as HTMLSelectElement
  emit('patch', product, {
    stock: product.stock,
    fulfillment: target.value === 'dropship' ? 'dropship' : 'stock',
  })
}
</script>

<template>
  <SettingsBlock
    tone="emerald"
    icon="star"
    :title="`Catálogo de ${companyName || 'empresa'}`"
    :body="`Eliges cuáles publicar. Puedes poner precio y moneda locales para tu tienda; la ficha de empresa no cambia. ${publishedCount} publicados de ${products.length}.`"
    flush
  >
    <p v-if="!companyName" class="px-5 py-8 text-sm text-muted">
      Esta cuenta no tiene empresa afiliada. El catálogo de empresa aparece cuando te registras con una marca.
    </p>
    <p v-else-if="!products.length" class="px-5 py-8 text-sm text-muted">
      Aún no hay productos en el catálogo de {{ companyName }}. Administración los carga en el servicio de catálogo.
    </p>
    <ul v-else class="divide-y divide-line">
      <li v-for="product in products" :key="product.id" class="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <img
            v-if="product.image"
            :src="product.image"
            alt=""
            class="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
          <div class="min-w-0">
            <p class="font-medium">{{ product.name }}</p>
            <p class="text-sm text-muted">
              {{ money(product.price, product.currency) }}
              <span v-if="product.technical_sheet"> · ficha técnica</span>
              <span v-if="product.is_low_stock" class="text-ink"> · stock bajo ({{ product.stock }})</span>
              <span v-else-if="product.is_expired"> · vencido</span>
              <span v-else-if="product.is_expiring_soon"> · vence en {{ product.days_until_expiry }} día(s)</span>
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-end gap-2">
          <SoftField label="Precio">
            <input
              :value="product.price"
              :class="fieldControlClass"
              class="w-28"
              type="number"
              min="0"
              step="0.01"
              :disabled="savingId === product.id"
              @change="onPrice(product, $event)"
            />
          </SoftField>
          <SoftField label="Moneda">
            <select
              :value="product.currency"
              :class="fieldControlClass"
              class="w-28"
              :disabled="savingId === product.id"
              @change="onCurrency(product, $event)"
            >
              <option v-for="item in STORE_CURRENCIES" :key="item.code" :value="item.code">{{ item.code }}</option>
            </select>
          </SoftField>
          <SoftField label="Stock">
            <input
              :value="product.stock"
              :class="fieldControlClass"
              class="w-24"
              type="number"
              min="0"
              :disabled="savingId === product.id"
              @change="onStock(product, $event)"
            />
          </SoftField>
          <SoftField label="Entrega">
            <select
              :value="product.fulfillment ?? 'dropship'"
              :class="fieldControlClass"
              class="w-36"
              :disabled="savingId === product.id"
              @change="onFulfillment(product, $event)"
            >
              <option value="dropship">Dropshipping</option>
              <option value="stock">Mi stock</option>
            </select>
          </SoftField>
          <SoftField label="Vence">
            <input
              :value="expiryValue(product)"
              :class="fieldControlClass"
              class="w-36"
              type="date"
              min="2000-01-01"
              max="2099-12-31"
              :disabled="savingId === product.id"
              @input="onExpiryInput(product, $event)"
              @blur="commitExpiry(product)"
            />
          </SoftField>
          <SoftButton
            v-if="product.is_active && !product.is_expired && (product.fulfillment === 'dropship' || product.stock > 0)"
            variant="outline"
            :disabled="savingId === product.id"
            @click="emit('sell', product)"
          >
            Vender
          </SoftButton>
          <SoftButton
            :variant="product.is_published ? 'yellow' : 'outline'"
            :disabled="savingId === product.id"
            @click="emit('publish', product, !product.is_published)"
          >
            {{ product.is_published ? 'Publicado' : 'Publicar' }}
          </SoftButton>
        </div>
      </li>
    </ul>
  </SettingsBlock>
</template>
