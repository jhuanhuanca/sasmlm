import { onBeforeUnmount, ref, type Ref } from 'vue'
import type { JewelryKind } from '@/data/jewelryTryOn'

export type BodyFitPose = {
  x: number
  y: number
  scale: number
  rotate: number
}

type Landmark = { x: number; y: number }

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
const HAND_MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

export function useBodyFit(
  video: Ref<HTMLVideoElement | null>,
  kind: Ref<JewelryKind>,
  mirrored: Ref<boolean>,
  enabled: Ref<boolean>,
) {
  const pose = ref<BodyFitPose | null>(null)
  const status = ref<'idle' | 'loading' | 'ready' | 'missing' | 'off'>('idle')
  const hint = ref('')

  let hands: { detectForVideo: (input: HTMLVideoElement, ts: number) => { landmarks?: Landmark[][] } } | null = null
  let face: { detectForVideo: (input: HTMLVideoElement, ts: number) => { faceLandmarks?: Landmark[][] } } | null = null
  let raf = 0
  let running = false

  async function load(): Promise<void> {
    if (hands || face || status.value === 'loading') {
      return
    }
    status.value = 'loading'
    hint.value = 'Cargando el ajuste a la mano…'

    try {
      const vision = await import(
        /* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm'
      )
      const fileset = await vision.FilesetResolver.forVisionTasks(WASM)
      hands = await vision.HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: HAND_MODEL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numHands: 1,
      })
      try {
        face = await vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
        })
      } catch {
        face = null
      }
      status.value = 'ready'
      hint.value = 'Muestra la mano o el rostro a la cámara.'
    } catch {
      status.value = 'missing'
      hint.value = 'No se pudo cargar el ajuste automático. Arrastra la pieza a mano.'
    }
  }

  function mapPoint(point: Landmark): { x: number; y: number } {
    return {
      x: (mirrored.value ? 1 - point.x : point.x) * 100,
      y: point.y * 100,
    }
  }

  function distance(a: Landmark, b: Landmark): number {
    const dx = a.x - b.x
    const dy = a.y - b.y

    return Math.hypot(dx, dy)
  }

  function fromHands(landmarks: Landmark[]): BodyFitPose | null {
    if (kind.value === 'aretes' || kind.value === 'collar') {
      return null
    }

    if (kind.value === 'pulsera') {
      const wrist = landmarks[0]
      const index = landmarks[5]
      if (!wrist || !index) {
        return null
      }
      const point = mapPoint(wrist)
      return {
        x: point.x,
        y: point.y,
        scale: Math.max(0.55, Math.min(2.4, distance(wrist, index) * 9)),
        rotate: (Math.atan2(index.y - wrist.y, index.x - wrist.x) * 180) / Math.PI,
      }
    }

    const pip = landmarks[14] ?? landmarks[6]
    const mcp = landmarks[13] ?? landmarks[5]
    if (!pip || !mcp) {
      return null
    }
    const point = mapPoint(pip)
    return {
      x: point.x,
      y: point.y,
      scale: Math.max(0.45, Math.min(2.2, distance(pip, mcp) * 14)),
      rotate: (Math.atan2(pip.y - mcp.y, pip.x - mcp.x) * 180) / Math.PI + 90,
    }
  }

  function fromFace(landmarks: Landmark[]): BodyFitPose | null {
    if (kind.value === 'aretes') {
      const left = landmarks[234]
      const right = landmarks[454]
      if (!left || !right) {
        return null
      }
      const a = mapPoint(left)
      const b = mapPoint(right)
      return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        scale: Math.max(0.6, Math.min(2.6, distance(left, right) * 4.2)),
        rotate: 0,
      }
    }

    if (kind.value === 'collar') {
      const chin = landmarks[152]
      if (!chin) {
        return null
      }
      const point = mapPoint(chin)
      return {
        x: point.x,
        y: Math.min(88, point.y + 8),
        scale: 1.15,
        rotate: 0,
      }
    }

    return null
  }

  function tick(): void {
    if (!running || !enabled.value) {
      return
    }
    const el = video.value
    if (!el || el.readyState < 2) {
      raf = requestAnimationFrame(tick)
      return
    }

    const ts = performance.now()
    let next: BodyFitPose | null = null

    try {
      if (hands && (kind.value === 'anillo' || kind.value === 'pulsera')) {
        const result = hands.detectForVideo(el, ts)
        const marks = result.landmarks?.[0]
        if (marks) {
          next = fromHands(marks)
        }
      }
      if (!next && face && (kind.value === 'aretes' || kind.value === 'collar')) {
        const result = face.detectForVideo(el, ts)
        const marks = result.faceLandmarks?.[0]
        if (marks) {
          next = fromFace(marks)
        }
      }
    } catch {
      next = null
    }

    if (next) {
      pose.value = next
    }

    raf = requestAnimationFrame(tick)
  }

  async function start(): Promise<void> {
    running = true
    await load()
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(tick)
  }

  function stop(): void {
    running = false
    cancelAnimationFrame(raf)
  }

  onBeforeUnmount(stop)

  return { pose, status, hint, start, stop }
}
