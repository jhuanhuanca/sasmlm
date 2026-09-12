<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import AppearanceSettings from '@/components/settings/AppearanceSettings.vue'
import ModuleBanner from '@/components/ui/ModuleBanner.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftCard from '@/components/ui/SoftCard.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { roleLabel } from '@/utils/format'

const auth = useAuthStore()
const { user, roles } = storeToRefs(auth)
const router = useRouter()
const toast = useToast()

function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(['es'], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

async function logout(): Promise<void> {
  await auth.logout()
  toast.info('Cerraste sesión en este dispositivo.', 'Sesión cerrada')
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="space-y-10">
    <div data-tour="profile-welcome">
    <ModuleBanner
      icon="gear"
      eyebrow="Cuenta"
      title="Ajustes"
      body="Tus datos de sesión, red y apariencia del panel. La paleta se guarda en este dispositivo, no en el servidor."
      :actions="[
        'Revisa nombre, correo, rol y empresa.',
        'Cambia claro/oscuro y la paleta si tu marca lo pide.',
        'Cierra sesión cuando uses un equipo compartido.',
      ]"
    />
    </div>

    <div class="grid gap-8 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <SoftCard v-if="user" class="space-y-4 text-sm" data-tour="profile-account">
        <div>
          <p class="text-muted">Nombre</p>
          <p class="mt-1 text-lg font-medium">{{ user.name }}</p>
        </div>
        <div>
          <p class="text-muted">Correo</p>
          <p class="mt-1">{{ user.email }}</p>
        </div>
        <div>
          <p class="text-muted">Rol</p>
          <p class="mt-1">{{ roles.map(roleLabel).join(', ') }}</p>
        </div>
        <div>
          <p class="text-muted">Red</p>
          <p class="mt-1">{{ user.network?.name ?? '—' }} · {{ user.network?.status ?? 'sin estado' }}</p>
        </div>
        <div v-if="user.catalog_company_name || user.country">
          <p class="text-muted">Empresa y rango</p>
          <p class="mt-1">
            {{ user.catalog_company_name ?? 'Sin empresa' }}
            <template v-if="user.catalog_rank_name"> · {{ user.catalog_rank_name }}</template>
          </p>
          <p v-if="user.country" class="mt-1 text-muted">País: {{ countryName(user.country) }}</p>
        </div>
        <SoftButton variant="outline" @click="logout">Cerrar sesión</SoftButton>
      </SoftCard>

      <div data-tour="profile-look">
        <AppearanceSettings />
      </div>
    </div>
  </div>
</template>
