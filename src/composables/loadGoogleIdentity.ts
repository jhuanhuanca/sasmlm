let gisPromise: Promise<void> | null = null

export function loadGoogleIdentity(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  if (gisPromise) {
    return gisPromise
  }

  gisPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-gis="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleGis = 'true'
    script.onload = () => resolve()
    script.onerror = () => {
      gisPromise = null
      reject(new Error('No se pudo cargar Google'))
    }
    document.head.appendChild(script)
  })

  return gisPromise
}
