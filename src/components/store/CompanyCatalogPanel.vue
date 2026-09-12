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
      <li v-for="product in products" :key="product.id" class="flex flex-col gap-3 px-4 py-4 sm:px-5">
        <div class="flex min-w-0 items-center gap-3">
          <img
            v-if="product.image"
            :src="product.image"
            alt=""
            class="h-14 w-14 shrink-0 rounded-xl object-cover"
          />
          <div class="min-w-0">
            <p class="font-medium leading-tight text-ink">{{ product.name }}</p>
            <p class="mt-0.5 text-sm text-muted">
              {{ money(product.price, product.currency) }}
              <span v-if="product.technical_sheet"> · ficha técnica</span>
            </p>
            <p v-if="product.is_low_stock" class="mt-1 text-xs font-medium text-ink">
              Stock bajo ({{ product.stock }})
            </p>
            <p v-else-if="product.is_expired" class="mt-1 text-xs text-muted">Vencido</p>
            <p v-else-if="product.is_expiring_soon" class="mt-1 text-xs text-muted">
              Vence en {{ product.days_until_expiry }} día(s)
            </p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <SoftField label="Precio" class="min-w-0">
            <input
              :value="product.price"
              :class="fieldControlClass"
              type="number"
              min="0"
              step="0.01"
              :disabled="savingId === product.id"
              @change="onPrice(product, $event)"
            />
          </SoftField>
          <SoftField label="Moneda" class="min-w-0">
            <select
              :value="product.currency"
              :class="fieldControlClass"
              :disabled="savingId === product.id"
              @change="onCurrency(product, $event)"
            >
              <option v-for="item in STORE_CURRENCIES" :key="item.code" :value="item.code">{{ item.code }}</option>
            </select>
          </SoftField>
          <SoftField label="Stock" class="min-w-0">
            <input
              :value="product.stock"
              :class="fieldControlClass"
              type="number"
              min="0"
              :disabled="savingId === product.id"
              @change="onStock(product, $event)"
            />
          </SoftField>
          <SoftField label="Entrega" class="min-w-0">
            <select
              :value="product.fulfillment ?? 'dropship'"
              :class="fieldControlClass"
              :disabled="savingId === product.id"
              @change="onFulfillment(product, $event)"
            >
              <option value="dropship">Dropshipping</option>
              <option value="stock">Mi stock</option>
            </select>
          </SoftField>
          <SoftField label="Vence" class="col-span-2 min-w-0 sm:col-span-1">
            <input
              :value="expiryValue(product)"
              :class="fieldControlClass"
              type="date"
              min="2000-01-01"
              max="2099-12-31"
              :disabled="savingId === product.id"
              @input="onExpiryInput(product, $event)"
              @blur="commitExpiry(product)"
            />
          </SoftField>
        </div>
        <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <SoftButton
            v-if="product.is_active && !product.is_expired && (product.fulfillment === 'dropship' || product.stock > 0)"
            variant="outline"
            class="!px-3 !py-2"
            :disabled="savingId === product.id"
            @click="emit('sell', product)"
          >
            Vender
          </SoftButton>
          <SoftButton
            :variant="product.is_published ? 'yellow' : 'outline'"
            class="!px-3 !py-2"
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
