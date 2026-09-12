<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftField from '@/components/ui/SoftField.vue'
import SettingsBlock from '@/components/store/SettingsBlock.vue'
import { fieldControlClass } from '@/utils/ui'
import { money, signedPercent } from '@/utils/format'
import { STORE_CURRENCIES, normalizeCurrency } from '@/data/currencies'
import type { Product, ProductPayload, StoreCategory } from '@/types/store'

const props = defineProps<{
  products: Product[]
  categories: StoreCategory[]
  incentives?: Product[]
  errors: Record<string, string[]>
  saving?: boolean
  kind?: 'personal' | 'incentive'
  targetMargin?: number | null
  defaultCurrency?: string
}>()

const emit = defineEmits<{
  create: [payload: ProductPayload]
  update: [id: number, payload: ProductPayload]
  remove: [id: number]
  import: [file: File]
  assign: [product: Product]
  sell: [product: Product]
  createCategory: [name: string]
  updateCategory: [id: number, name: string]
  removeCategory: [id: number]
}>()

const isIncentive = computed(() => props.kind === 'incentive')

const csvInput = ref<HTMLInputElement | null>(null)
const editingId = ref<number | null>(null)
const newCategoryName = ref('')
const categoryFilter = ref<'all' | 'none' | number>('all')
const renamingId = ref<number | null>(null)
const renameValue = ref('')

let syncingPrice = false

const form = reactive({
  name: '',
  description: '',
  technical_sheet: '',
  price: 0,
  purchase_cost: 0,
  margin: null as number | null,
  incentive_product_id: '' as number | '',
  incentive_qty: 1,
  stock: 1,
  image: '',
  is_active: true,
  is_published: true,
  fulfillment: 'stock' as 'stock' | 'dropship',
  expires_at: '',
  dropship_url: '',
  dropship_sku: '',
  store_category_id: '' as number | '',
  currency: 'USD',
})

const selectedIncentive = computed(() =>
  props.incentives?.find((item) => item.id === Number(form.incentive_product_id)) ?? null,
)

const previewCost = computed(() => {
  const buy = Number(form.purchase_cost || 0)
  const gift = selectedIncentive.value ? Number(selectedIncentive.value.purchase_cost || 0) * Number(form.incentive_qty || 1) : 0
  return buy + gift
})

const previewProfit = computed(() => Number(form.price || 0) - previewCost.value)

const previewMargin = computed(() => {
  const price = Number(form.price || 0)
  if (price <= 0) {
    return null
  }
  return (previewProfit.value / price) * 100
})

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function applyPriceFromMargin(): void {
  if (syncingPrice || isIncentive.value) {
    return
  }
  const margin = Number(form.margin)
  const cost = previewCost.value
  if (!Number.isFinite(margin) || margin <= 0 || margin >= 100 || cost <= 0) {
    return
  }
  syncingPrice = true
  form.price = roundMoney(cost / (1 - margin / 100))
  syncingPrice = false
}

function applyMarginFromPrice(): void {
  if (syncingPrice || isIncentive.value) {
    return
  }
  const price = Number(form.price || 0)
  if (price <= 0) {
    return
  }
  syncingPrice = true
  form.margin = Math.round((previewProfit.value / price) * 1000) / 10
  syncingPrice = false
}

watch(() => [form.purchase_cost, form.incentive_product_id, form.incentive_qty], () => {
  applyPriceFromMargin()
})
watch(() => form.margin, () => {
  applyPriceFromMargin()
})
watch(() => form.price, () => {
  applyMarginFromPrice()
})
watch(
  () => props.defaultCurrency,
  (code) => {
    if (editingId.value) {
      return
    }
    form.currency = code || 'USD'
  },
  { immediate: true },
)
watch(
  () => props.targetMargin,
  (margin) => {
    if (editingId.value || isIncentive.value) {
      return
    }
    form.margin = margin ?? null
    applyPriceFromMargin()
  },
  { immediate: true },
)

const totals = computed(() => {
  const byCurrency: Record<string, { stock: number; cost: number; profit: number }> = {}
  for (const item of props.products) {
    const code = normalizeCurrency(item.currency, props.defaultCurrency)
    if (!byCurrency[code]) {
      byCurrency[code] = { stock: 0, cost: 0, profit: 0 }
    }
    const stock = Number(item.stock || 0)
    const cost = Number(item.unit_cost ?? item.purchase_cost ?? 0)
    const profit = Number(item.unit_profit ?? 0)
    byCurrency[code].stock += stock
    byCurrency[code].cost += cost * stock
    byCurrency[code].profit += profit * stock
  }
  return Object.entries(byCurrency).map(([currency, values]) => ({ currency, ...values }))
})

const visibleProducts = computed(() => {
  if (categoryFilter.value === 'all') {
    return props.products
  }
  if (categoryFilter.value === 'none') {
    return props.products.filter((item) => !item.store_category_id)
  }
  return props.products.filter((item) => item.store_category_id === categoryFilter.value)
})

function payload(): ProductPayload {
  return {
    name: form.name,
    description: form.description || null,
    technical_sheet: form.technical_sheet || null,
    price: Number(form.price),
    purchase_cost: Number(form.purchase_cost || 0),
    source: isIncentive.value ? 'incentive' : 'personal',
    incentive_product_id: isIncentive.value || form.incentive_product_id === '' ? null : Number(form.incentive_product_id),
    incentive_qty: Number(form.incentive_qty || 1),
    stock: Number(form.stock),
    image: form.image || null,
    is_active: form.is_active,
    is_published: form.is_published,
    fulfillment: form.fulfillment,
    expires_at: form.expires_at || null,
    dropship_url: form.dropship_url || null,
    dropship_sku: form.dropship_sku || null,
    store_category_id: form.store_category_id === '' ? null : Number(form.store_category_id),
    currency: form.currency,
  }
}

function resetForm(): void {
  editingId.value = null
  form.name = ''
  form.description = ''
  form.technical_sheet = ''
  form.price = 0
  form.purchase_cost = 0
  form.margin = props.targetMargin ?? null
  form.incentive_product_id = ''
  form.incentive_qty = 1
  form.stock = 1
  form.image = ''
  form.is_active = true
  form.is_published = true
  form.fulfillment = 'stock'
  form.expires_at = ''
  form.dropship_url = ''
  form.dropship_sku = ''
  form.store_category_id = ''
  form.currency = props.defaultCurrency || 'USD'
  applyPriceFromMargin()
}

async function edit(product: Product): Promise<void> {
  editingId.value = product.id
  syncingPrice = true
  form.name = product.name
  form.description = product.description ?? ''
  form.technical_sheet = product.technical_sheet ?? ''
  form.price = Number(product.price)
  form.purchase_cost = Number(product.purchase_cost || 0)
  form.margin =
    product.margin_percent == null ? null : Math.round(Number(product.margin_percent) * 10) / 10
  form.incentive_product_id = product.incentive_product_id ?? ''
  form.incentive_qty = product.incentive_qty || 1
  form.stock = product.stock
  form.image = product.image ?? ''
  form.is_active = product.is_active
  form.is_published = product.is_published !== false
  form.fulfillment = product.fulfillment === 'dropship' ? 'dropship' : 'stock'
  form.expires_at = product.expires_at ?? ''
  form.dropship_url = product.dropship_url ?? ''
  form.dropship_sku = product.dropship_sku ?? ''
  form.store_category_id = product.store_category_id ?? ''
  form.currency = product.currency || props.defaultCurrency || 'USD'
  await nextTick()
  syncingPrice = false
}

function submit(): void {
  if (editingId.value) {
    emit('update', editingId.value, payload())
    return
  }
  emit('create', payload())
}

function addCategory(): void {
  const name = newCategoryName.value.trim()
  if (!name) {
    return
  }
  emit('createCategory', name)
  newCategoryName.value = ''
}

function startRename(category: StoreCategory): void {
  renamingId.value = category.id
  renameValue.value = category.name
}

function saveRename(): void {
  const name = renameValue.value.trim()
  if (renamingId.value && name) {
    emit('updateCategory', renamingId.value, name)
  }
  renamingId.value = null
}

function onCsv(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('import', file)
  }
  input.value = ''
}

function csvCell(value: string): string {
  if (/[;"\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function downloadTemplate(): void {
  const headers = [
    'nombre',
    'precio',
    'costo_compra',
    'stock',
    'moneda',
    'categoria',
    'descripcion',
    'imagen',
    'ficha_tecnica',
    'vencimiento',
    'activo',
    'fulfillment',
    'dropship_url',
    'dropship_sku',
  ]
  const rows = [
    [
      'Té verde',
      '55',
      '32',
      '100',
      props.defaultCurrency || 'USD',
      'Infusiones',
      'Infusión diaria',
      'https://ejemplo.com/te.jpg',
      '1 taza al día',
      '2027-12-31',
      '1',
      'stock',
      '',
      '',
    ],
    [
      'Serum',
      '80',
      '40',
      '0',
      props.defaultCurrency || 'USD',
      'Cuidado facial',
      'Envío del proveedor',
      'https://ejemplo.com/serum.jpg',
      '2 gotas noche',
      '',
      '1',
      'dropship',
      'https://proveedor.com/serum',
      'SKU-88',
    ],
  ]
  const lines = ['sep=;', headers.join(';'), ...rows.map((row) => row.map(csvCell).join(';'))]
  const csv = `\uFEFF${lines.join('\r\n')}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = isIncentive.value ? 'inventario-incentivos.csv' : 'inventario-personal.csv'
  link.click()
  URL.revokeObjectURL(href)
}

function categoryLabel(product: Product): string {
  return product.category?.name || props.categories.find((item) => item.id === product.store_category_id)?.name || ''
}

function productChips(product: Product): Array<{ label: string; warn?: boolean }> {
  const chips: Array<{ label: string; warn?: boolean }> = [
    { label: product.fulfillment === 'dropship' && !product.stock ? 'Dropshipping' : `Bodega ${product.stock}` },
  ]

  if (product.allocated_remaining) {
    chips.push({ label: `Equipo ${product.allocated_remaining}` })
  }

  chips.push({ label: product.is_active ? 'Activo' : 'Inactivo' })

  if (product.is_published === false && !isIncentive.value) {
    chips.push({ label: 'No publicado' })
  }
  if (product.is_low_stock) {
    chips.push({ label: 'Stock bajo', warn: true })
  } else if (product.is_expired) {
    chips.push({ label: 'Vencido', warn: true })
  } else if (product.is_expiring_soon) {
    chips.push({ label: `Vence en ${product.days_until_expiry} día(s)`, warn: true })
  } else if (product.expires_at) {
    chips.push({ label: `Vence ${product.expires_at}` })
  }

  return chips
}

defineExpose({ resetForm })
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
    <div class="space-y-4">
      <SettingsBlock
        tone="yellow"
        icon="plus"
        :title="editingId ? (isIncentive ? 'Editar incentivo' : 'Editar producto') : isIncentive ? 'Nuevo incentivo' : 'Nuevo producto personal'"
        :body="
          isIncentive
            ? 'Regalos y extras que das al vender. Su costo de compra se suma al costo de venta del producto al que lo ligues.'
            : 'Solo tu tienda. Indica costo, incentivo y margen. El precio de venta se calcula para alcanzar ese margen; si cambias el precio a mano, el margen se actualiza.'
        "
        data-tour="store-new-product"
      >
        <form class="space-y-3" @submit.prevent="submit">
          <SoftField label="Nombre" :error="errors.name?.[0]">
            <input v-model="form.name" :class="fieldControlClass" required />
          </SoftField>
          <SoftField label="Categoría" :error="errors.store_category_id?.[0]">
            <select v-model="form.store_category_id" :class="fieldControlClass">
              <option value="">Sin categoría</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </SoftField>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SoftField label="Moneda" :error="errors.currency?.[0]">
              <select v-model="form.currency" :class="fieldControlClass">
                <option v-for="item in STORE_CURRENCIES" :key="item.code" :value="item.code">{{ item.label }}</option>
              </select>
            </SoftField>
            <SoftField v-if="!isIncentive" label="Precio de venta" :error="errors.price?.[0]">
              <input v-model.number="form.price" :class="fieldControlClass" type="number" min="0" step="0.01" />
            </SoftField>
            <SoftField label="Costo de compra" :error="errors.purchase_cost?.[0]">
              <input v-model.number="form.purchase_cost" :class="fieldControlClass" type="number" min="0" step="0.01" />
            </SoftField>
            <SoftField v-if="!isIncentive" label="Margen %" hint="Sobre el precio de venta.">
              <input
                v-model.number="form.margin"
                :class="fieldControlClass"
                type="number"
                min="0"
                max="95"
                step="0.1"
                placeholder="Ej. 30"
              />
            </SoftField>
            <SoftField v-if="isIncentive" label="Valor (opcional)" :error="errors.price?.[0]">
              <input v-model.number="form.price" :class="fieldControlClass" type="number" min="0" step="0.01" />
            </SoftField>
            <SoftField label="Stock" :error="errors.stock?.[0]">
              <input v-model.number="form.stock" :class="fieldControlClass" type="number" min="0" :disabled="form.fulfillment === 'dropship'" />
            </SoftField>
          </div>
          <template v-if="!isIncentive">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2" data-tour="store-gift">
              <SoftField label="Incentivo" :error="errors.incentive_product_id?.[0]">
                <select v-model="form.incentive_product_id" :class="fieldControlClass">
                  <option value="">Sin incentivo</option>
                  <option v-for="gift in incentives || []" :key="gift.id" :value="gift.id">
                    {{ gift.name }} · costo {{ money(gift.purchase_cost, gift.currency) }} · stock {{ gift.stock }}
                  </option>
                </select>
              </SoftField>
              <SoftField v-if="form.incentive_product_id" label="Unidades por venta">
                <input v-model.number="form.incentive_qty" :class="fieldControlClass" type="number" min="1" max="99" />
              </SoftField>
            </div>
            <p class="rounded-input bg-shell px-3 py-2 text-xs text-muted">
              Costo de venta {{ money(previewCost, form.currency) }}
              · utilidad {{ money(previewProfit, form.currency) }}
              · margen {{ signedPercent(previewMargin) }}
            </p>
          </template>
          <p v-else class="rounded-input bg-shell px-3 py-2 text-xs text-muted">
            Inventario a costo {{ money(Number(form.purchase_cost || 0) * Number(form.stock || 0), form.currency) }}
            <span v-if="Number(form.price || 0) > 0">
              · si lo valoras en {{ money(form.price, form.currency) }}, utilidad {{ money(previewProfit, form.currency) }}
            </span>
          </p>
          <SoftField label="Entrega">
            <select v-model="form.fulfillment" :class="fieldControlClass">
              <option value="stock">Stock propio</option>
              <option value="dropship">Dropshipping</option>
            </select>
          </SoftField>
          <template v-if="form.fulfillment === 'dropship'">
            <SoftField label="URL del proveedor" :error="errors.dropship_url?.[0]">
              <input v-model="form.dropship_url" :class="fieldControlClass" placeholder="https://..." />
            </SoftField>
            <SoftField label="SKU proveedor">
              <input v-model="form.dropship_sku" :class="fieldControlClass" />
            </SoftField>
          </template>
          <SoftField label="Vencimiento">
            <input v-model="form.expires_at" :class="fieldControlClass" type="date" />
          </SoftField>
          <SoftField label="Descripción">
            <textarea v-model="form.description" :class="fieldControlClass" rows="2" />
          </SoftField>
          <SoftField label="Ficha técnica">
            <textarea v-model="form.technical_sheet" :class="fieldControlClass" rows="3" placeholder="Composición, uso, advertencias…" />
          </SoftField>
          <SoftField label="Imagen (URL)" :error="errors.image?.[0]">
            <input v-model="form.image" :class="fieldControlClass" placeholder="https://..." />
          </SoftField>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="form.is_active" type="checkbox" />
            Activo
          </label>
          <label v-if="!isIncentive" class="flex items-center gap-2 text-sm">
            <input v-model="form.is_published" type="checkbox" />
            Publicado en la tienda pública
          </label>
          <div class="flex flex-wrap gap-2">
            <SoftButton type="submit" :disabled="saving">{{ editingId ? 'Guardar cambios' : 'Guardar' }}</SoftButton>
            <SoftButton v-if="editingId" variant="outline" type="button" @click="resetForm">Cancelar</SoftButton>
          </div>
        </form>
      </SettingsBlock>

      <SettingsBlock
        tone="yellow"
        icon="folder"
        title="Tus categorías"
        :body="isIncentive ? 'Opcional para agrupar incentivos.' : 'Solo de tu inventario personal. Borrar una deja los productos sin categoría.'"
      >
        <form class="mb-3 flex flex-col gap-2 sm:flex-row" @submit.prevent="addCategory">
          <input
            v-model="newCategoryName"
            :class="fieldControlClass"
            placeholder="Nueva categoría"
            maxlength="80"
          />
          <SoftButton type="submit" :disabled="saving || !newCategoryName.trim()">Crear</SoftButton>
        </form>
        <p v-if="!categories.length" class="text-sm text-muted">Aún no tienes categorías.</p>
        <ul v-else class="space-y-2">
          <li v-for="category in categories" :key="category.id" class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              v-if="renamingId === category.id"
              v-model="renameValue"
              :class="fieldControlClass"
              @keydown.enter.prevent="saveRename"
              @keydown.esc="renamingId = null"
            />
            <span v-else class="min-w-0 flex-1 text-sm font-medium">
              {{ category.name }}
              <span v-if="category.products_count != null" class="font-normal text-muted">
                · {{ category.products_count }}
              </span>
            </span>
            <div class="flex flex-wrap gap-2">
              <SoftButton v-if="renamingId === category.id" variant="outline" type="button" class="!px-3 !py-2" @click="saveRename">
                Ok
              </SoftButton>
              <SoftButton v-else variant="outline" type="button" class="!px-3 !py-2" @click="startRename(category)">
                Renombrar
              </SoftButton>
              <SoftButton variant="ghost" type="button" class="!px-3 !py-2" @click="emit('removeCategory', category.id)">
                Eliminar
              </SoftButton>
            </div>
          </li>
        </ul>
      </SettingsBlock>
    </div>

    <div class="space-y-4">
      <SettingsBlock
        tone="amber"
        icon="download"
        title="Carga masiva CSV"
        body="Excel en español: una columna por campo, incluido categoria. Usa punto y coma (;) como separador; no cambies la primera fila sep=;. Si la categoría no existe, se crea en tu tienda."
      >
        <div class="flex flex-wrap gap-2">
          <SoftButton variant="outline" type="button" @click="downloadTemplate">Descargar plantilla</SoftButton>
          <SoftButton variant="yellow" type="button" @click="csvInput?.click()">Subir CSV</SoftButton>
          <input ref="csvInput" class="hidden" type="file" accept=".csv,text/csv" @change="onCsv" />
        </div>
      </SettingsBlock>

      <SettingsBlock
        tone="sky"
        icon="bag"
        :title="isIncentive ? 'Tu bodega de incentivos' : 'Tu bodega'"
        :body="
          isIncentive
            ? 'Stock de regalos. Al vender un producto ligado, se descuenta de aquí y el costo entra en la utilidad de esa venta.'
            : 'Stock en tu tienda. Costo de venta = compra + incentivo. Asignar pasa unidades a un miembro del equipo.'
        "
        flush
        data-tour="store-warehouse"
      >
        <div v-if="products.length" class="grid grid-cols-3 gap-2 border-b border-line px-4 py-3 text-[11px] sm:px-5 sm:text-xs">
          <template v-for="row in totals" :key="row.currency">
            <p><span class="text-muted">Unidades {{ row.currency }}</span><br /><span class="font-medium">{{ row.stock }}</span></p>
            <p><span class="text-muted">Costo en bodega</span><br /><span class="font-medium">{{ money(row.cost, row.currency) }}</span></p>
            <p><span class="text-muted">{{ isIncentive ? 'Utilidad si hay valor' : 'Utilidad potencial' }}</span><br /><span class="font-medium">{{ money(row.profit, row.currency) }}</span></p>
          </template>
        </div>
        <div v-if="categories.length" class="flex flex-wrap gap-2 border-b border-line px-5 py-3">
          <button
            type="button"
            class="rounded-full px-3 py-1 text-xs"
            :class="categoryFilter === 'all' ? 'bg-yellow text-on-yellow' : 'bg-card'"
            @click="categoryFilter = 'all'"
          >
            Todas
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 text-xs"
            :class="categoryFilter === 'none' ? 'bg-yellow text-on-yellow' : 'bg-card'"
            @click="categoryFilter = 'none'"
          >
            Sin categoría
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            class="rounded-full px-3 py-1 text-xs"
            :class="categoryFilter === category.id ? 'bg-yellow text-on-yellow' : 'bg-card'"
            @click="categoryFilter = category.id"
          >
            {{ category.name }}
          </button>
        </div>
        <div v-if="!visibleProducts.length" class="p-6 text-sm text-muted">
          {{ products.length ? 'No hay productos en este filtro.' : isIncentive ? 'Aún no hay incentivos.' : 'Aún no hay productos personales.' }}
        </div>
        <ul v-else class="divide-y divide-line">
          <li v-for="product in visibleProducts" :key="product.id" class="px-4 py-4 sm:px-5">
            <div class="flex gap-3">
              <img
                v-if="product.image"
                :src="product.image"
                alt=""
                class="h-14 w-14 shrink-0 rounded-xl object-cover"
              />
              <div class="min-w-0 flex-1">
                <p class="font-medium leading-tight text-ink">{{ product.name }}</p>
                <p class="mt-0.5 text-sm text-muted">
                  <span v-if="categoryLabel(product)">{{ categoryLabel(product) }} · </span>
                  <span v-if="!isIncentive">{{ money(product.price, product.currency) }}</span>
                  <span v-else>Costo {{ money(product.purchase_cost, product.currency) }}</span>
                </p>
                <p v-if="product.incentive" class="mt-0.5 text-xs text-muted">
                  Incentivo: {{ product.incentive.name }}
                </p>
              </div>
            </div>
            <dl
              class="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4"
              :class="isIncentive ? 'sm:grid-cols-2' : ''"
            >
              <div class="rounded-2xl bg-shell px-3 py-2">
                <dt class="text-muted">Costo</dt>
                <dd class="font-medium text-ink">{{ money(product.purchase_cost, product.currency) }}</dd>
              </div>
              <template v-if="!isIncentive">
                <div class="rounded-2xl bg-shell px-3 py-2">
                  <dt class="text-muted">Venta</dt>
                  <dd class="font-medium text-ink">{{ money(product.unit_cost, product.currency) }}</dd>
                </div>
                <div class="rounded-2xl bg-shell px-3 py-2">
                  <dt class="text-muted">Utilidad</dt>
                  <dd class="font-medium text-ink">{{ money(product.unit_profit, product.currency) }}</dd>
                </div>
                <div class="rounded-2xl bg-shell px-3 py-2">
                  <dt class="text-muted">Margen</dt>
                  <dd class="font-medium text-ink">{{ signedPercent(product.margin_percent) }}</dd>
                </div>
              </template>
              <div v-else class="rounded-2xl bg-shell px-3 py-2">
                <dt class="text-muted">Valor</dt>
                <dd class="font-medium text-ink">{{ money(product.price, product.currency) }}</dd>
              </div>
            </dl>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="chip in productChips(product)"
                :key="chip.label"
                class="rounded-full px-2.5 py-1 text-[11px]"
                :class="chip.warn ? 'bg-yellow/80 text-on-yellow' : 'bg-shell text-muted'"
              >
                {{ chip.label }}
              </span>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <SoftButton
                v-if="!isIncentive && product.is_active && !product.is_expired && (product.fulfillment === 'dropship' || product.stock > 0)"
                variant="yellow"
                class="!px-3 !py-2"
                @click="emit('sell', product)"
              >
                Vender
              </SoftButton>
              <SoftButton
                v-if="!isIncentive && (product.fulfillment !== 'dropship' || product.stock > 0)"
                variant="outline"
                class="!px-3 !py-2"
                :disabled="!product.stock"
                @click="emit('assign', product)"
              >
                Asignar
              </SoftButton>
              <SoftButton variant="outline" class="!px-3 !py-2" @click="edit(product)">Editar</SoftButton>
              <SoftButton variant="ghost" class="!px-3 !py-2" @click="emit('remove', product.id)">Eliminar</SoftButton>
            </div>
          </li>
        </ul>
      </SettingsBlock>
    </div>
  </div>
</template>
