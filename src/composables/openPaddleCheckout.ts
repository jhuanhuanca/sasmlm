type PaddleCheckoutEvent = {
  name?: string
}

type PaddleApi = {
  Environment: { set: (value: 'sandbox' | 'production') => void }
  Initialize: (options: {
    token: string
    eventCallback?: (event: PaddleCheckoutEvent) => void
  }) => void
  Checkout: {
    open: (options: { transactionId: string }) => void
  }
}

declare global {
  interface Window {
    Paddle?: PaddleApi
  }
}

let scriptPromise: Promise<PaddleApi> | null = null
let initializedToken: string | null = null

function loadScript(): Promise<PaddleApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Paddle solo funciona en el navegador.'))
  }

  if (window.Paddle) {
    return Promise.resolve(window.Paddle)
  }

  if (scriptPromise) {
    return scriptPromise
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-paddle="v2"]')
    if (existing) {
      existing.addEventListener('load', () => {
        window.Paddle ? resolve(window.Paddle) : reject(new Error('Paddle.js no inicializó.'))
      }, { once: true })
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Paddle.js')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.async = true
    script.dataset.paddle = 'v2'
    script.onload = () => {
      if (!window.Paddle) {
        scriptPromise = null
        reject(new Error('Paddle.js no inicializó.'))
        return
      }
      resolve(window.Paddle)
    }
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('No se pudo cargar https://cdn.paddle.com/paddle/v2/paddle.js'))
    }
    document.head.appendChild(script)
  })

  return scriptPromise
}

export async function openPaddleTransaction(options: {
  token: string
  sandbox: boolean
  transactionId: string
  onCompleted?: () => void
  onClosed?: () => void
}): Promise<void> {
  const paddle = await loadScript()

  if (initializedToken !== options.token) {
    paddle.Environment.set(options.sandbox ? 'sandbox' : 'production')
    paddle.Initialize({
      token: options.token,
      eventCallback: (event) => {
        if (event.name === 'checkout.completed') {
          options.onCompleted?.()
        }
        if (event.name === 'checkout.closed') {
          options.onClosed?.()
        }
      },
    })
    initializedToken = options.token
  }

  paddle.Checkout.open({ transactionId: options.transactionId })
}
