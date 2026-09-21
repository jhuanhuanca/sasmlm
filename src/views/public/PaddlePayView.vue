<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/ui/BrandLogo.vue'
import { api } from '@/api/client'
import { openPaddleTransaction } from '@/composables/openPaddleCheckout'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const status = ref('Abriendo el pago…')
const error = ref('')

function transactionId(): string {
  const fromRoute = route.query._ptxn
  if (typeof fromRoute === 'string' && fromRoute.startsWith('txn_')) {
    return fromRoute
  }
  const fromWindow = new URLSearchParams(window.location.search).get('_ptxn') ?? ''
  return fromWindow.startsWith('txn_') ? fromWindow : ''
}

onMounted(async () => {
  const txn = transactionId()
  if (!txn) {
    error.value = 'Falta la transacción de Paddle (_ptxn). Vuelve a elegir el plan en el panel.'
    return
  }

  try {
    let token = (import.meta.env.VITE_PADDLE_CLIENT_TOKEN || '').trim()
    let sandbox = String(import.meta.env.VITE_PADDLE_SANDBOX ?? 'false') === 'true'

    try {
      const overlay = await api<{ client_token?: string | null; sandbox?: boolean }>('/billing/overlay')
      if (overlay.client_token) {
        token = overlay.client_token.trim()
      }
      if (typeof overlay.sandbox === 'boolean') {
        sandbox = overlay.sandbox
      }
    } catch {
      // El token de Vite sirve si la API aún no publica /billing/overlay.
    }

    if (!token) {
      error.value =
        'Falta PADDLE_CLIENT_TOKEN (token de cliente live_ o test_, no la API key). Ponlo en el .env de la API y php artisan config:clear.'
      return
    }

    status.value = 'Cargando Paddle Checkout…'
    await openPaddleTransaction({
      token,
      sandbox,
      transactionId: txn,
      onCompleted: () => {
        void router.replace(auth.isAuthenticated ? { path: '/app', query: { billing: 'success' } } : { name: 'login' })
      },
    })
    status.value = 'Completa el pago en la ventana de Paddle.'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo abrir Paddle Checkout.'
  }
})
</script>

<template>
  <div class="flex min-h-svh flex-col items-center justify-center bg-[#fffdf9] px-4 py-10 text-center">
    <BrandLogo surface="light" height-class="h-10" />
    <h1 class="mt-8 font-display text-2xl font-bold text-[#1a093f]">Pago de suscripción</h1>
    <p v-if="!error" class="mt-3 max-w-md text-sm text-[#6f6681]">{{ status }}</p>
    <p v-else class="mt-3 max-w-md text-sm text-red-700">{{ error }}</p>
    <p class="mt-8 text-sm">
      <RouterLink class="font-semibold underline" to="/app/become-leader">Volver al plan</RouterLink>
    </p>
  </div>
</template>
