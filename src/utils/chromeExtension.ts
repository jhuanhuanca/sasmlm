export type ExtensionProbe = 'installed' | 'missing' | 'blocked' | 'unknown'

type ChromeRuntime = {
  lastError?: { message?: string }
  sendMessage: (
    extensionId: string,
    message: unknown,
    callback?: (response: unknown) => void,
  ) => void
}

function chromeRuntime(): ChromeRuntime | null {
  const runtime = (window as Window & { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime
  return runtime?.sendMessage ? runtime : null
}

export function isChromiumBrowser(): boolean {
  return /Chrome|CriOS|Edg|EdgiOS/i.test(navigator.userAgent)
}

export function browserLabel(): string {
  const ua = navigator.userAgent
  if (/Edg/i.test(ua)) {
    return 'Microsoft Edge'
  }
  if (/Chrome|CriOS/i.test(ua)) {
    return 'Google Chrome'
  }
  return 'este navegador'
}

export function canProbeExtensions(): boolean {
  return chromeRuntime() !== null
}

export function probeChromeExtension(extensionId: string): Promise<ExtensionProbe> {
  const runtime = chromeRuntime()

  if (!runtime || !extensionId) {
    return Promise.resolve('unknown')
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve('missing'), 1500)

    try {
      runtime.sendMessage(extensionId, { type: 'rexmlm.ping', source: 'sasmlm' }, () => {
        window.clearTimeout(timer)
        const error = (runtime.lastError?.message ?? '').toLowerCase()

        if (!error) {
          resolve('installed')
          return
        }

        if (
          error.includes('not allowed') ||
          error.includes('externally_connectable') ||
          error.includes('access to messaging')
        ) {
          resolve('blocked')
          return
        }

        resolve('missing')
      })
    } catch {
      window.clearTimeout(timer)
      resolve('missing')
    }
  })
}

function pingViaPostMessage(): Promise<boolean> {
  return new Promise((resolve) => {
    const requestId = `rexmlm-${Date.now()}-${Math.random().toString(36).slice(2)}`

    function onMessage(event: MessageEvent) {
      if (event.source !== window) {
        return
      }
      const data = event.data
      if (data?.type === 'rexmlm.pong' && data.requestId === requestId) {
        window.removeEventListener('message', onMessage)
        window.clearTimeout(timer)
        resolve(true)
      }
    }

    const timer = window.setTimeout(() => {
      window.removeEventListener('message', onMessage)
      resolve(false)
    }, 800)

    window.addEventListener('message', onMessage)
    window.postMessage({ type: 'rexmlm.ping', requestId, source: 'sasmlm' }, '*')
  })
}

export async function probeRexmlmBridge(extensionId: string): Promise<ExtensionProbe> {
  if (document.documentElement.getAttribute('data-rexmlm-bridge') === '1') {
    return 'installed'
  }

  if (await pingViaPostMessage()) {
    return 'installed'
  }

  if (extensionId && chromeRuntime()) {
    const viaRuntime = await probeChromeExtension(extensionId)
    if (viaRuntime === 'installed' || viaRuntime === 'blocked') {
      return viaRuntime
    }
  }

  return isChromiumBrowser() ? 'missing' : 'unknown'
}
