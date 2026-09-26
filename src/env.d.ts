/// <reference types="vite/client" />

declare module 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm' {
  type Landmark = { x: number; y: number }

  export const FilesetResolver: {
    forVisionTasks: (wasmPath: string) => Promise<unknown>
  }

  export const HandLandmarker: {
    createFromOptions: (
      fileset: unknown,
      options: Record<string, unknown>,
    ) => Promise<{ detectForVideo: (input: HTMLVideoElement, ts: number) => { landmarks?: Landmark[][] } }>
  }

  export const FaceLandmarker: {
    createFromOptions: (
      fileset: unknown,
      options: Record<string, unknown>,
    ) => Promise<{ detectForVideo: (input: HTMLVideoElement, ts: number) => { faceLandmarks?: Landmark[][] } }>
  }
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_WA_EXTENSION_ID?: string
  readonly VITE_PADDLE_CLIENT_TOKEN?: string
  readonly VITE_PADDLE_SANDBOX?: string
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
