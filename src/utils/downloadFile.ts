export function filenameFromDisposition(header: string | null | undefined, fallback: string): string {
  if (!header) {
    return fallback
  }
  const utf = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf?.[1]) {
    try {
      return decodeURIComponent(utf[1])
    } catch {
      return fallback
    }
  }
  const simple = header.match(/filename="?([^";]+)"?/i)
  return simple?.[1] ?? fallback
}

export function saveBlob(blob: Blob, filename: string): void {
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.click()
  URL.revokeObjectURL(href)
}
