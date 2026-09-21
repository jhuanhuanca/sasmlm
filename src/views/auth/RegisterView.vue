<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { fetchInvitation } from '@/api/invitations'
import { fetchRegistrationOptions } from '@/api/auth'
import AuthPasswordField from '@/components/auth/AuthPasswordField.vue'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftField from '@/components/ui/SoftField.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import type { CatalogCompanyOption, CountryOption } from '@/types/auth'
import { errorMessage, fieldErrors } from '@/utils/http'
import { authFieldControlClass } from '@/utils/ui'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const invitationToken = ref(typeof route.query.token === 'string' ? route.query.token : '')
const leaderName = ref('')
const isLeaderSignup = computed(() => !invitationToken.value)

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  country: '',
  catalog_company_id: 0,
  catalog_rank_id: 0,
})
const errors = ref<Record<string, string[]>>({})
const message = ref('')
const loading = ref(false)
const optionsLoading = ref(false)
const countries = ref<CountryOption[]>([])
const companies = ref<CatalogCompanyOption[]>([])
const acceptTerms = ref(false)
const toast = useToast()
const googleClientId = ref('')

const selectedCompany = computed(
  () => companies.value.find((company) => company.id === form.catalog_company_id) ?? null,
)
const ranks = computed(() => selectedCompany.value?.ranks ?? [])

onMounted(async () => {
  if (invitationToken.value) {
    try {
      const invitation = await fetchInvitation(invitationToken.value)
      form.email = invitation.email
      leaderName.value = invitation.leader?.name ?? ''
    } catch {
      message.value = 'La invitación no es válida o ya expiró.'
    }
  }

  optionsLoading.value = true
  try {
    const options = await fetchRegistrationOptions()
    countries.value = options.countries ?? []
    companies.value = options.companies ?? []
    googleClientId.value = options.google_client_id ?? ''
    if (isLeaderSignup.value && !companies.value.length) {
      message.value = 'Aún no hay empresas en el catálogo. Crea una en el panel admin y agrega rangos.'
    }
  } catch {
    if (isLeaderSignup.value) {
      message.value = 'No se pudieron cargar empresas y rangos. Revisa que el catálogo esté en marcha.'
    }
  } finally {
    optionsLoading.value = false
  }
})

watch(
  () => form.catalog_company_id,
  () => {
    form.catalog_rank_id = 0
  },
)

async function submit(): Promise<void> {
  if (!acceptTerms.value) {
    message.value = 'Debes aceptar los términos y las políticas para crear la cuenta.'
    return
  }

  loading.value = true
  message.value = ''
  errors.value = {}

  try {
    await auth.register({
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.password_confirmation,
      invitation_token: invitationToken.value || undefined,
      ...(isLeaderSignup.value
        ? {
            country: form.country,
            catalog_company_id: form.catalog_company_id,
            catalog_rank_id: form.catalog_rank_id,
          }
        : {}),
    })
    await router.replace('/app')
    toast.success('Te enviamos un correo de bienvenida.', 'Cuenta creada')
  } catch (error) {
    errors.value = fieldErrors(error)
    message.value = errorMessage(error, 'No se pudo crear la cuenta')
    toast.fromError(error, 'No se pudo crear la cuenta')
  } finally {
    loading.value = false
  }
}

const googleReady = computed(
  () =>
    Boolean(googleClientId.value) &&
    acceptTerms.value &&
    (Boolean(invitationToken.value) || Boolean(form.country && form.catalog_company_id && form.catalog_rank_id)),
)

async function onGoogleCredential(idToken: string): Promise<void> {
  if (!acceptTerms.value) {
    message.value = 'Debes aceptar los términos y las políticas para continuar con Google.'
    return
  }

  loading.value = true
  message.value = ''
  errors.value = {}

  try {
    await auth.loginWithGoogle({
      id_token: idToken,
      invitation_token: invitationToken.value || undefined,
      ...(isLeaderSignup.value
        ? {
            country: form.country,
            catalog_company_id: form.catalog_company_id,
            catalog_rank_id: form.catalog_rank_id,
          }
        : {}),
    })
    await router.replace('/app')
    toast.success('Te enviamos un correo de bienvenida.', 'Cuenta creada')
  } catch (error) {
    errors.value = fieldErrors(error)
    message.value = errorMessage(error, 'No se pudo continuar con Google')
    toast.fromError(error, 'No se pudo continuar con Google')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout
    wide
    with-tagline
    :kicker="invitationToken ? 'Invitación' : 'Alta de cuenta'"
    :title="invitationToken ? 'Únete al equipo' : 'Crea tu cuenta'"
    :subtitle="
      invitationToken
        ? `Te invita ${leaderName || 'un titular'}. Completa tus datos para entrar como colaborador.`
        : 'Registra tu perfil y el catálogo con el que operas para abrir el panel.'
    "
  >
    <form class="space-y-5" @submit.prevent="submit">
      <p
        v-if="message"
        class="rounded-input border border-yellow/40 bg-yellow-soft/80 px-4 py-3 text-sm leading-5 text-ink"
        role="alert"
      >
        {{ message }}
      </p>

      <section class="space-y-4">
        <h2 class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Datos de acceso</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <SoftField label="Nombre completo" :error="errors.name?.[0]" class="sm:col-span-2">
            <input
              v-model="form.name"
              :class="authFieldControlClass"
              autocomplete="name"
              placeholder="Tu nombre y apellido"
              required
            />
          </SoftField>
          <SoftField label="Correo electrónico" :error="errors.email?.[0]" class="sm:col-span-2">
            <input
              v-model="form.email"
              :class="authFieldControlClass"
              type="email"
              autocomplete="email"
              placeholder="nombre@correo.com"
              :readonly="Boolean(invitationToken)"
              required
            />
          </SoftField>
        </div>
      </section>

      <section v-if="isLeaderSignup" class="space-y-4 border-t border-line pt-5">
        <h2 class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Empresa y rango</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <SoftField label="País" :error="errors.country?.[0]">
            <select v-model="form.country" :class="authFieldControlClass" required :disabled="optionsLoading">
              <option value="" disabled>Selecciona tu país</option>
              <option v-for="country in countries" :key="country.code" :value="country.code">
                {{ country.name }}
              </option>
            </select>
          </SoftField>
          <SoftField label="Empresa" :error="errors.catalog_company_id?.[0]">
            <select
              v-model.number="form.catalog_company_id"
              :class="authFieldControlClass"
              required
              :disabled="optionsLoading || !companies.length"
            >
              <option :value="0" disabled>Selecciona la empresa</option>
              <option v-for="company in companies" :key="company.id" :value="company.id">
                {{ company.name }}
              </option>
            </select>
          </SoftField>
          <SoftField
            class="sm:col-span-2"
            label="Rango"
            :error="errors.catalog_rank_id?.[0]"
            :hint="
              selectedCompany && !ranks.length
                ? 'Esta empresa aún no tiene rangos. Agrégalos en el plan de compensación.'
                : 'Según el plan de compensación de esa empresa.'
            "
          >
            <select
              v-model.number="form.catalog_rank_id"
              :class="authFieldControlClass"
              required
              :disabled="!selectedCompany || !ranks.length"
            >
              <option :value="0" disabled>Selecciona tu rango</option>
              <option v-for="rank in ranks" :key="rank.id" :value="rank.id">
                {{ rank.name }}<template v-if="rank.plan_name"> · {{ rank.plan_name }}</template>
              </option>
            </select>
          </SoftField>
        </div>
      </section>

      <section class="space-y-4 border-t border-line pt-5">
        <h2 class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Contraseña</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <AuthPasswordField
            v-model="form.password"
            label="Contraseña"
            autocomplete="new-password"
            hint="Mínimo 8 caracteres."
            :error="errors.password?.[0]"
          />
          <AuthPasswordField
            v-model="form.password_confirmation"
            label="Confirmar contraseña"
            autocomplete="new-password"
            :error="errors.password_confirmation?.[0]"
          />
        </div>
      </section>

      <label class="flex items-start gap-3 text-sm leading-5 text-muted">
        <input v-model="acceptTerms" class="mt-1" type="checkbox" required />
        <span>
          Acepto los
          <RouterLink class="font-semibold text-ink underline" to="/legal/terminos" target="_blank">términos de servicio</RouterLink>,
          la
          <RouterLink class="font-semibold text-ink underline" to="/legal/privacidad" target="_blank">privacidad</RouterLink>,
          los
          <RouterLink class="font-semibold text-ink underline" to="/legal/reembolsos" target="_blank">reembolsos</RouterLink>
          y el
          <RouterLink class="font-semibold text-ink underline" to="/legal/uso-aceptable" target="_blank">uso aceptable</RouterLink>.
        </span>
      </label>

      <SoftButton
        type="submit"
        variant="yellow"
        class="!h-12 !rounded-xl !text-[15px] !font-semibold"
        :disabled="loading || !acceptTerms || (isLeaderSignup && (!form.catalog_company_id || !form.catalog_rank_id))"
        block
      >
        {{ loading ? 'Creando cuenta…' : invitationToken ? 'Aceptar invitación' : 'Crear cuenta' }}
      </SoftButton>
    </form>
    <GoogleSignInButton
      v-if="googleClientId"
      class="mt-5"
      :client-id="googleClientId"
      :disabled="loading || !googleReady"
      @credential="onGoogleCredential"
    />
    <p v-if="googleClientId && isLeaderSignup && !googleReady" class="mt-2 text-center text-xs text-muted">
      Elige país, empresa, rango y acepta las políticas para registrarte con Google.
    </p>
    <p class="mt-8 border-t border-line pt-6 text-sm text-muted">
      ¿Ya tienes cuenta?
      <RouterLink to="/login" class="font-semibold text-ink underline decoration-yellow decoration-2 underline-offset-4">
        Iniciar sesión
      </RouterLink>
    </p>
  </AuthLayout>
</template>
