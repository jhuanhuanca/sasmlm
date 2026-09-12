<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { whatsappUrl } from '@/utils/whatsapp'

const props = defineProps<{
  leader: string
  whatsapp: string
}>()

type Step = 1 | 2 | 3 | 4 | 'reject'

const step = ref<Step>(1)
const amount = ref<number | null>(null)
const periodDays = ref(22)
const dailyHours = ref<number | null>(null)
const hourlyValue = ref(0)
const remaining = ref(5 * 60)
const calcError = ref('')

let timerId: ReturnType<typeof setInterval> | null = null

const timerLabel = computed(() => {
  const minutes = String(Math.floor(remaining.value / 60)).padStart(2, '0')
  const seconds = String(remaining.value % 60).padStart(2, '0')

  return `${minutes}:${seconds}`
})

const waHref = computed(() =>
  whatsappUrl(
    props.whatsapp,
    `Hola ${props.leader}, hice el test: mi hora vale ${formatBs(hourlyValue.value)} y quiero intentarlo. Estoy dispuesto a invertir 5 horas por semana.`,
  ),
)

function formatBs(value: number): string {
  return `Bs ${value.toFixed(2)}`
}

function go(next: Step): void {
  calcError.value = ''
  step.value = next
}

function stopTimer(): void {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

function startTimer(): void {
  stopTimer()
  remaining.value = 5 * 60
  timerId = setInterval(() => {
    remaining.value = Math.max(0, remaining.value - 1)
    if (remaining.value === 0) {
      stopTimer()
    }
  }, 1000)
}

function runCalc(): void {
  const income = Number(amount.value || 0)
  const hours = Number(dailyHours.value || 0)
  const days = Number(periodDays.value || 0)

  if (income <= 0 || hours <= 0 || days <= 0) {
    calcError.value = 'Completa tu ingreso y las horas de trabajo al día.'
    return
  }

  hourlyValue.value = income / (days * hours)
  go(3)
}

function reset(): void {
  stopTimer()
  step.value = 1
  amount.value = null
  periodDays.value = 22
  dailyHours.value = null
  hourlyValue.value = 0
  remaining.value = 5 * 60
  calcError.value = ''
}

watch(step, (next) => {
  if (next === 4) {
    startTimer()
    return
  }

  stopTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="lp-test-card">
    <div v-if="step === 1" class="lp-quiz">
      <h3 class="font-display text-2xl font-bold md:text-3xl">¿Aceptas el reto?</h3>
      <p class="lp-copy">Descubre ahora cuánto vale realmente tu hora de trabajo actual.</p>
      <div class="lp-quiz-actions">
        <button type="button" class="lp-calc-btn" @click="go(2)">SÍ, ACEPTO EL RETO</button>
        <button type="button" class="lp-calc-btn is-no" @click="go('reject')">NO, NO ACEPTO EL RETO</button>
      </div>
    </div>

    <div v-else-if="step === 'reject'" class="lp-quiz">
      <h3 class="font-display text-2xl font-bold md:text-3xl lp-quiz-ok">¡ENTENDIDO!</h3>
      <p class="lp-copy">
        De acuerdo, inténtalo cuando gustes ya que será un gusto ayudarte a cambiar tu vida y la de tus seres queridos.
      </p>
      <div class="lp-quiz-actions">
        <button type="button" class="lp-calc-btn" @click="reset">VOLVER AL INICIO</button>
      </div>
    </div>

    <form v-else-if="step === 2" class="lp-quiz" @submit.prevent="runCalc">
      <h3 class="font-display text-2xl font-bold md:text-3xl">Tus Ingresos</h3>
      <label class="lp-field">
        <span>Ingreso total (Bs)</span>
        <input v-model.number="amount" type="number" min="1" step="0.01" placeholder="Ingreso total (Bs)" required />
      </label>
      <label class="lp-field">
        <span>Periodo</span>
        <select v-model.number="periodDays">
          <option :value="22">Mensual</option>
          <option :value="5">Semanal</option>
        </select>
      </label>
      <label class="lp-field">
        <span>Horas de trabajo al día</span>
        <input v-model.number="dailyHours" type="number" min="1" max="24" step="0.5" placeholder="Horas de trabajo al día" required />
      </label>
      <p v-if="calcError" class="lp-quiz-error">{{ calcError }}</p>
      <div class="lp-quiz-actions">
        <button type="submit" class="lp-calc-btn">CALCULAR MI VALOR</button>
      </div>
    </form>

    <div v-else-if="step === 3" class="lp-quiz">
      <h3 class="font-display text-2xl font-bold md:text-3xl lp-quiz-alert">¡GANAS MUY POCO!</h3>
      <p class="lp-copy">Tu hora de trabajo actualmente vale:</p>
      <span class="lp-price-alert">{{ formatBs(hourlyValue) }}</span>
      <p class="lp-copy">A este paso, estás regalando tu vida. ¿Quieres ganar Bs 100 por hora como yo?</p>
      <div class="lp-quiz-actions">
        <button type="button" class="lp-calc-btn" @click="go(4)">VER UNA SOLUCIÓN</button>
      </div>
    </div>

    <div v-else-if="step === 4" class="lp-quiz">
      <h3 class="font-display text-2xl font-bold md:text-3xl">¿Quieres ganar más?</h3>
      <p class="lp-copy">Nuestros guías ganan <b>más de Bs 100 por hora</b>.</p>
      <p class="lp-copy">
        ¿Te gustaría intentarlo invirtiendo solo <b>5 horas por semana</b> con nuestra ayuda?
      </p>
      <div class="lp-timer">
        <span>Esta oportunidad expira en:</span>
        <div class="lp-timer-display">{{ timerLabel }}</div>
      </div>
      <div class="lp-quiz-actions">
        <a :href="waHref" class="lp-calc-btn" target="_blank" rel="noreferrer">¡SÍ, QUIERO INTENTARLO!</a>
        <button type="button" class="lp-calc-btn is-no" @click="go('reject')">NO, ESTOY BIEN ASÍ</button>
      </div>
    </div>
  </div>
</template>
