<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { fetchMe } from '@/api/auth'
import ClayTile from '@/components/ui/ClayTile.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import { useAuthStore } from '@/stores/auth'
import { firstName } from '@/utils/format'

const auth = useAuthStore()
const { user, canSellLeaderInventory } = storeToRefs(auth)

const leaderName = computed(() => user.value?.sponsor?.name || 'tu líder')
const landingTo = computed(() => {
  const slug = user.value?.sponsor?.landing_page?.slug
  return slug ? { name: 'public-landing' as const, params: { slug } } : null
})
const storeTo = computed(() => {
  const slug = user.value?.sponsor?.store?.slug
  if (!slug) {
    return null
  }

  return {
    name: 'public-store' as const,
    params: { slug },
    query: user.value?.id ? { ref: String(user.value.id) } : {},
  }
})

onMounted(() => {
  void fetchMe()
    .then((me) => auth.setUser(me))
    .catch(() => undefined)
})
</script>

<template>
  <div>
    <div data-tour="dash-welcome">
    <ModuleBanner
      icon="users"
      eyebrow="Socio"
      :title="`Hola, ${firstName(user?.name)}`"
      :body="`Trabajas en la red de ${leaderName}. Usas sus herramientas, su landing y su tienda. Cuando quieras equipo propio, te suscribes como líder.`"
      :actions="[
        'Abre Herramientas para asesorar a un cliente.',
        'Comparte la landing y la tienda de tu líder (con tu referido).',
        'Si tu líder te autoriza, vende de su inventario personal.',
        'Cuando estés listo, elige un plan en Volverse líder.',
      ]"
    />
    </div>

    <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <RouterLink v-if="canSellLeaderInventory" to="/app/ventas" class="group" data-tour="partner-sales">
        <SoftCard class="h-full transition group-hover:-translate-y-0.5">
          <ClayTile name="bag" tone="mint" />
          <h2 class="mt-4 text-lg font-semibold">Vender inventario del líder</h2>
          <p class="mt-2 text-sm text-muted">
            {{ leaderName }} te autorizó a vender de su inventario personal. El stock se descuenta de su bodega.
          </p>
          <p class="mt-4 text-sm font-medium">Abrir ventas →</p>
        </SoftCard>
      </RouterLink>

      <RouterLink to="/app/tools" class="group" data-tour="partner-tools">
        <SoftCard class="h-full transition group-hover:-translate-y-0.5">
          <ClayTile name="heart" tone="mint" />
          <h2 class="mt-4 text-lg font-semibold">Herramientas</h2>
          <p class="mt-2 text-sm text-muted">Bienestar, IMC, flyers, PDFs, videos y audios para asesorar.</p>
          <p class="mt-4 text-sm font-medium">Abrir →</p>
        </SoftCard>
      </RouterLink>

      <div class="grid gap-4 sm:col-span-2 sm:grid-cols-2" data-tour="partner-share">
        <RouterLink v-if="landingTo" :to="landingTo" class="group">
          <SoftCard class="h-full transition group-hover:-translate-y-0.5">
            <ClayTile name="zap" tone="sky" />
            <h2 class="mt-4 text-lg font-semibold">Landing del líder</h2>
            <p class="mt-2 text-sm text-muted">La página pública de {{ leaderName }} para captar clientes y socios.</p>
            <p class="mt-4 text-sm font-medium">Ver landing →</p>
          </SoftCard>
        </RouterLink>
        <SoftCard v-else class="h-full opacity-70">
          <ClayTile name="zap" tone="sky" />
          <h2 class="mt-4 text-lg font-semibold">Landing del líder</h2>
          <p class="mt-2 text-sm text-muted">Todavía no hay una landing publicada.</p>
        </SoftCard>

        <RouterLink v-if="storeTo" :to="storeTo" class="group">
          <SoftCard class="h-full transition group-hover:-translate-y-0.5">
            <ClayTile name="bag" tone="coral" />
            <h2 class="mt-4 text-lg font-semibold">Tienda del líder</h2>
            <p class="mt-2 text-sm text-muted">El e-commerce de {{ leaderName }} con el catálogo de la empresa.</p>
            <p class="mt-4 text-sm font-medium">Ver tienda →</p>
          </SoftCard>
        </RouterLink>
        <SoftCard v-else class="h-full opacity-70">
          <ClayTile name="bag" tone="coral" />
          <h2 class="mt-4 text-lg font-semibold">Tienda del líder</h2>
          <p class="mt-2 text-sm text-muted">Todavía no hay una tienda activa.</p>
        </SoftCard>
      </div>

      <RouterLink to="/app/become-leader" class="group" data-tour="partner-leader">
        <SoftCard class="h-full transition group-hover:-translate-y-0.5">
          <ClayTile name="star" tone="yellow" />
          <h2 class="mt-4 text-lg font-semibold">Volverse líder</h2>
          <p class="mt-2 text-sm text-muted">Suscríbete, arma tu propio equipo y activa tu landing y tienda.</p>
          <p class="mt-4 text-sm font-medium">Suscribirme →</p>
        </SoftCard>
      </RouterLink>
    </div>
  </div>
</template>
