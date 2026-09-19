import type {
  AuthPayload,
  AuthUser,
  GoogleAuthBody,
  LoginBody,
  RegisterBody,
  RegistrationOptions,
} from '@/types/auth'
import type { LaravelData } from '@/utils/http'
import { api } from '@/api/client'
import { unwrapData } from '@/utils/http'

export async function login(body: LoginBody): Promise<AuthPayload> {
  return api<AuthPayload>('/auth/login', { method: 'POST', body })
}

export async function fetchRegistrationOptions(): Promise<RegistrationOptions> {
  return api<RegistrationOptions>('/auth/registration-options')
}

export async function register(body: RegisterBody): Promise<AuthPayload> {
  return api<AuthPayload>('/auth/register', { method: 'POST', body })
}

export async function loginWithGoogle(body: GoogleAuthBody): Promise<AuthPayload> {
  return api<AuthPayload>('/auth/google', { method: 'POST', body })
}

export async function logout(): Promise<void> {
  await api('/auth/logout', { method: 'POST' })
}

export async function fetchMe(): Promise<AuthUser> {
  const payload = await api<AuthUser | LaravelData<AuthUser>>('/auth/me')
  return unwrapData(payload)
}

export async function updatePassword(body: {
  current_password?: string
  password: string
  password_confirmation: string
}): Promise<void> {
  await api('/auth/password', { method: 'PUT', body })
}
