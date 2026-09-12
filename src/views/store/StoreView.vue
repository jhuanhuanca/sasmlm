<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import {
  assignInventory,
  createProduct,
  createStoreCategory,
  deleteProduct,
  deleteStoreCategory,
  fetchInventoryAllocations,
  fetchMyStore,
  fetchOrders,
  fetchProducts,
  fetchStoreCategories,
  importProducts,
  markOrderPaid,
  placePosOrder,
  returnInventory,
  applyTargetMargin,
  updateMyStore,
  updateProduct,
  updateStoreCategory,
} from '@/api/store'
import { fetchTeamRoster } from '@/api/dashboard'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import SoftField from '@/components/ui/SoftField.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import TableHeading from '@/components/ui/TableHeading.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import CompanyScopeBar from '@/components/company/CompanyScopeBar.vue'
import CompanyCatalogPanel from '@/components/store/CompanyCatalogPanel.vue'
import PersonalInventoryPanel from '@/components/store/PersonalInventoryPanel.vue'
import AssignInventoryModal from '@/components/store/AssignInventoryModal.vue'
import DirectSaleModal from '@/components/store/DirectSaleModal.vue'
import StoreDropshippingSettings from '@/components/store/StoreDropshippingSettings.vue'
import StorePaymentSettings from '@/components/store/StorePaymentSettings.vue'
import OrderVoucherThumb from '@/components/store/OrderVoucherThumb.vue'
import SettingsBlock from '@/components/store/SettingsBlock.vue'
import ReportExportBar from '@/components/reports/ReportExportBar.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { emptyDropshipping, hydrateDropshipping, type DropshippingSettings } from '@/data/shipping'
import { emptyShopPayments, hydrateShopPayments, paymentMethodLabel, type ShopPayments } from '@/data/shopPayments'
import type { Order, OrderSource, PlacePosOrderPayload, Product, ProductPayload, Store, StoreCategory, StoreSales, InventoryAllocation, TeamInventoryRow } from '@/types/store'
import type { ReferralRow } from '@/types/mlm'
import { compactNumber, formatDate, money } from '@/utils/format'
import { STORE_CURRENCIES } from '@/data/currencies'
import { errorMessage, fieldErrors } from '@/utils/http'
import { fieldControlClass } from '@/utils/ui'

const auth = useAuthStore()
const toast = useToast()
const tab = ref<'products' | 'orders' | 'team' | 'settings'>('products')
const shelf = ref<'company' | 'personal' | 'incentive'>('personal')
const orderSource = ref<OrderSource>('all')
const store = ref<Store | null>(null)
const products = ref<Product[]>([])
const categories = ref<StoreCategory[]>([])
const orders = ref<Order[]>([])
const sales = ref<StoreSales | null>(null)
const loading = ref(true)
const saving = ref(false)
const savingId = ref<number | null>(null)
const message = ref('')
const errors = ref<Record<string, string[]>>({})
const personalPanel = ref<{ resetForm: () => void } | null>(null)
const incentivePanel = ref<{ resetForm: () => void } | null>(null)
const teamMembers = ref<ReferralRow[]>([])
const allocations = ref<InventoryAllocation[]>([])
const teamInventory = ref<TeamInventoryRow[]>([])
const assignProduct = ref<Product | null>(null)
const saleOpen = ref(false)
const saleSeed = ref<Product | null>(null)
const saleErrors = ref<Record<string, string[]>>({})
const companyName = computed(
  () => auth.user?.company?.name || auth.user?.catalog_company_name || '',
)
const activeCompanyId = computed(
  () => auth.user?.active_catalog_company_id || auth.user?.catalog_company_id || 0,
)
const companyProducts = computed(() =>
  products.value.filter((item) => {
    if (item.source !== 'company') {
      return false
    }
    if (!activeCompanyId.value) {
      return true
    }
    return !item.catalog_company_id || item.catalog_company_id === activeCompanyId.value
  }),
)
const personalProducts = computed(() => products.value.filter((item) => item.source !== 'company' && item.source !== 'incentive'))
const incentiveProducts = computed(() => products.value.filter((item) => item.source === 'incentive'))
const sellableProducts = computed(() =>
  products.value.filter((item) => {
    if (item.source === 'incentive') {
      return false
    }
    if (!item.is_active || item.is_expired) {
      return false
    }
    if (item.fulfillment === 'dropship') {
      return true
    }
    return item.stock > 0
  }),
)
const lowStockProducts = computed(() => products.value.filter((item) => item.is_low_stock))
const expiringProducts = computed(() =>
  products.value.filter((item) => item.is_expired || item.is_expiring_soon),
)

const storeForm = reactive({
  name: '',
  is_active: true,
  whatsapp: '',
  currency: 'USD',
})
const dropshipping = ref<DropshippingSettings>(emptyDropshipping())
const payments = ref<ShopPayments>(emptyShopPayments())
const inventoryForm = reactive({
  low_stock_below: 3,
  expiry_warning_days: 15,
  target_margin_percent: null as number | null,
})
const applyingMargin = ref(false)

async function load(): Promise<void> {
  loading.value = true
  message.value = ''

  try {
    store.value = await fetchMyStore()
    storeForm.name = store.value.name
    storeForm.is_active = store.value.is_active
    storeForm.whatsapp = store.value.whatsapp || String(store.value.settings?.whatsapp ?? '')
    storeForm.currency = store.value.currency || String(store.value.settings?.currency ?? 'USD')
    dropshipping.value = hydrateDropshipping(store.value.dropshipping ?? store.value.settings?.dropshipping)
    payments.value = hydrateShopPayments(store.value.payments ?? store.value.settings?.payments)
    inventoryForm.low_stock_below = store.value.inventory?.low_stock_below ?? 3
    inventoryForm.expiry_warning_days = store.value.inventory?.expiry_warning_days ?? 15
    inventoryForm.target_margin_percent = store.value.inventory?.target_margin_percent ?? null
    const [productPage, orderPage, roster, assigned, categoryList] = await Promise.all([
      fetchProducts(),
      fetchOrders(1, orderSource.value),
      fetchTeamRoster().catch(() => ({ data: [] as ReferralRow[] })),
      fetchInventoryAllocations().catch(() => ({ data: [] as InventoryAllocation[], team: [] as TeamInventoryRow[] })),
      fetchStoreCategories().catch(() => [] as StoreCategory[]),
    ])
    products.value = productPage.data
    categories.value = categoryList
    orders.value = orderPage.data
    sales.value = orderPage.sales ?? null
    teamMembers.value = roster.data
    allocations.value = assigned.data
    teamInventory.value = assigned.team
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo cargar la tienda')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

async function addProduct(payload: ProductPayload): Promise<void> {
  errors.value = {}
  saving.value = true
  try {
    const product = await createProduct(payload)
    products.value.unshift(product)
    if (payload.source === 'incentive') {
      incentivePanel.value?.resetForm()
    } else {
      personalPanel.value?.resetForm()
    }
    message.value = 'Producto guardado en tu inventario. No se comparte con otros líderes ni con el catálogo de la empresa.'
    toast.success(`${product.name} quedó en tu inventario.`, 'Producto creado')
    categories.value = await fetchStoreCategories().catch(() => categories.value)
  } catch (error) {
    errors.value = fieldErrors(error)
    message.value = errorMessage(error)
    toast.fromError(error, 'No se pudo crear el producto')
  } finally {
    saving.value = false
  }
}

async function savePersonal(id: number, payload: ProductPayload): Promise<void> {
  errors.value = {}
  saving.value = true
  try {
    const product = await updateProduct(id, payload)
    products.value = products.value.map((item) => (item.id === id ? product : item))
    if (payload.source === 'incentive') {
      incentivePanel.value?.resetForm()
    } else {
      personalPanel.value?.resetForm()
    }
    message.value = 'Inventario actualizado.'
    toast.success(`${product.name} se actualizó.`, 'Producto actualizado')
    categories.value = await fetchStoreCategories().catch(() => categories.value)
  } catch (error) {
    errors.value = fieldErrors(error)
    message.value = errorMessage(error)
    toast.fromError(error, 'No se pudo actualizar el producto')
  } finally {
    saving.value = false
  }
}

async function removeProduct(id: number): Promise<void> {
  const product = products.value.find((item) => item.id === id)
  try {
    await deleteProduct(id)
    products.value = products.value.filter((item) => item.id !== id)
    toast.success(`${product?.name ?? 'El producto'} se eliminó de tu inventario.`, 'Producto eliminado')
    categories.value = await fetchStoreCategories().catch(() => categories.value)
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo eliminar el producto')
    toast.fromError(error, 'No se pudo eliminar el producto')
  }
}

async function addCategory(name: string): Promise<void> {
  errors.value = {}
  saving.value = true
  try {
    const category = await createStoreCategory(name)
    categories.value = [...categories.value, category]
    toast.success(`${category.name} quedó en tu inventario.`, 'Categoría creada')
  } catch (error) {
    errors.value = fieldErrors(error)
    toast.fromError(error, 'No se pudo crear la categoría')
  } finally {
    saving.value = false
  }
}

async function renameCategory(id: number, name: string): Promise<void> {
  errors.value = {}
  try {
    const category = await updateStoreCategory(id, name)
    categories.value = categories.value.map((item) => (item.id === id ? category : item))
    products.value = products.value.map((item) =>
      item.store_category_id === id
        ? { ...item, category: { id: category.id, name: category.name, slug: category.slug } }
        : item,
    )
    toast.success('Categoría actualizada.', 'Categoría')
  } catch (error) {
    errors.value = fieldErrors(error)
    toast.fromError(error, 'No se pudo renombrar la categoría')
  }
}

async function removeCategory(id: number): Promise<void> {
  try {
    await deleteStoreCategory(id)
    categories.value = categories.value.filter((item) => item.id !== id)
    products.value = products.value.map((item) =>
      item.store_category_id === id ? { ...item, store_category_id: null, category: null } : item,
    )
    toast.success('Los productos de esa categoría quedan sin clasificar.', 'Categoría eliminada')
  } catch (error) {
    toast.fromError(error, 'No se pudo eliminar la categoría')
  }
}

async function patchCompany(
  product: Product,
  patch: { is_published?: boolean; stock?: number; fulfillment?: 'stock' | 'dropship'; expires_at?: string | null; price?: number; currency?: string },
): Promise<void> {
  savingId.value = product.id
  try {
    const next = await updateProduct(product.id, patch)
    products.value = products.value.map((item) => (item.id === product.id ? next : item))
    if (patch.is_published !== undefined) {
      message.value = next.is_published
        ? `${next.name} ya está en tu tienda pública.`
        : `${next.name} dejó de publicarse en tu tienda.`
      toast.success(
        next.is_published ? `${next.name} ya está en tu tienda pública.` : `${next.name} dejó de publicarse.`,
        next.is_published ? 'Producto publicado' : 'Producto retirado',
      )
    } else {
      message.value = `${next.name} actualizado.`
      toast.success(`${next.name} se actualizó.`, 'Catálogo actualizado')
    }
  } catch (error) {
    message.value = errorMessage(error)
    toast.fromError(error, 'No se pudo actualizar el catálogo')
  } finally {
    savingId.value = null
  }
}

async function uploadCsv(file: File): Promise<void> {
  errors.value = {}
  saving.value = true
  try {
    const result = await importProducts(file, shelf.value === 'incentive' ? 'incentive' : 'personal')
    products.value = [...result.data, ...products.value]
    message.value = `CSV importado: ${result.imported} productos${result.skipped ? `, ${result.skipped} filas omitidas` : ''}.`
    toast.success(message.value, 'CSV importado')
    categories.value = await fetchStoreCategories().catch(() => categories.value)
  } catch (error) {
    errors.value = fieldErrors(error)
    message.value = errorMessage(error, 'No se pudo importar el CSV')
    toast.fromError(error, 'No se pudo importar el CSV')
  } finally {
    saving.value = false
  }
}

async function loadOrders(): Promise<void> {
  const orderPage = await fetchOrders(1, orderSource.value)
  orders.value = orderPage.data
  sales.value = orderPage.sales ?? sales.value
}

async function payOrder(id: number): Promise<void> {
  try {
    await markOrderPaid(id)
    await loadOrders()
    toast.success('La orden quedó marcada como pagada.', 'Orden pagada')
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo marcar la orden como pagada')
    toast.fromError(error, 'No se pudo marcar la orden como pagada')
  }
}

function openSale(product?: Product): void {
  saleErrors.value = {}
  saleSeed.value = product ?? null
  saleOpen.value = true
}

async function submitSale(payload: PlacePosOrderPayload): Promise<void> {
  saleErrors.value = {}
  saving.value = true
  try {
    const order = await placePosOrder(payload)
    saleOpen.value = false
    saleSeed.value = null
    await Promise.all([refreshTeamStock(), loadOrders()])
    const paid = order.status === 'paid'
    toast.success(
      paid
        ? `Venta a ${order.customer_name} registrada y cobrada.`
        : `Venta a ${order.customer_name} queda pendiente de cobro.`,
      'Venta directa',
    )
    message.value = paid ? 'Venta directa cobrada. Cuenta en el dashboard.' : 'Venta directa pendiente de cobro.'
  } catch (error) {
    saleErrors.value = fieldErrors(error)
    toast.fromError(error, 'No se pudo registrar la venta')
  } finally {
    saving.value = false
  }
}

function openInventory(product?: Product): void {
  tab.value = 'products'
  if (product?.source === 'company') {
    shelf.value = 'company'
    return
  }
  if (product?.source === 'incentive') {
    shelf.value = 'incentive'
    return
  }

  shelf.value = 'personal'
}

async function changeOrderSource(source: OrderSource): Promise<void> {
  orderSource.value = source
  tab.value = 'orders'
  await loadOrders()
}

async function refreshTeamStock(): Promise<void> {
  const [productPage, assigned] = await Promise.all([fetchProducts(), fetchInventoryAllocations()])
  products.value = productPage.data
  allocations.value = assigned.data
  teamInventory.value = assigned.team
}

async function assignToMember(payload: {
  product_id: number
  partner_user_id: number
  quantity: number
  notes?: string
}): Promise<void> {
  saving.value = true
  try {
    await assignInventory(payload)
    assignProduct.value = null
    await refreshTeamStock()
    toast.success('Las unidades salieron de tu bodega y quedaron a cargo del miembro.', 'Inventario asignado')
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo asignar el inventario')
    toast.fromError(error, 'No se pudo asignar')
  } finally {
    saving.value = false
  }
}

async function giveBack(row: InventoryAllocation): Promise<void> {
  const remaining = row.qty_remaining
  if (!remaining) {
    return
  }
  const raw = window.prompt(`Unidades a devolver a tu bodega (máximo ${remaining})`, String(remaining))
  if (raw === null) {
    return
  }
  const quantity = Number(raw)
  if (!quantity || quantity < 1) {
    return
  }
  try {
    await returnInventory(row.id, quantity)
    await refreshTeamStock()
    toast.success('Las unidades volvieron a tu bodega.', 'Inventario devuelto')
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo devolver el inventario')
    toast.fromError(error, 'No se pudo devolver')
  }
}

async function openMemberOrders(partnerUserId: number): Promise<void> {
  orderSource.value = 'team'
  tab.value = 'orders'
  const orderPage = await fetchOrders(1, 'team', partnerUserId)
  orders.value = orderPage.data
  sales.value = orderPage.sales ?? sales.value
}

function onPaymentsUploaded(next: Store): void {
  store.value = next
  payments.value = hydrateShopPayments(next.payments ?? next.settings?.payments)
}

function inventoryPayload() {
  const raw = inventoryForm.target_margin_percent as number | null | string
  const margin = raw === null || raw === undefined || raw === '' || Number.isNaN(Number(raw)) ? null : Number(raw)

  return {
    low_stock_below: Number(inventoryForm.low_stock_below || 3),
    expiry_warning_days: Number(inventoryForm.expiry_warning_days || 15),
    target_margin_percent: margin,
  }
}

function syncInventoryForm(next: Store): void {
  inventoryForm.low_stock_below = next.inventory?.low_stock_below ?? inventoryForm.low_stock_below
  inventoryForm.expiry_warning_days = next.inventory?.expiry_warning_days ?? inventoryForm.expiry_warning_days
  inventoryForm.target_margin_percent = next.inventory?.target_margin_percent ?? null
  storeForm.currency = next.currency || storeForm.currency
}

async function persistStoreSettings(): Promise<void> {
  store.value = await updateMyStore({
    name: storeForm.name,
    is_active: storeForm.is_active,
    settings: {
      ...(store.value?.settings ?? {}),
      whatsapp: storeForm.whatsapp,
      currency: storeForm.currency,
      dropshipping: dropshipping.value,
      payments: payments.value,
      inventory: inventoryPayload(),
    },
  })
  dropshipping.value = hydrateDropshipping(store.value.dropshipping ?? store.value.settings?.dropshipping)
  payments.value = hydrateShopPayments(store.value.payments ?? store.value.settings?.payments)
  syncInventoryForm(store.value)
}

async function saveStore(): Promise<void> {
  try {
    await persistStoreSettings()
    const productPage = await fetchProducts()
    products.value = productPage.data
    message.value = 'Ajustes, cobros, tarifas de envío y alertas de inventario guardados.'
    toast.success('Nombre, WhatsApp, cobros, envíos, margen e inventario quedaron guardados.', 'Ajustes guardados')
  } catch (error) {
    message.value = errorMessage(error, 'No se pudieron guardar los ajustes')
    toast.fromError(error, 'No se pudieron guardar los ajustes')
  }
}

async function applyStoreTargetMargin(): Promise<void> {
  applyingMargin.value = true
  try {
    await persistStoreSettings()
    const result = await applyTargetMargin()
    const productPage = await fetchProducts()
    products.value = productPage.data
    message.value = result.message
    toast.success(result.message, 'Margen aplicado')
  } catch (error) {
    message.value = errorMessage(error, 'No se pudo aplicar el margen')
    toast.fromError(error, 'No se pudo aplicar el margen')
  } finally {
    applyingMargin.value = false
  }
}
</script>

<template>
  <div>
    <div data-tour="store-welcome">
    <ModuleBanner
      icon="bag"
      eyebrow="Líder"
      title="Tienda"
      body="Tu e-commerce: inventario personal y, aparte, los productos de tu empresa que tú eliges publicar. El dashboard y el cierre solo cuentan órdenes pagadas."
      :actions="[
        'Publica o retira productos del catálogo de tu empresa.',
        'Controla stock, vencimiento, ficha técnica y dropshipping en lo tuyo.',
        'Carga un CSV para alta masiva. Las órdenes pagadas no se mezclan con PV.',
        'Registra ventas en persona desde el inventario, con o sin envío.',
      ]"
    >
      <a
        v-if="store"
        :href="`/s/${store.slug}`"
        class="rounded-full border border-line bg-card px-4 py-2 text-sm"
        target="_blank"
        rel="noreferrer"
      >
        Ver pública
      </a>
    </ModuleBanner>
    </div>

    <CompanyScopeBar
      v-if="tab === 'products' || tab === 'team'"
      class="mt-4"
      :label="tab === 'team' ? 'Inventario / equipo de empresa' : 'Catálogo de empresa'"
      @changed="load"
    />

    <div v-if="sales && !loading" class="mt-6 grid gap-3 sm:grid-cols-3" data-tour="store-sales">
      <button type="button" class="text-left" @click="changeOrderSource('personal')">
        <SoftCard :class="tab === 'orders' && orderSource === 'personal' ? 'ring-1 ring-charcoal' : ''">
          <p class="text-sm text-muted">Ventas personales</p>
          <p class="mt-2 font-display text-3xl font-bold">{{ money(sales.personal_total, sales.currency) }}</p>
          <p class="mt-2 text-xs text-muted">
            {{ compactNumber(sales.personal_orders) }} pagadas · este mes {{ money(sales.personal_month, sales.currency) }}
          </p>
          <p
            v-for="row in (sales.by_currency ?? []).filter((item) => sales !== null && item.currency !== sales.currency && item.personal_total)"
            :key="`p-${row.currency}`"
            class="mt-1 text-xs text-muted"
          >
            También {{ money(row.personal_total, row.currency) }}
          </p>
        </SoftCard>
      </button>
      <button type="button" class="text-left" @click="tab = 'team'">
        <SoftCard :class="tab === 'team' ? 'ring-1 ring-charcoal' : ''">
          <p class="text-sm text-muted">Ventas del equipo</p>
          <p class="mt-2 font-display text-3xl font-bold">{{ money(sales.team_total, sales.currency) }}</p>
          <p class="mt-2 text-xs text-muted">
            {{ compactNumber(sales.team_orders) }} pagadas · este mes {{ money(sales.team_month, sales.currency) }}
          </p>
          <p
            v-for="row in (sales.by_currency ?? []).filter((item) => sales !== null && item.currency !== sales.currency && item.team_total)"
            :key="`t-${row.currency}`"
            class="mt-1 text-xs text-muted"
          >
            También {{ money(row.team_total, row.currency) }}
          </p>
        </SoftCard>
      </button>
      <button type="button" class="text-left" @click="changeOrderSource('all')">
        <SoftCard :class="tab === 'orders' && orderSource === 'all' ? 'ring-1 ring-charcoal' : ''">
          <p class="text-sm text-muted">Total pagado</p>
          <p class="mt-2 font-display text-3xl font-bold">{{ money(sales.total, sales.currency) }}</p>
          <p class="mt-2 text-xs text-muted">
            Directas más las que cerró tu red
          </p>
          <p
            v-for="row in (sales.by_currency ?? []).filter((item) => sales !== null && item.currency !== sales.currency && item.total)"
            :key="`a-${row.currency}`"
            class="mt-1 text-xs text-muted"
          >
            También {{ money(row.total, row.currency) }}
          </p>
        </SoftCard>
      </button>
    </div>

    <div class="mt-6 flex gap-2 overflow-x-auto pb-1" data-tour="store-tabs">
      <button
        v-for="item in [
          { id: 'products', label: 'Inventario' },
          { id: 'orders', label: 'Órdenes' },
          { id: 'team', label: 'Equipo' },
          { id: 'settings', label: 'Ajustes' },
        ] as const"
        :key="item.id"
        class="shrink-0 rounded-full px-4 py-2 text-sm"
        :class="tab === item.id ? 'bg-charcoal text-on-charcoal' : 'bg-card'"
        @click="tab = item.id"
      >
        {{ item.label }}
      </button>
    </div>

    <p v-if="message" class="mt-4 text-sm text-muted">{{ message }}</p>
    <p v-if="loading" class="mt-4 text-sm text-muted">Cargando…</p>

    <div v-if="!loading && (lowStockProducts.length || expiringProducts.length)" class="mt-4 space-y-2">
      <button
        v-if="lowStockProducts.length"
        type="button"
        class="w-full rounded-card border border-line bg-card px-4 py-3 text-left text-sm"
        @click="openInventory(lowStockProducts[0])"
      >
        <p class="font-medium">Stock bajo ({{ inventoryForm.low_stock_below }} unidades o menos)</p>
        <p class="mt-1 text-muted">
          {{ lowStockProducts.map((item) => `${item.name} (${item.stock})`).join(' · ') }}
        </p>
      </button>
      <button
        v-if="expiringProducts.length"
        type="button"
        class="w-full rounded-card border border-line bg-card px-4 py-3 text-left text-sm"
        @click="openInventory(expiringProducts[0])"
      >
        <p class="font-medium">Vencimiento</p>
        <p class="mt-1 text-muted">
          {{
            expiringProducts
              .map((item) =>
                item.is_expired
                  ? `${item.name} ya venció`
                  : `${item.name} vence en ${item.days_until_expiry} día(s)`,
              )
              .join(' · ')
          }}
        </p>
      </button>
    </div>

    <div v-if="!loading && tab === 'products'" class="mt-6 space-y-5" data-tour="store-shelf">
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-full px-4 py-2 text-sm"
          :class="shelf === 'personal' ? 'bg-yellow text-on-yellow' : 'bg-card'"
          @click="shelf = 'personal'"
        >
          Inventario personal
        </button>
        <button
          type="button"
          class="rounded-full px-4 py-2 text-sm"
          :class="shelf === 'incentive' ? 'bg-charcoal text-on-charcoal' : 'bg-card'"
          @click="shelf = 'incentive'"
        >
          Incentivos
        </button>
        <button
          type="button"
          class="rounded-full px-4 py-2 text-sm"
          :class="shelf === 'company' ? 'bg-[#059669] text-white' : 'bg-card'"
          @click="shelf = 'company'"
        >
          Catálogo de empresa
        </button>
        <SoftButton variant="yellow" class="w-full sm:ml-auto sm:w-auto" :disabled="!sellableProducts.length" @click="openSale()">
          Registrar venta
        </SoftButton>
      </div>
      <ReportExportBar
        label="Reporte de inventario"
        hint="Personal, incentivos, empresa y asignaciones"
        path="/my-store/reports/inventory"
        file-base="inventario"
      />

      <PersonalInventoryPanel
        v-if="shelf === 'personal'"
        ref="personalPanel"
        kind="personal"
        :target-margin="inventoryForm.target_margin_percent"
        :products="personalProducts"
        :incentives="incentiveProducts"
        :default-currency="storeForm.currency"
        :categories="categories"
        :errors="errors"
        :saving="saving"
        @create="addProduct"
        @update="savePersonal"
        @remove="removeProduct"
        @import="uploadCsv"
        @assign="assignProduct = $event"
        @sell="openSale"
        @create-category="addCategory"
        @update-category="renameCategory"
        @remove-category="removeCategory"
      />
      <PersonalInventoryPanel
        v-else-if="shelf === 'incentive'"
        ref="incentivePanel"
        kind="incentive"
        :products="incentiveProducts"
        :categories="categories"
        :default-currency="storeForm.currency"
        :errors="errors"
        :saving="saving"
        @create="addProduct"
        @update="savePersonal"
        @remove="removeProduct"
        @import="uploadCsv"
        @create-category="addCategory"
        @update-category="renameCategory"
        @remove-category="removeCategory"
      />
      <CompanyCatalogPanel
        v-else
        :products="companyProducts"
        :company-name="companyName"
        :saving-id="savingId"
        @publish="(product, published) => patchCompany(product, { is_published: published })"
        @patch="(product, patch) => patchCompany(product, patch)"
        @sell="openSale"
      />
    </div>

    <div v-else-if="!loading && tab === 'team'" class="mt-6 space-y-4">
      <SettingsBlock
        tone="charcoal"
        icon="users"
        title="Control del equipo"
        body="Unidades que entregaste de tu inventario y ventas pagadas atribuidas a cada miembro (enlace con ref). No se mezcla con PV ni con comisiones de plan."
      >
        <p class="text-sm text-muted">
          Usa Asignar en inventario personal para entregar stock. Aquí ves qué tiene cada quien y cuánto ya vendió.
        </p>
      </SettingsBlock>
      <SettingsBlock
        tone="violet"
        icon="bag"
        title="Inventario en manos del equipo"
        body="Unidades que salieron de tu bodega y siguen sin venderse, o ya se vendieron con el enlace del miembro."
        flush
      >
        <p v-if="!allocations.length" class="px-5 py-6 text-sm text-muted">
          Aún no asignaste unidades. En Inventario personal usa Asignar.
        </p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead class="text-muted">
              <tr class="border-b border-line">
                <th class="px-5 py-3 font-medium">Producto</th>
                <th class="px-5 py-3 font-medium">Miembro</th>
                <th class="px-5 py-3 font-medium">Asignado</th>
                <th class="px-5 py-3 font-medium">Vendido</th>
                <th class="px-5 py-3 font-medium">Pendiente</th>
                <th class="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in allocations" :key="row.id" class="border-b border-line last:border-0">
                <td class="px-5 py-4">{{ row.product?.name }}</td>
                <td class="px-5 py-4">
                  <p>{{ row.partner?.name }}</p>
                  <p class="text-muted">{{ row.partner?.email }}</p>
                </td>
                <td class="px-5 py-4">{{ row.qty_assigned }}</td>
                <td class="px-5 py-4">{{ row.qty_sold }}</td>
                <td class="px-5 py-4">{{ row.qty_remaining }}</td>
                <td class="px-5 py-4">
                  <SoftButton v-if="row.qty_remaining" variant="outline" @click="giveBack(row)">Devolver</SoftButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SettingsBlock>
      <SettingsBlock
        tone="emerald"
        icon="wallet"
        title="Ventas pagadas por miembro"
        body="Dinero de tu tienda atribuido a cada socio o líder. No es volumen de empresa."
        flush
      >
        <p v-if="!teamInventory.length" class="px-5 py-6 text-sm text-muted">
          Cuando un socio venda con tu tienda (su enlace) o con stock asignado, aparece aquí.
        </p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[560px] text-left text-sm">
            <thead class="text-muted">
              <tr class="border-b border-line">
                <th class="px-5 py-3 font-medium">Miembro</th>
                <th class="px-5 py-3 font-medium">En su poder</th>
                <th class="px-5 py-3 font-medium">Unidades vendidas</th>
                <th class="px-5 py-3 font-medium">Órdenes</th>
                <th class="px-5 py-3 font-medium">Total pagado</th>
                <th class="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in teamInventory" :key="row.partner_user_id" class="border-b border-line last:border-0">
                <td class="px-5 py-4">
                  <p>{{ row.name }}</p>
                  <p class="text-muted">{{ row.email }}</p>
                </td>
                <td class="px-5 py-4">{{ row.qty_remaining }}</td>
                <td class="px-5 py-4">{{ row.qty_sold }}</td>
                <td class="px-5 py-4">{{ row.orders_count }}</td>
                <td class="px-5 py-4">
                  <template v-if="row.sales_by_currency?.length">
                    <p v-for="item in row.sales_by_currency" :key="item.currency">
                      {{ money(item.total, item.currency) }}
                    </p>
                  </template>
                  <span v-else>{{ money(row.sales_total, sales?.currency ?? 'USD') }}</span>
                </td>
                <td class="px-5 py-4">
                  <SoftButton variant="outline" @click="openMemberOrders(row.partner_user_id)">Ver órdenes</SoftButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SettingsBlock>
    </div>

    <SoftCard v-else-if="!loading && tab === 'orders'" :padded="false" class="mt-6 overflow-x-auto">
      <div class="flex flex-wrap items-center gap-3 px-5 py-4">
        <div class="flex gap-2 overflow-x-auto">
        <button
          v-for="item in [
            { id: 'all', label: 'Todas' },
            { id: 'personal', label: 'Personales' },
            { id: 'team', label: 'Equipo' },
          ] as const"
          :key="item.id"
          class="shrink-0 rounded-full px-4 py-2 text-sm"
          :class="orderSource === item.id ? 'bg-charcoal text-on-charcoal' : 'bg-shell'"
          @click="changeOrderSource(item.id)"
        >
          {{ item.label }}
        </button>
        </div>
        <ReportExportBar
          class="ml-auto"
          label="Reporte de ventas"
          hint="Pedidos y líneas"
          path="/my-store/reports/sales"
          file-base="ventas"
        />
      </div>
      <p v-if="!orders.length" class="px-5 pb-6 text-sm text-muted">
        <template v-if="orderSource === 'personal'">Aún no hay ventas personales pagadas o pendientes.</template>
        <template v-else-if="orderSource === 'team'">Aún no hay ventas atribuidas a socios.</template>
        <template v-else>No hay órdenes todavía.</template>
      </p>
      <table v-else class="w-full min-w-[640px] text-left text-sm">
        <thead class="text-muted">
          <tr class="border-b border-line">
            <th class="px-5 py-3 font-medium"><TableHeading icon="user" label="Cliente" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="users" label="Socio" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="wallet" label="Total" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="bag" label="Envío" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="clipboard" label="Estado" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="file" label="Comprobante" /></th>
            <th class="px-5 py-3 font-medium"><TableHeading icon="calendar" label="Fecha" /></th>
            <th class="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id" class="border-b border-line last:border-0">
            <td class="px-5 py-4">
              <p class="inline-flex items-center gap-2">
                <span class="grid h-8 w-8 place-items-center rounded-full bg-shell text-muted">
                  <AppIcon name="user" :size="14" />
                </span>
                {{ order.customer_name }}
              </p>
              <p v-if="order.customer_email" class="pl-10 text-muted">{{ order.customer_email }}</p>
              <p class="pl-10 text-xs text-muted">
                {{ order.channel === 'pos' ? 'Venta directa' : 'Tienda pública' }}
                <span v-if="order.delivery === 'pickup'"> · retiro</span>
                <span v-if="order.payment_method"> · {{ paymentMethodLabel(order.payment_method) }}</span>
              </p>
            </td>
            <td class="px-5 py-4">
              <p>{{ order.partner?.name ?? 'Personal' }}</p>
              <p v-if="order.partner?.email" class="text-muted">{{ order.partner.email }}</p>
            </td>
            <td class="px-5 py-4">{{ money(order.total, order.currency) }}</td>
            <td class="px-5 py-4">
              <p>{{ money(order.shipping_fee ?? 0, order.currency) }}</p>
              <p v-if="order.shipping_zone" class="text-muted">{{ order.shipping_zone }}</p>
              <p v-if="order.shipping_country" class="text-muted">
                {{ [order.shipping_country, order.shipping_department, order.shipping_area].filter(Boolean).join(' · ') }}
              </p>
              <p v-if="order.shipping_address" class="text-muted">{{ order.shipping_address }}</p>
            </td>
            <td class="px-5 py-4 capitalize">{{ order.status }}</td>
            <td class="px-5 py-4">
              <OrderVoucherThumb v-if="order.has_payment_voucher || order.payment_voucher_url" :order-id="order.id" />
              <span v-else class="text-muted">Sin imagen</span>
            </td>
            <td class="px-5 py-4">{{ formatDate(order.created_at) }}</td>
            <td class="px-5 py-4">
              <SoftButton
                v-if="order.status === 'pending'"
                variant="yellow"
                @click="payOrder(order.id)"
              >
                Marcar pagada
              </SoftButton>
            </td>
          </tr>
        </tbody>
      </table>
    </SoftCard>

    <form v-else-if="!loading && tab === 'settings'" class="mt-6 space-y-4" @submit.prevent="saveStore">
      <SettingsBlock
        tone="yellow"
        icon="gear"
        title="Datos de la tienda"
        body="Nombre público, WhatsApp, moneda de venta y si la tienda está abierta."
      >
        <div class="grid max-w-3xl gap-4 md:grid-cols-2">
          <SoftField label="Nombre de tienda">
            <input v-model="storeForm.name" :class="fieldControlClass" />
          </SoftField>
          <SoftField label="WhatsApp">
            <input v-model="storeForm.whatsapp" :class="fieldControlClass" placeholder="18095551234" inputmode="tel" />
          </SoftField>
          <SoftField
            class="md:col-span-2"
            label="Moneda de la tienda"
            hint="Precios, inventario y envíos. Las comisiones de plan siguen en dólares."
          >
            <select v-model="storeForm.currency" :class="fieldControlClass">
              <option v-for="item in STORE_CURRENCIES" :key="item.code" :value="item.code">{{ item.label }}</option>
            </select>
          </SoftField>
        </div>
        <label class="mt-4 flex items-center gap-3 text-sm">
          <input v-model="storeForm.is_active" type="checkbox" />
          Tienda activa
        </label>
      </SettingsBlock>

      <StorePaymentSettings v-model="payments" @uploaded="onPaymentsUploaded" />

      <StoreDropshippingSettings v-model="dropshipping" />

      <SettingsBlock
        tone="rose"
        icon="bell"
        title="Alertas de inventario"
        body="El sistema te avisa en la campana y en esta pantalla. Cada líder elige sus umbrales."
      >
        <div class="grid max-w-3xl gap-4 md:grid-cols-2">
          <SoftField
            label="Días de anticipación al vencimiento"
            hint="Avisar cuando falten estos días o menos para que venza el producto."
          >
            <input
              v-model.number="inventoryForm.expiry_warning_days"
              :class="fieldControlClass"
              type="number"
              min="1"
              max="365"
              required
            />
          </SoftField>
          <SoftField
            label="Unidades para stock bajo"
            hint="Avisar cuando queden esta cantidad de unidades o menos."
          >
            <input
              v-model.number="inventoryForm.low_stock_below"
              :class="fieldControlClass"
              type="number"
              min="1"
              max="9999"
              required
            />
          </SoftField>
        </div>
      </SettingsBlock>

      <SettingsBlock
        tone="amber"
        icon="chart"
        title="Margen de productos"
        body="Margen sobre el precio de venta: utilidad ÷ precio. Al crear un producto personal, el precio se calcula desde el costo de venta (compra + incentivo) para alcanzar este porcentaje. Puedes cambiarlo producto a producto."
      >
        <div class="grid max-w-3xl gap-4 md:grid-cols-2">
          <SoftField
            label="Margen objetivo (%)"
            hint="Entre 0 y 95. Ejemplo: costo 70 y margen 30 % → precio 100."
          >
            <input
              v-model.number="inventoryForm.target_margin_percent"
              :class="fieldControlClass"
              type="number"
              min="0"
              max="95"
              step="0.1"
              placeholder="Ej. 30"
            />
          </SoftField>
        </div>
        <div class="mt-4">
          <SoftButton
            type="button"
            variant="outline"
            :disabled="applyingMargin"
            @click="applyStoreTargetMargin"
          >
            {{ applyingMargin ? 'Aplicando…' : 'Aplicar a productos personales' }}
          </SoftButton>
          <p class="mt-2 text-xs text-muted">
            Recalcula el precio de venta de tu inventario personal con este margen. Los incentivos y el catálogo de empresa no se tocan.
          </p>
        </div>
      </SettingsBlock>

      <div class="sticky bottom-4 z-10">
        <SoftButton type="submit">Guardar ajustes</SoftButton>
      </div>
    </form>

    <AssignInventoryModal
      :open="assignProduct !== null"
      :product="assignProduct"
      :members="teamMembers"
      :saving="saving"
      @close="assignProduct = null"
      @assign="assignToMember"
    />
    <DirectSaleModal
      :open="saleOpen"
      :products="sellableProducts"
      :seed="saleSeed"
      :shipping="dropshipping"
      :saving="saving"
      :errors="saleErrors"
      @close="saleOpen = false"
      @submit="submitSale"
    />
  </div>
</template>
