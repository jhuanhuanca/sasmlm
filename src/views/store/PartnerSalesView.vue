<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchPartnerSalesCatalog, fetchPartnerSalesOrders, placePartnerPosOrder } from '@/api/partnerSales'
import DirectSaleModal from '@/components/store/DirectSaleModal.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import TableHeading from '@/components/ui/TableHeading.vue'
import { useToast } from '@/composables/useToast'
import { emptyDropshipping, hydrateDropshipping, type DropshippingSettings } from '@/data/shipping'
import type { Order, PlacePosOrderPayload, Product, Store } from '@/types/store'
import { compactNumber, formatDate, money } from '@/utils/format'
import { errorMessage, fieldErrors } from '@/utils/http'

const toast = useToast()
const loading = ref(true)
const saving = ref(false)
const message = ref('')
const leaderName = ref('tu líder')
const store = ref<Store | null>(null)
const products = ref<Product[]>([])
const orders = ref<Order[]>([])
const totals = ref({ currency: 'USD', total: 0, month: 0, orders_count: 0 })
const shipping = ref<DropshippingSettings>(emptyDropshipping())
const saleOpen = ref(false)
const saleSeed = ref<Product | null>(null)
const saleErrors = ref<Record<string, string[]>>({})

const sellableProducts = computed(() =>
  products.value.filter((item) => {
    if (!item.is_active || item.is_expired) {
      return false
    }
    if (item.fulfillment === 'dropship') {
      return true
    }
    return item.stock > 0
  }),
)

async function loadCatalog(): Promise<void> {
  const catalog = await fetchPartnerSalesCatalog()
  store.value = catalog.store
  leaderName.value = catalog.leader_name || catalog.store.owner_name || 'tu líder'
  products.value = catalog.products
  shipping.value = hydrateDropshipping(catalog.store.dropshipping ?? catalog.store.settings?.dropshipping)
}

async function loadOrders(): Promise<void> {
  const page = await fetchPartnerSalesOrders()
  orders.value = page.data
  if (page.sales) {
    totals.value = page.sales
  }
}

async function load(): Promise<void> {
  loading.value = true
  message.value = ''
  try {
    await Promise.all([loadCatalog(), loadOrders()])
  } catch (error) {
    message.value = errorMessage(error, 'Tu líder aún no te autorizó a vender de su inventario.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})

function openSale(product?: Product): void {
  saleErrors.value = {}
  saleSeed.value = product ?? null
  saleOpen.value = true
}

async function submitSale(payload: PlacePosOrderPayload): Promise<void> {
  saleErrors.value = {}
  saving.value = true
  try {
    const order = await placePartnerPosOrder(payload)
    saleOpen.value = false
    saleSeed.value = null
    await Promise.all([loadCatalog(), loadOrders()])
    const paid = order.status === 'paid'
    toast.success(
      paid
        ? `Venta a ${order.customer_name} registrada. Se descontó el inventario de ${leaderName.value}.`
        : `Venta a ${order.customer_name} queda pendiente de cobro.`,
      'Venta del inventario del líder',
    )
  } catch (error) {
    saleErrors.value = fieldErrors(error)
    toast.fromError(error, 'No se pudo registrar la venta')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div data-tour="partner-sales-welcome">
      <ModuleBanner
        icon="bag"
        eyebrow="Socio · ventas autorizadas"
        title="Inventario de tu líder"
        :body="`Con permiso de ${leaderName} puedes vender de su inventario personal. No ves costos ni editas productos: solo registras la venta y se descuenta su stock.`"
        :actions="[
          'Revisa existencias y precio de venta.',
          'Registra una venta directa (retiro o envío).',
          'Tus pedidos aparecen aquí y también en el equipo de tu líder.',
        ]"
      >
        <SoftButton
          variant="yellow"
          class="w-full sm:w-auto"
          :disabled="!sellableProducts.length"
          @click="openSale()"
        >
          Nueva venta
        </SoftButton>
      </ModuleBanner>
    </div>

    <p v-if="loading" class="mt-6 text-sm text-muted">Cargando inventario…</p>
    <p v-else-if="message" class="mt-6 text-sm text-red-600">{{ message }}</p>

    <template v-else>
      <div class="mt-6 grid gap-3 sm:grid-cols-3" data-tour="partner-sales-kpis">
        <SoftCard>
          <p class="text-sm text-muted">Ventas del mes</p>
          <p class="mt-2 font-display text-3xl font-bold">{{ money(totals.month, totals.currency) }}</p>
        </SoftCard>
        <SoftCard>
          <p class="text-sm text-muted">Ventas totales</p>
          <p class="mt-2 font-display text-3xl font-bold">{{ money(totals.total, totals.currency) }}</p>
        </SoftCard>
        <SoftCard>
          <p class="text-sm text-muted">Pedidos</p>
          <p class="mt-2 font-display text-3xl font-bold">{{ compactNumber(totals.orders_count) }}</p>
        </SoftCard>
      </div>

      <SoftCard :padded="false" class="mt-6 overflow-x-auto" data-tour="partner-sales-catalog">
        <div class="px-5 py-4">
          <h2 class="font-medium">Productos personales de {{ leaderName }}</h2>
          <p class="mt-1 text-sm text-muted">Sin costos de compra. El stock es el de su bodega.</p>
        </div>
        <p v-if="!products.length" class="px-5 pb-5 text-sm text-muted">Aún no hay productos personales activos.</p>
        <table v-else class="w-full min-w-[560px] text-left text-sm">
          <thead class="text-muted">
            <tr class="border-t border-line">
              <th class="px-5 py-3 font-medium"><TableHeading icon="bag" label="Producto" /></th>
              <th class="px-5 py-3 font-medium"><TableHeading icon="wallet" label="Precio" /></th>
              <th class="px-5 py-3 font-medium"><TableHeading icon="clipboard" label="Stock" /></th>
              <th class="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id" class="border-t border-line">
              <td class="px-5 py-3">
                <p class="font-medium">{{ product.name }}</p>
                <p class="text-xs text-muted">{{ product.fulfillment === 'dropship' ? 'Envío del proveedor' : 'Inventario' }}</p>
              </td>
              <td class="px-5 py-3">{{ money(product.price, product.currency) }}</td>
              <td class="px-5 py-3">{{ product.fulfillment === 'dropship' ? '—' : product.stock }}</td>
              <td class="px-5 py-3 text-right">
                <SoftButton
                  variant="outline"
                  :disabled="!sellableProducts.some((item) => item.id === product.id)"
                  @click="openSale(product)"
                >
                  Vender
                </SoftButton>
              </td>
            </tr>
          </tbody>
        </table>
      </SoftCard>

      <SoftCard :padded="false" class="mt-6 overflow-x-auto">
        <div class="px-5 py-4">
          <h2 class="font-medium">Tus ventas</h2>
        </div>
        <p v-if="!orders.length" class="px-5 pb-5 text-sm text-muted">Todavía no registras ventas de este inventario.</p>
        <table v-else class="w-full min-w-[480px] text-left text-sm">
          <thead class="text-muted">
            <tr class="border-t border-line">
              <th class="px-5 py-3 font-medium"><TableHeading icon="user" label="Cliente" /></th>
              <th class="px-5 py-3 font-medium"><TableHeading icon="wallet" label="Total" /></th>
              <th class="px-5 py-3 font-medium"><TableHeading icon="clipboard" label="Estado" /></th>
              <th class="px-5 py-3 font-medium"><TableHeading icon="calendar" label="Fecha" /></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id" class="border-t border-line">
              <td class="px-5 py-3">{{ order.customer_name }}</td>
              <td class="px-5 py-3">{{ money(order.total, order.currency) }}</td>
              <td class="px-5 py-3 capitalize">{{ order.status }}</td>
              <td class="px-5 py-3">{{ formatDate(order.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </SoftCard>
    </template>

    <DirectSaleModal
      :open="saleOpen"
      :products="sellableProducts"
      :seed="saleSeed"
      :shipping="shipping"
      :saving="saving"
      :errors="saleErrors"
      :store-slug="store?.slug"
      @close="saleOpen = false"
      @submit="submitSale"
    />
  </div>
</template>
