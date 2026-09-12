export function digitsOnly(value: string | null | undefined): string {
  return String(value ?? '').replace(/\D/g, '')
}

export function whatsappUrl(phone: string | null | undefined, text = ''): string {
  const digits = digitsOnly(phone)
  const query = text ? `?text=${encodeURIComponent(text)}` : ''

  if (!digits) {
    return `https://wa.me/${query}`
  }

  return `https://wa.me/${digits}${query}`
}
