<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { fetchRegistrationOptions } from '@/api/auth'
import AuthPasswordField from '@/components/auth/AuthPasswordField.vue'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftField from '@/components/ui/SoftField.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { errorMessage, fieldErrors } from '@/utils/http'
import { authFieldControlClass } from '@/utils/ui'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  email: '',
  password: '',
})
const errors = ref<Record<string, string[]>>({})
const message = ref('')
const loading = ref(false)
const googleClientId = ref('')
const toast = useToast()

onMounted(async () => {
  try {
    const options = await fetchRegistrationOptions()
    googleClientId.value = options.google_client_id ?? ''
  } catch {
    googleClientId.value = ''
  }
})

async function submit(): Promise<void> {
  loading.value = true
  message.value = ''
  errors.value = {}

  try {
    await auth.login(form)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/app'
    await router.replace(redirect)
  } catch (error) {
    errors.value = fieldErrors(error)
    message.value = errorMessage(error, 'No se pudo iniciar sesión')
    toast.fromError(error, 'No se pudo iniciar sesión')
  } finally {
    loading.value = false
  }
}

async function onGoogleCredential(idToken: string): Promise<void> {
  loading.value = true
  message.value = ''
  errors.value = {}

  try {
    await auth.loginWithGoogle({ id_token: idToken })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/app'
    await router.replace(redirect)
  } catch (error) {
    errors.value = fieldErrors(error)
    message.value = errorMessage(error, 'No se pudo entrar con Google. Si aún no tienes cuenta, regístrate.')
    toast.fromError(error, 'No se pudo entrar con Google')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout
    kicker="Inicio de sesión"
    title="Bienvenido de nuevo"
    subtitle="Ingresa con tu correo de líder para abrir red, tienda y comisiones."
  >
    <form class="space-y-5" @submit.prevent="submit">
      <p
        v-if="message"
        class="rounded-input border border-yellow/40 bg-yellow-soft/80 px-4 py-3 text-sm leading-5 text-ink"
        role="alert"
      >
        {{ message }}
      </p>
      <SoftField label="Correo electrónico" :error="errors.email?.[0]">
        <input
          v-model="form.email"
          :class="authFieldControlClass"
          type="email"
          autocomplete="email"
          placeholder="nombre@correo.com"
          required
        />
      </SoftField>
      <AuthPasswordField
        v-model="form.password"
        label="Contraseña"
        autocomplete="current-password"
        :error="errors.password?.[0]"
      />
      <SoftButton type="submit" variant="yellow" class="!h-12 !rounded-xl !text-[15px] !font-semibold" :disabled="loading" block>
        {{ loading ? 'Verificando acceso…' : 'Entrar a la plataforma' }}
      </SoftButton>
    </form>
    <GoogleSignInButton
      v-if="googleClientId"
      class="mt-5"
      :client-id="googleClientId"
      :disabled="loading"
      @credential="onGoogleCredential"
    />
    <p class="mt-8 border-t border-line pt-6 text-sm text-muted">
      ¿Aún no tienes cuenta?
      <RouterLink to="/register" class="font-semibold text-ink underline decoration-yellow decoration-2 underline-offset-4">
        Crear cuenta
      </RouterLink>
    </p>
    <p class="mt-3 text-center text-xs text-muted">
      <RouterLink to="/legal/terminos">Términos</RouterLink>
      ·
      <RouterLink to="/legal/privacidad">Privacidad</RouterLink>
      ·
      <RouterLink to="/legal/reembolsos">Reembolsos</RouterLink>
    </p>
  </AuthLayout>
</template>
