import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '@/api/auth'
import { setStoredToken, getStoredToken } from '@/api/client'
import type { AuthUser, GoogleAuthBody, LoginBody, RegisterBody } from '@/types/auth'
import { unwrapData } from '@/utils/http'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(getStoredToken())
  const booted = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value && token.value))
  const roles = computed(() => user.value?.roles ?? [])
  const isLeader = computed(() => roles.value.includes('leader'))
  const isPartner = computed(() => roles.value.includes('partner'))
  const isAdmin = computed(() => roles.value.includes('admin'))
  const isPartnerOnly = computed(() => isPartner.value && !isLeader.value && !isAdmin.value)
  const canSellLeaderInventory = computed(() => Boolean(user.value?.can_sell_leader_inventory))
  const entitlements = computed(() => user.value?.billing?.entitlements ?? null)
  const hasPaidAccess = computed(() => {
    if (!isLeader.value || isAdmin.value) {
      return true
    }
    const paid = user.value?.billing?.has_paid_access
    return paid !== false
  })
  const primaryRole = computed(() => roles.value[0] ?? 'partner')

  function persistSession(nextUser: AuthUser, nextToken: string): void {
    user.value = unwrapData(nextUser)
    token.value = nextToken
    setStoredToken(nextToken)
  }

  function clearSession(): void {
    user.value = null
    token.value = null
    setStoredToken(null)
  }

  async function login(body: LoginBody): Promise<void> {
    const payload = await authApi.login(body)
    persistSession(payload.user, payload.token)
  }

  async function register(body: RegisterBody): Promise<void> {
    const payload = await authApi.register(body)
    persistSession(payload.user, payload.token)
  }

  async function loginWithGoogle(body: GoogleAuthBody): Promise<void> {
    const payload = await authApi.loginWithGoogle(body)
    persistSession(payload.user, payload.token)
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }

  async function hydrate(): Promise<void> {
    if (!token.value) {
      booted.value = true
      return
    }

    try {
      user.value = await authApi.fetchMe()
    } catch {
      clearSession()
    } finally {
      booted.value = true
    }
  }

  function setUser(nextUser: AuthUser): void {
    user.value = unwrapData(nextUser)
  }

  return {
    user,
    token,
    booted,
    isAuthenticated,
    roles,
    isLeader,
    isPartner,
    isPartnerOnly,
    canSellLeaderInventory,
    entitlements,
    hasPaidAccess,
    isAdmin,
    primaryRole,
    login,
    register,
    loginWithGoogle,
    logout,
    hydrate,
    setUser,
    clearSession,
  }
})
