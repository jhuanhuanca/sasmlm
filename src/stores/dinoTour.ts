import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  dinoTours,
  type DinoTourId,
  type DinoTourStep,
  type TourTone,
} from '@/data/dinoTours'

const STORAGE_PREFIX = 'rexmlm.dino-tour.'

function seenKey(id: DinoTourId): string {
  return `${STORAGE_PREFIX}${id}`
}

export const useDinoTourStore = defineStore('dinoTour', () => {
  const active = ref(false)
  const tourId = ref<DinoTourId | null>(null)
  const index = ref(0)

  const definition = computed(() => (tourId.value ? dinoTours[tourId.value] : null))
  const steps = computed((): DinoTourStep[] => definition.value?.steps ?? [])
  const tone = computed((): TourTone => definition.value?.tone ?? 'green')
  const launcher = computed(() => definition.value?.launcher ?? '¿Te explico?')
  const current = computed((): DinoTourStep | null => steps.value[index.value] ?? null)
  const total = computed(() => steps.value.length)
  const isFirst = computed(() => index.value <= 0)
  const isLast = computed(() => index.value >= steps.value.length - 1)

  function hasSeen(id: DinoTourId): boolean {
    return localStorage.getItem(seenKey(id)) === '1'
  }

  function markSeen(id: DinoTourId): void {
    localStorage.setItem(seenKey(id), '1')
  }

  function start(id: DinoTourId): void {
    tourId.value = id
    index.value = 0
    active.value = true
  }

  function maybeStart(id: DinoTourId): void {
    if (active.value || hasSeen(id)) {
      return
    }
    start(id)
  }

  function replay(id: DinoTourId): void {
    start(id)
  }

  function stop(): void {
    if (tourId.value) {
      markSeen(tourId.value)
    }
    active.value = false
    tourId.value = null
    index.value = 0
  }

  function next(): void {
    if (isLast.value) {
      stop()
      return
    }
    index.value += 1
  }

  function prev(): void {
    if (isFirst.value) {
      return
    }
    index.value -= 1
  }

  return {
    active,
    tourId,
    index,
    steps,
    tone,
    launcher,
    current,
    total,
    isFirst,
    isLast,
    hasSeen,
    start,
    maybeStart,
    replay,
    stop,
    next,
    prev,
  }
})
