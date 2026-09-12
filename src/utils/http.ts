export interface LaravelData<T> {
  data: T
}

export function unwrapData<T>(payload: T | LaravelData<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as LaravelData<T>).data
  }

  return payload as T
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function fieldErrors(error: unknown): Record<string, string[]> {
  if (!isRecord(error)) {
    return {}
  }

  const data = isRecord(error.data) ? error.data : error

  if (isRecord(data.errors)) {
    return data.errors as Record<string, string[]>
  }

  return {}
}

export function errorMessage(error: unknown, fallback = 'No se pudo completar la acción'): string {
  if (!isRecord(error)) {
    return fallback
  }

  const data = isRecord(error.data) ? error.data : error

  if (typeof data.message === 'string' && data.message.length > 0) {
    return data.message
  }

  const first = Object.values(fieldErrors(error))[0]?.[0]
  return first ?? fallback
}
