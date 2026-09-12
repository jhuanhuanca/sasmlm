<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import ShopGiftBadge from '@/components/shop/ShopGiftBadge.vue'
import { useShop } from '@/composables/useShop'
import { useShopCartStore } from '@/stores/shopCart'
import { money } from '@/utils/format'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const { catalog, slug } = useShop()
const cart = useShopCartStore()
const toast = useToast()
const qty = ref(1)

const product = computed(() => catalog.value.find((item) => item.slug === String(route.params.productSlug)))
const related = computed(() => catalog.value.filter((item) => item.slug !== product.value?.slug).slice(0, 3))

function add(): void {
  if (!product.value) {
    return
  }

  const error = cart.add(product.value, qty.value)
  if (error) {
    toast.error(error, 'Moneda del carrito')
    return
  }
  cart.open = true
}
</script>

<template>
  <div v-if="product">
    <div class="shop-crumb">
      <div class="shop-wrap flex flex-wrap items-center gap-2 py-2 text-sm">
        <AppIcon name="home" :size="14" />
        <span>»</span>
        <RouterLink :to="{ name: 'public-store', params: { slug } }">Productos</RouterLink>
        <span>»</span>
        <span>{{ product.name }}</span>
      </div>
    </div>

    <div class="shop-wrap grid gap-10 py-10 lg:grid-cols-2">
      <div class="relative aspect-square overflow-hidden bg-[var(--shop-card)]">
        <img :src="product.image" :alt="product.name" class="h-full w-full object-contain p-8" />
        <ShopGiftBadge
          v-if="product.incentive"
          :name="product.incentive.name"
          :image="product.incentive.image"
          :qty="product.incentive.qty"
        />
        <span class="absolute right-4 bottom-4 grid h-10 w-10 place-items-center bg-white/80 text-ink">
          <AppIcon name="expand" :size="16" />
        </span>
      </div>

      <div>
        <h1 class="font-display text-4xl font-bold md:text-6xl">{{ product.name }}</h1>
        <p class="mt-3 flex items-center gap-2 text-sm">
          <span>{{ product.rating }}</span>
          <span class="shop-stars">★★★★★</span>
          <span class="text-[var(--shop-muted)]">({{ product.ratingCount }} valoraciones)</span>
        </p>
        <p class="mt-4 text-3xl">{{ money(product.price, product.currency) }}</p>
        <p v-if="product.incentive" class="mt-3 text-sm font-medium text-ink">
          De regalo: {{ product.incentive.qty > 1 ? `${product.incentive.qty} × ` : '' }}{{ product.incentive.name }}
        </p>
        <p class="mt-4 max-w-xl text-[var(--shop-muted)]">{{ product.description }}</p>
        <div v-if="product.technicalSheet" class="mt-4 rounded-lg bg-[var(--shop-card)] p-4 text-sm">
          <p class="font-medium text-ink">Ficha técnica</p>
          <p class="mt-2 whitespace-pre-line text-[var(--shop-muted)]">{{ product.technicalSheet }}</p>
        </div>
        <p v-if="product.fulfillment === 'dropship'" class="mt-3 text-xs text-[var(--shop-muted)]">
          Envío directo del proveedor (dropshipping).
        </p>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <div class="flex items-center">
            <button type="button" class="grid h-11 w-11 place-items-center bg-[var(--shop-gold)]" @click="qty = Math.max(1, qty - 1)">
              <AppIcon name="minus" :size="14" />
            </button>
            <span class="grid h-11 min-w-12 place-items-center bg-charcoal text-white">{{ qty }}</span>
            <button type="button" class="grid h-11 w-11 place-items-center bg-[var(--shop-gold)]" @click="qty += 1">
              <AppIcon name="plus" :size="14" />
            </button>
          </div>
          <button type="button" class="inline-flex items-center gap-2 bg-charcoal px-6 py-3 text-sm text-white" @click="add">
            <AppIcon name="bag" :size="16" />
            Agregar al carrito
          </button>
          <button type="button" class="grid h-11 w-11 place-items-center bg-[var(--shop-gold)]">
            <AppIcon name="heart" :size="16" />
          </button>
        </div>

        <dl class="mt-6 space-y-2 text-sm">
          <div class="flex gap-2"><dt class="text-[var(--shop-muted)]">SKU:</dt><dd>{{ product.sku }}</dd></div>
          <div class="flex gap-2">
            <dt class="text-[var(--shop-muted)]">Estado:</dt>
            <dd>{{ product.stock }} en inventario</dd>
          </div>
          <div class="flex gap-2"><dt class="text-[var(--shop-muted)]">Categoría:</dt><dd>{{ product.category }}</dd></div>
          <div class="flex gap-2"><dt class="text-[var(--shop-muted)]">Etiquetas:</dt><dd>{{ product.tags.join(', ') }}</dd></div>
        </dl>

        <ul class="mt-6 space-y-2 text-sm text-[var(--shop-muted)]">
          <li>El envío se calcula en el pago según el país y la zona.</li>
          <li>El líder confirma el pedido cuando recibe el pago.</li>
        </ul>
      </div>
    </div>

    <div class="shop-wrap pb-16">
      <h2 class="font-display text-2xl">Otros productos</h2>
      <div class="mt-6 grid gap-6 sm:grid-cols-3">
        <RouterLink
          v-for="item in related"
          :key="item.id"
          :to="{ name: 'public-product', params: { slug, productSlug: item.slug } }"
        >
          <div class="relative aspect-square overflow-hidden bg-[var(--shop-card)]">
            <img :src="item.image" :alt="item.name" class="h-full w-full object-cover" />
            <ShopGiftBadge
              v-if="item.incentive"
              :name="item.incentive.name"
              :image="item.incentive.image"
              :qty="item.incentive.qty"
            />
          </div>
          <p class="font-display mt-3 text-xl">{{ item.name }}</p>
          <p>{{ money(item.price, item.currency) }}</p>
        </RouterLink>
      </div>
    </div>
  </div>
  <p v-else class="shop-wrap py-16">Producto no encontrado.</p>
</template>
