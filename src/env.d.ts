/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_WA_EXTENSION_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface GoogleIdentityButtonOptions {
  type?: string
  theme?: string
  size?: string
  text?: string
  shape?: string
  logo_alignment?: string
  locale?: string
  width?: number
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string
          callback: (response: { credential: string }) => void
        }) => void
        renderButton: (parent: HTMLElement, options: GoogleIdentityButtonOptions) => void
      }
    }
  }
}
