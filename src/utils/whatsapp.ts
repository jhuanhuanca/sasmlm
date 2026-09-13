export function digitsOnly(value: string | null | undefined): string {
  return String(value ?? '').replace(/\D/g, '')
}

export function looksLikePhoneLabel(value: string | null | undefined): boolean {
  const raw = String(value ?? '').trim()
  const digits = digitsOnly(raw)
  return digits.length >= 7 && digits.length <= 15 && digits === raw.replace(/[\s+()-]/g, '')
}

export function whatsappUrl(phone: string | null | undefined, text = ''): string {
  const digits = digitsOnly(phone)
  const query = text ? `?text=${encodeURIComponent(text)}` : ''

  if (!digits) {
    return `https://wa.me/${query}`
  }

  return `https://wa.me/${digits}${query}`
}
