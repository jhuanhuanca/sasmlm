<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import ShopGiftBadge from '@/components/shop/ShopGiftBadge.vue'
import { useShop } from '@/composables/useShop'
import { useShopCartStore } from '@/stores/shopCart'
import { hydrateDropshipping } from '@/data/shipping'
import { shopThemeVars } from '@/utils/brand'
import { money } from '@/utils/format'

const cart = useShopCartStore()
const { slug, store } = useShop()
const router = useRouter()

const shipping = computed(() => hydrateDropshipping(store.value?.dropshipping ?? store.value?.settings?.dropshipping))
const freeFrom = computed(() => (shipping.value.enabled ? shipping.value.free_shipping_from : null))
const remaining = computed(() => (freeFrom.value == null ? 0 : Math.max(0, freeFrom.value - cart.subtotal)))
const progress = computed(() =>
  freeFrom.value == null || freeFrom.value <= 0 ? 0 : Math.min(100, (cart.subtotal / freeFrom.value) * 100),
)
const themeVars = computed(() => shopThemeVars(store.value?.company, store.value?.identity?.palette))

function checkout(): void {
  cart.open = false
  void router.push({ name: 'public-checkout', params: { slug: slug.value } })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="cart.open" class="shop-cart-layer fixed inset-0 z-50" :style="themeVars">
      <button class="shop-cart-scrim" aria-label="Cerrar carrito" @click="cart.open = false" />
      <aside class="shop-cart-panel">
        <div class="max-h-[70svh] overflow-y-auto p-4">
          <div v-if="!cart.lines.length" class="py-10 text-center text-sm text-[var(--shop-muted)]">
            Tu carrito está vacío
          </div>
          <ul v-else class="space-y-4">
            <li v-for="line in cart.lines" :key="line.product.id" class="flex gap-3">
              <div class="relative h-16 w-16 shrink-0 overflow-hidden">
                <img :src="line.product.image" :alt="line.product.name" class="h-16 w-16 object-cover" />
                <ShopGiftBadge
                  v-if="line.product.incentive"
                  compact
                  :name="line.product.incentive.name"
                  :image="line.product.incentive.image"
                  :qty="line.product.incentive.qty"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-display text-sm font-semibold">{{ line.product.name }}</p>
                <p v-if="line.product.incentive" class="text-[11px] text-[var(--shop-muted)]">
                  Incluye {{ line.product.incentive.name }}
                </p>
                <p class="text-xs text-[var(--shop-muted)]">
                  {{ line.quantity }} × {{ money(line.product.price, line.product.currency) }}
                </p>
              </div>
              <button type="button" class="text-[var(--shop-muted)]" @click="cart.remove(line.product.id)">
                <AppIcon name="close" :size="14" />
              </button>
            </li>
          </ul>

          <div v-if="cart.lines.length" class="mt-5 border-t border-[var(--shop-line)] pt-4">
            <div class="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <strong>{{ money(cart.subtotal, cart.currency) }}</strong>
            </div>
            <template v-if="freeFrom != null">
              <p class="mt-3 text-xs text-[var(--shop-muted)]">
                {{ remaining > 0 ? `Te faltan ${money(remaining, cart.currency)} para envío gratis.` : 'Este pedido llega con envío gratis.' }}
              </p>
              <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--shop-line)]">
                <span class="block h-full bg-[var(--shop-gold)]" :style="{ width: `${progress}%` }" />
              </div>
            </template>
            <button
              type="button"
              class="mt-5 w-full bg-charcoal py-3 text-xs tracking-[0.16em] text-white uppercase"
              @click="checkout"
            >
              Ir a pagar
            </button>
            <p v-if="freeFrom != null" class="mt-3 text-center text-[11px] text-[var(--shop-muted)] italic">
              Envío gratis desde {{ money(freeFrom, cart.currency) }}
            </p>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
