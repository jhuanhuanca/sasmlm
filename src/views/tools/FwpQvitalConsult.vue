<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftField from '@/components/ui/SoftField.vue'
import WellnessChoiceGroup from '@/components/tools/WellnessChoiceGroup.vue'
import {
  buildFwpConsultReport,
  emptyFwpConsultForm,
  formatFwpConsultReport,
  fwpConditions,
  fwpFamilyConditions,
  fwpHealthRatings,
  fwpMentalConditions,
  fwpMentalSymptoms,
  fwpSymptoms,
  type FwpConsultReport,
} from '@/data/wellnessFwpConsult'
import { fieldControlClass } from '@/utils/ui'
import '@/styles/qvital.css'

const TOTAL_STEPS = 11
const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const form = reactive(emptyFwpConsultForm())
const currentStep = ref(1)
const phase = ref<'form' | 'loading' | 'results'>('form')
const report = ref<FwpConsultReport | null>(null)
const copied = ref(false)
const syncError = ref(false)
const loadText = ref('Procesando respuestas en el núcleo del analizador...')
const syncPct = ref(0)
const syncState = ref<'idle' | 'activating' | 'done'>('idle')

let syncTimer: ReturnType<typeof setInterval> | null = null
let loadTimer: ReturnType<typeof setTimeout> | null = null
let loadSteps: ReturnType<typeof setInterval> | null = null

const dashOffset = computed(() => CIRCUMFERENCE * (1 - syncPct.value / 100))

const stepTitles: Record<number, { icon: 'user' | 'heart' | 'clipboard' | 'file' | 'users' | 'zap' | 'monitor' | 'bag' | 'search' | 'chart' | 'gear'; title: string }> = {
  1: { icon: 'user', title: 'Información personal' },
  2: { icon: 'heart', title: 'Estado de salud actual' },
  3: { icon: 'clipboard', title: 'Condiciones / dolencias' },
  4: { icon: 'file', title: 'Historial médico personal' },
  5: { icon: 'users', title: 'Historial familiar' },
  6: { icon: 'zap', title: 'Estilo de vida y hábitos' },
  7: { icon: 'monitor', title: 'Salud mental y emocional' },
  8: { icon: 'bag', title: 'Nutrición y dieta' },
  9: { icon: 'search', title: 'Síntomas específicos' },
  10: { icon: 'chart', title: 'Actividad física y deportiva' },
  11: { icon: 'gear', title: 'Sincronización del sistema' },
}

function railClass(step: number): string {
  if (step < currentStep.value) return 'qv-rail-wrap is-done'
  if (step === currentStep.value) return 'qv-rail-wrap is-current'
  return 'qv-rail-wrap'
}

function currentStepIsValid(): boolean {
  if (currentStep.value !== 1) return true
  return Boolean(form.age && form.gender && form.height && form.weight)
}

function showStep(n: number): void {
  currentStep.value = n
  document.querySelector('.qv-screen')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function next(): void {
  if (!currentStepIsValid()) return
  if (currentStep.value < TOTAL_STEPS) showStep(currentStep.value + 1)
}

function prev(): void {
  if (currentStep.value > 1) showStep(currentStep.value - 1)
}

function clearSyncTimer(): void {
  if (syncTimer) {
    clearInterval(syncTimer)
    syncTimer = null
  }
}

function startSync(event: PointerEvent): void {
  if (syncState.value === 'done') return
  event.preventDefault()
  syncState.value = 'activating'
  const startTime = Date.now()
  clearSyncTimer()
  syncTimer = setInterval(() => {
    const elapsed = Date.now() - startTime
    const pct = Math.min(100, Math.round((elapsed / 15000) * 100))
    syncPct.value = pct
    if (elapsed >= 15000) {
      clearSyncTimer()
      syncState.value = 'done'
      syncPct.value = 100
      form.scan_done = true
      syncError.value = false
    }
  }, 80)
}

function cancelSync(): void {
  if (syncState.value === 'done') return
  clearSyncTimer()
  syncState.value = 'idle'
  syncPct.value = 0
}

function clearLoadTimers(): void {
  if (loadTimer) clearTimeout(loadTimer)
  if (loadSteps) clearInterval(loadSteps)
  loadTimer = null
  loadSteps = null
}

function submit(): void {
  if (!form.scan_done) {
    syncError.value = true
    showStep(11)
    return
  }
  phase.value = 'loading'
  loadText.value = 'Procesando respuestas en el núcleo del analizador...'
  const texts = [
    'Correlacionando respuestas con evidencia pública (Harvard, Mayo Clinic, Johns Hopkins)...',
    'Calculando índices de bienestar y patrones reportados...',
    'Comparando hallazgos con la base de fórmulas FWP...',
    'Ensamblando informe personalizado...',
  ]
  let step = 0
  loadSteps = setInterval(() => {
    if (step < texts.length) {
      loadText.value = texts[step]
      step += 1
    }
  }, 750)
  loadTimer = setTimeout(() => {
    clearLoadTimers()
    report.value = buildFwpConsultReport(form)
    phase.value = 'results'
  }, 2400)
}

async function copySummary(): Promise<void> {
  if (!report.value) return
  await navigator.clipboard.writeText(formatFwpConsultReport(form, report.value))
  copied.value = true
}

function hideBrokenImage(event: Event): void {
  const image = event.target
  if (image instanceof HTMLImageElement) image.style.display = 'none'
}

function reset(): void {
  clearSyncTimer()
  clearLoadTimers()
  Object.assign(form, emptyFwpConsultForm())
  report.value = null
  phase.value = 'form'
  copied.value = false
  syncError.value = false
  syncState.value = 'idle'
  syncPct.value = 0
  currentStep.value = 1
}

onUnmounted(() => {
  clearSyncTimer()
  clearLoadTimers()
})
</script>

<template>
  <div class="qv">
    <div class="qv-device">
      <div class="qv-topbar">
        <div class="qv-brand">
          <div class="qv-mark" />
          <div>
            <h1>Q-VITAL · Analizador digital de corroboración y recomendaciones para su bienestar</h1>
            <span>MODELO QNX-7 · SISTEMA DE BIENESTAR FWP</span>
          </div>
        </div>
        <div class="qv-status">
          <span class="qv-led" /><span class="qv-led" /><span class="qv-led" />
          EN LÍNEA
        </div>
      </div>

      <div class="qv-screen">
        <p class="qv-lead">
          Este sistema procesa sus respuestas, hábitos e historial para generar un informe de bienestar personalizado.
          Complete cada panel con honestidad; toda la información es confidencial. No sustituye una consulta médica.
        </p>

        <template v-if="phase === 'loading'">
          <div class="qv-loading">
            <span class="qv-spinner" />
            <p>{{ loadText }}</p>
          </div>
        </template>

        <template v-else-if="phase === 'results' && report">
          <div class="qv-intro">
            <h2>Resultados de tu evaluación</h2>
            <p>
              Este informe integra tus respuestas con evidencia pública de Harvard Medical School, Mayo Clinic, Johns Hopkins
              y revisiones relacionadas. Las recomendaciones se basan en los componentes de los suplementos FWP.
            </p>
            <p>
              <strong>Importante:</strong> Estos son suplementos alimenticios, no medicamentos. No tratan ni curan enfermedades.
              Consulta siempre a un profesional de la salud.
            </p>
          </div>

          <div class="qv-findings">
            <p class="qv-findings-title">
              <AppIcon name="file" :size="18" />
              Resumen de hallazgos
            </p>
            <p class="mt-2 text-sm">
              IMC estimado: <b>{{ report.bmi }}</b>
              <span v-if="report.bmiLabel !== '—'"> · {{ report.bmiLabel }}</span>
            </p>
            <ul>
              <li v-for="item in report.findings" :key="item">{{ item }}</li>
            </ul>
          </div>

          <p v-if="report.products.length === 0" class="qv-empty">
            No se identificaron necesidades específicas que requieran recomendaciones de suplementos FWP en este momento.
          </p>

          <article v-for="product in report.products" :key="product.key" class="qv-product">
            <header>Recomendación: {{ product.name }}</header>
            <div class="qv-product-body">
              <img :src="product.image" :alt="product.name" @error="hideBrokenImage" />
              <div>
                <div class="qv-evidence">
                  <p>Justificación médica / científica</p>
                  {{ product.evidence }}
                </div>
                <div class="qv-solution">
                  <p>Solución FWP</p>
                  {{ product.solution }}
                </div>
              </div>
            </div>
          </article>

          <div class="qv-menu">
            <header>{{ report.menu.title }}</header>
            <div class="qv-menu-body">
              <section v-for="day in report.menu.days" :key="day.day">
                <h3>{{ day.day }}</h3>
                <div v-for="meal in day.meals" :key="`${day.day}-${meal.type}`" class="qv-meal">
                  <strong>{{ meal.type }}:</strong> {{ meal.desc }}
                  <span>{{ meal.nutrition }}</span>
                </div>
              </section>
            </div>
          </div>

          <div class="qv-advice">
            <header>Consejos adicionales para tu salud</header>
            <div class="qv-advice-body">
              <section v-for="item in report.advice" :key="item.title">
                <h3>{{ item.title }}</h3>
                <p>{{ item.body }}</p>
              </section>
            </div>
          </div>

          <p class="qv-disclaimer">
            Esta información se genera automáticamente a partir de tus respuestas y referencias bibliográficas públicas.
            No sustituye el consejo de un médico. Los suplementos FWP no son medicamentos.
          </p>
          <div class="mt-5 flex flex-wrap justify-center gap-2">
            <SoftButton variant="yellow" @click="copySummary">{{ copied ? 'Copiado' : 'Copiar informe' }}</SoftButton>
            <SoftButton variant="outline" @click="reset">Nuevo análisis</SoftButton>
          </div>
        </template>

        <form v-else novalidate @submit.prevent="submit">
          <div class="qv-rail">
            <div v-for="n in TOTAL_STEPS" :key="n" :class="railClass(n)">
              <div class="qv-dot">{{ n }}</div>
              <div v-if="n < TOTAL_STEPS" class="qv-line" />
            </div>
          </div>

          <h2 class="qv-h2">
            <AppIcon :name="stepTitles[currentStep].icon" :size="20" />
            {{ stepTitles[currentStep].title }}
          </h2>

          <div v-if="currentStep === 1" class="grid gap-4 sm:grid-cols-2">
            <SoftField label="Edad">
              <input v-model.number="form.age" :class="fieldControlClass" type="number" min="15" required />
            </SoftField>
            <SoftField label="Género">
              <select v-model="form.gender" :class="fieldControlClass" required>
                <option value="">Seleccione</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
                <option value="prefiero_no_decir">Prefiero no decir</option>
              </select>
            </SoftField>
            <SoftField label="Altura (cm)">
              <input v-model.number="form.height" :class="fieldControlClass" type="number" required />
            </SoftField>
            <SoftField label="Peso (kg)">
              <input v-model.number="form.weight" :class="fieldControlClass" type="number" required />
            </SoftField>
          </div>

          <div v-if="currentStep === 2" class="space-y-4">
            <SoftField label="En general, ¿cómo calificarías tu salud?">
              <WellnessChoiceGroup v-model="form.health_rating" type="radio" name="health_rating" :options="fwpHealthRatings" />
            </SoftField>
            <SoftField label="Síntomas actuales (describe con detalle)">
              <textarea v-model="form.current_symptoms" :class="fieldControlClass" rows="3" />
            </SoftField>
          </div>

          <div v-if="currentStep === 3" class="space-y-4">
            <WellnessChoiceGroup v-model="form.conditions" type="checkbox" name="fwp_conditions" :options="fwpConditions" />
            <SoftField label="Detalles adicionales">
              <textarea v-model="form.conditions_details" :class="fieldControlClass" rows="2" placeholder="Detalles adicionales sobre sus condiciones..." />
            </SoftField>
          </div>

          <div v-if="currentStep === 4" class="space-y-4">
            <SoftField label="¿Qué medicamentos o suplementos tomas actualmente?">
              <textarea v-model="form.medications" :class="fieldControlClass" rows="3" />
            </SoftField>
            <SoftField label="¿Tienes alergias a alimentos, medicamentos u otras sustancias?">
              <textarea v-model="form.allergies" :class="fieldControlClass" rows="2" />
            </SoftField>
            <SoftField label="¿Has tenido cirugías u hospitalizaciones en el pasado?">
              <WellnessChoiceGroup
                v-model="form.surgery"
                type="radio"
                name="surgery"
                :options="[
                  { value: 'yes', label: 'Sí', icon: 'check' },
                  { value: 'no', label: 'No', icon: 'close' },
                ]"
              />
            </SoftField>
            <SoftField v-if="form.surgery === 'yes'" label="Detalle">
              <textarea v-model="form.surgery_details" :class="fieldControlClass" rows="2" />
            </SoftField>
          </div>

          <div v-if="currentStep === 5" class="space-y-4">
            <p class="text-sm">¿Hay antecedentes de las siguientes condiciones en tu familia directa?</p>
            <WellnessChoiceGroup v-model="form.family_conditions" type="checkbox" name="fwp_family" :options="fwpFamilyConditions" />
            <SoftField label="Detalles">
              <textarea v-model="form.family_details" :class="fieldControlClass" rows="2" placeholder="Edad de diagnóstico, parentesco..." />
            </SoftField>
          </div>

          <div v-if="currentStep === 6" class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <SoftField label="¿Fumas o has fumado?">
                <select v-model="form.smoking" :class="fieldControlClass">
                  <option value="">Selecciona</option>
                  <option value="nunca">Nunca</option>
                  <option value="pasado">En el pasado</option>
                  <option value="actual">Actualmente</option>
                </select>
              </SoftField>
              <SoftField label="¿Consumes alcohol?">
                <select v-model="form.alcohol" :class="fieldControlClass">
                  <option value="">Selecciona</option>
                  <option value="nunca">Nunca</option>
                  <option value="ocasional">Ocasionalmente</option>
                  <option value="semanal">Semanalmente</option>
                  <option value="diario">Diariamente</option>
                </select>
              </SoftField>
              <SoftField label="Horas de sueño promedio">
                <input v-model.number="form.sleep" :class="fieldControlClass" type="number" min="3" max="12" placeholder="Ej: 6" />
              </SoftField>
              <SoftField label="Ejercicio semanal">
                <select v-model="form.exercise" :class="fieldControlClass">
                  <option value="nunca">Nunca</option>
                  <option value="1-2">1-2 veces</option>
                  <option value="3-5">3-5 veces</option>
                  <option value="diario">Diario</option>
                </select>
              </SoftField>
            </div>
            <SoftField label="Nivel de estrés diario">
              <WellnessChoiceGroup
                v-model="form.stress"
                type="radio"
                name="stress"
                :options="[
                  { value: 'bajo', label: 'Bajo', icon: 'check' },
                  { value: 'medio', label: 'Medio', icon: 'bell' },
                  { value: 'alto', label: 'Alto', icon: 'zap' },
                ]"
              />
            </SoftField>
            <SoftField label="¿Tienes interés en suplementos?">
              <WellnessChoiceGroup
                v-model="form.supplements_interest"
                type="radio"
                name="supplements_interest"
                :options="[
                  { value: 'yes', label: 'Sí', icon: 'check' },
                  { value: 'no', label: 'No', icon: 'close' },
                ]"
              />
            </SoftField>
          </div>

          <div v-if="currentStep === 7" class="space-y-4">
            <SoftField label="En general, ¿cómo calificarías tu salud mental?">
              <WellnessChoiceGroup
                v-model="form.mental_health_rating"
                type="radio"
                name="mental_health_rating"
                :options="[
                  { value: 'excelente', label: 'Excelente', icon: 'star' },
                  { value: 'buena', label: 'Buena', icon: 'heart' },
                  { value: 'regular', label: 'Regular', icon: 'bell' },
                  { value: 'mala', label: 'Mala', icon: 'alarm' },
                ]"
              />
            </SoftField>
            <SoftField label="¿Has sido diagnosticado con alguna de las siguientes condiciones?">
              <WellnessChoiceGroup v-model="form.mental_conditions" type="checkbox" name="mental_conditions" :options="fwpMentalConditions" />
            </SoftField>
            <SoftField label="¿Has experimentado alguna de las condiciones siguientes en las últimas semanas?">
              <WellnessChoiceGroup v-model="form.mental_symptoms" type="checkbox" name="mental_symptoms" :options="fwpMentalSymptoms" />
            </SoftField>
            <SoftField label="Detalles">
              <textarea v-model="form.mental_details" :class="fieldControlClass" rows="2" />
            </SoftField>
          </div>

          <div v-if="currentStep === 8" class="space-y-4">
            <SoftField label="¿Cuántas comidas consumes al día?">
              <select v-model="form.meals_per_day" :class="fieldControlClass">
                <option value="">Selecciona</option>
                <option value="1-2">1-2</option>
                <option value="3">3</option>
                <option value="4+">4 o más</option>
              </select>
            </SoftField>
            <SoftField label="¿Sigues alguna dieta específica?">
              <select v-model="form.diet_type" :class="fieldControlClass">
                <option value="">Selecciona</option>
                <option value="ninguna">Ninguna</option>
                <option value="vegetariana">Vegetariana</option>
                <option value="vegana">Vegana</option>
                <option value="baja_en_carbo">Baja en carbohidratos</option>
                <option value="baja_en_fibra">Baja en fibra / pocas verduras</option>
                <option value="alta_en_procesados">Alta en procesados</option>
                <option value="otro">Otra</option>
              </select>
            </SoftField>
            <SoftField label="Alimentación típica">
              <textarea v-model="form.diet_details" :class="fieldControlClass" rows="2" placeholder="Describe tu alimentación típica en un día..." />
            </SoftField>
          </div>

          <div v-if="currentStep === 9" class="space-y-4">
            <p class="text-sm">¿Has experimentado alguna de las siguientes condiciones en las últimas semanas?</p>
            <WellnessChoiceGroup v-model="form.symptoms" type="checkbox" name="fwp_symptoms" :options="fwpSymptoms" />
            <SoftField label="Detalles">
              <textarea v-model="form.symptoms_details" :class="fieldControlClass" rows="2" />
            </SoftField>
          </div>

          <div v-if="currentStep === 10" class="space-y-4">
            <SoftField label="¿Eres deportista o realizas actividad física intensa?">
              <WellnessChoiceGroup
                v-model="form.athlete"
                type="radio"
                name="athlete"
                :options="[
                  { value: 'yes', label: 'Sí', icon: 'zap' },
                  { value: 'no', label: 'No', icon: 'pause' },
                ]"
              />
            </SoftField>
            <SoftField label="Tipo de actividad">
              <select v-model="form.sport_type" :class="fieldControlClass">
                <option value="">Selecciona</option>
                <option value="ninguno">Ninguno</option>
                <option value="correr">Correr / cardio</option>
                <option value="gimnasio">Gimnasio / pesas</option>
                <option value="equipo">Deportes de equipo</option>
                <option value="otro">Otro</option>
              </select>
            </SoftField>
            <SoftField label="Frecuencia de entrenamiento">
              <select v-model="form.training_frequency" :class="fieldControlClass">
                <option value="">Selecciona</option>
                <option value="ocasional">Ocasional</option>
                <option value="regular">Regular (3-5 días/semana)</option>
                <option value="intensivo">Intensivo (diario)</option>
              </select>
            </SoftField>
            <SoftField label="Necesidades de rendimiento">
              <textarea v-model="form.sport_needs" :class="fieldControlClass" rows="2" placeholder="¿Necesita apoyo nutricional para su rendimiento?" />
            </SoftField>
          </div>

          <div v-if="currentStep === 11" class="qv-sync">
            <p>
              Antes de procesar tu informe, activa el núcleo del analizador. Esto no lee datos biométricos: es la calibración
              del propio sistema antes de correlacionar tus respuestas con la base de recomendaciones FWP.
            </p>
            <div
              class="qv-ring"
              :class="{ 'is-activating': syncState === 'activating', 'is-done': syncState === 'done' }"
              @pointerdown="startSync"
              @pointerup="cancelSync"
              @pointerleave="cancelSync"
              @pointercancel="cancelSync"
              @contextmenu.prevent
            >
              <svg viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="qvSyncGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#00b7ff" />
                    <stop offset="100%" stop-color="#0072ce" />
                  </linearGradient>
                </defs>
                <circle class="qv-track" cx="100" cy="100" r="88" />
                <circle
                  class="qv-arc"
                  cx="100"
                  cy="100"
                  r="88"
                  :stroke-dasharray="`${CIRCUMFERENCE} ${CIRCUMFERENCE}`"
                  :stroke-dashoffset="dashOffset"
                />
              </svg>
              <div class="qv-core">
                <strong>{{ syncPct }}%</strong>
                <span>NÚCLEO</span>
              </div>
            </div>
            <p class="qv-sync-cap">
              {{
                syncState === 'done'
                  ? 'Sistema sincronizado'
                  : syncState === 'activating'
                    ? 'Calibrando núcleo del sistema...'
                    : 'Mantén presionado para calibrar'
              }}
            </p>
            <p class="qv-sync-help">
              {{
                syncState === 'done'
                  ? 'El analizador está listo para procesar su informe'
                  : 'Sostén 15 segundos para completar la sincronización'
              }}
            </p>
            <p v-if="syncError" class="qv-sync-error">
              El informe no puede procesarse sin sincronizar el sistema. Mantén presionado el anillo durante 15 segundos.
            </p>
            <button type="button" class="qv-submit" :disabled="syncState !== 'done'" @click="submit">
              Generar informe del analizador
            </button>
          </div>

          <div class="qv-nav">
            <button type="button" class="qv-back" :disabled="currentStep === 1" @click="prev">Anterior</button>
            <span>Paso {{ currentStep }} de {{ TOTAL_STEPS }}</span>
            <button v-if="currentStep < TOTAL_STEPS" type="button" class="qv-next" @click="next">Siguiente</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
.qv {
  --borde: #d6e3ec;
  --borde-fuerte: #b7cddc;
  --azul: #0072ce;
  --azul-brillante: #00b7ff;
  --azul-profundo: #023965;
  --verde: #00b389;
  --verde-oscuro: #027a5a;
  --verde-menta: #eafbf6;
  --azul-suave: #eaf6fd;
  --texto: #142530;
  --texto-suave: #5c6f79;
  --dorado-alerta: #e8a33d;
  max-width: 920px;
  margin: 1rem auto 2.5rem;
}
.qv-device {
  background: linear-gradient(180deg, #fdfefe, #eef3f6);
  border-radius: 26px;
  border: 1px solid var(--borde-fuerte);
  box-shadow: 0 30px 70px rgba(2, 57, 101, 0.16);
  padding: 4px;
  overflow: hidden;
}
.qv-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 22px;
  background: linear-gradient(120deg, #04314f, #04547f 55%, #026a99);
  border-radius: 22px 22px 0 0;
  color: #eaf6fd;
}
.qv-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.qv-brand h1 {
  font-size: clamp(15px, 3.6vw, 18px);
  font-weight: 700;
  color: #fff;
  line-height: 1.25;
}
.qv-brand span {
  display: block;
  margin-top: 4px;
  font-size: 10.5px;
  letter-spacing: 1.4px;
  color: #9fe0ff;
  font-weight: 600;
}
.qv-mark {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  position: relative;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #7fe6ff, #00b7ff 45%, #023965 100%);
  box-shadow: 0 0 16px rgba(0, 183, 255, 0.75);
}
.qv-mark::after {
  content: "";
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-top-color: transparent;
  animation: qv-spin 3.2s linear infinite;
}
.qv-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.6px;
  color: #bfe9ff;
  white-space: nowrap;
}
.qv-led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00c896;
  box-shadow: 0 0 8px #00c896;
  animation: qv-led-pulse 1.6s ease-in-out infinite;
}
.qv-led:nth-child(2) {
  background: var(--azul-brillante);
  box-shadow: 0 0 8px var(--azul-brillante);
  animation-delay: 0.35s;
}
.qv-led:nth-child(3) {
  background: #ff9f43;
  box-shadow: 0 0 8px #ff9f43;
  animation-delay: 0.7s;
}
.qv-screen {
  background: var(--panel-alt);
  border-radius: 0 0 20px 20px;
  padding: 26px 24px 30px;
}
.qv-lead {
  text-align: center;
  margin: 0 auto 22px;
  max-width: 640px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--texto-suave);
}
.qv-rail {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 auto 22px;
  overflow-x: auto;
  padding-bottom: 8px;
}
.qv-rail-wrap {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}
.qv-dot {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid var(--borde-fuerte);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #5f7480;
}
.qv-line {
  flex: 1;
  height: 2px;
  margin: 0 2px;
  background: var(--borde-fuerte);
}
.qv-rail-wrap.is-done .qv-dot {
  background: var(--azul);
  border-color: var(--azul);
  color: #fff;
}
.qv-rail-wrap.is-done .qv-line {
  background: var(--azul);
}
.qv-rail-wrap.is-current .qv-dot {
  border-color: var(--azul-brillante);
  color: var(--azul-profundo);
  box-shadow: 0 0 0 4px rgba(0, 183, 255, 0.18);
}
.qv-h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 18px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--borde);
  color: var(--azul-profundo);
  font-size: clamp(17px, 4vw, 20px);
  font-weight: 700;
}
.qv-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px dashed var(--borde);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.6px;
  color: var(--texto-suave);
  text-transform: uppercase;
}
.qv-back,
.qv-next {
  border-radius: 11px;
  padding: 13px 20px;
  font-weight: 700;
  cursor: pointer;
}
.qv-back {
  background: #fff;
  color: #5f7480;
  border: 1.5px solid var(--borde-fuerte);
}
.qv-back:disabled {
  opacity: 0.35;
  cursor: default;
}
.qv-next {
  margin-left: auto;
  border: 0;
  color: #fff;
  background: linear-gradient(120deg, var(--azul-brillante), var(--azul) 60%, var(--azul-profundo));
}
.qv-sync {
  text-align: center;
}
.qv-sync > p:first-child {
  max-width: 480px;
  margin: 0 auto 18px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--texto-suave);
}
.qv-ring {
  width: 190px;
  height: 190px;
  margin: 8px auto;
  position: relative;
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
}
.qv-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.qv-track {
  fill: none;
  stroke: var(--borde);
  stroke-width: 10;
}
.qv-arc {
  fill: none;
  stroke: url(#qvSyncGradient);
  stroke-width: 10;
  stroke-linecap: round;
  filter: drop-shadow(0 0 6px rgba(0, 183, 255, 0.65));
  transition: stroke-dashoffset 0.08s linear;
}
.qv-core {
  position: absolute;
  inset: 22px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff, var(--azul-suave) 70%);
  border: 1px solid var(--borde-fuerte);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.qv-core strong {
  font-size: 30px;
  color: var(--azul-profundo);
}
.qv-core span {
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--texto-suave);
  font-weight: 600;
}
.qv-ring.is-done .qv-core {
  background: radial-gradient(circle at 35% 30%, #eafff8, var(--verde-menta) 70%);
  border-color: var(--verde);
}
.qv-ring.is-done .qv-core strong {
  color: var(--verde-oscuro);
}
.qv-sync-cap {
  margin-top: 12px;
  font-weight: 600;
}
.qv-sync-help {
  font-size: 12px;
  color: var(--texto-suave);
}
.qv-sync-error {
  margin-top: 10px;
  color: #b45309;
  font-size: 13px;
  font-weight: 600;
}
.qv-submit {
  width: 100%;
  margin-top: 22px;
  border: 0;
  border-radius: 12px;
  padding: 16px;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  background: linear-gradient(120deg, #6be0c4, var(--azul) 55%, var(--azul-profundo));
}
.qv-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.qv-loading {
  text-align: center;
  padding: 44px 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, #04314f, #023047);
  color: #bfe9ff;
}
.qv-spinner {
  display: block;
  width: 42px;
  height: 42px;
  margin: 0 auto 16px;
  border: 4px solid rgba(0, 183, 255, 0.15);
  border-top-color: var(--azul-brillante);
  border-radius: 50%;
  animation: qv-spin 0.9s linear infinite;
}
.qv-intro {
  background: linear-gradient(155deg, var(--azul-suave), #fff);
  padding: 22px;
  border-radius: 16px;
  border: 1px solid var(--borde-fuerte);
  margin-bottom: 18px;
  text-align: center;
}
.qv-intro h2 {
  color: var(--azul-profundo);
  font-size: 22px;
  margin-bottom: 10px;
}
.qv-intro p {
  font-size: 14.5px;
  line-height: 1.65;
  text-align: justify;
  margin-bottom: 8px;
}
.qv-findings {
  background: #fffaf0;
  border-left: 5px solid var(--dorado-alerta);
  padding: 18px;
  border-radius: 10px;
  margin-bottom: 20px;
}
.qv-findings-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #b9781f;
  font-weight: 700;
}
.qv-findings ul {
  margin-top: 8px;
  font-size: 14px;
}
.qv-findings li {
  padding: 7px 0;
  border-bottom: 1px dashed var(--borde);
}
.qv-empty {
  text-align: center;
  color: #0288d1;
  margin-bottom: 16px;
}
.qv-product {
  background: #fff;
  border: 1px solid var(--borde);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 18px;
}
.qv-product header {
  background: linear-gradient(110deg, var(--azul-brillante), var(--azul) 60%, var(--azul-profundo));
  color: #fff;
  padding: 13px 16px;
  font-weight: 700;
}
.qv-product-body {
  display: flex;
  gap: 20px;
  padding: 20px;
}
.qv-product-body img {
  width: 140px;
  min-width: 140px;
  object-fit: contain;
  border-radius: 50%;
  border: 2px solid var(--borde-fuerte);
  background: radial-gradient(circle at 35% 30%, #fff, var(--azul-suave) 85%);
  padding: 12px;
}
.qv-evidence,
.qv-solution {
  padding: 13px;
  margin-bottom: 12px;
  border-radius: 0 10px 10px 0;
  font-size: 13.5px;
  line-height: 1.55;
}
.qv-evidence {
  background: var(--azul-suave);
  border-left: 4px solid var(--azul);
}
.qv-solution {
  background: var(--verde-menta);
  border-left: 4px solid var(--verde);
}
.qv-evidence p,
.qv-solution p {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 6px;
}
.qv-evidence p {
  color: var(--azul);
}
.qv-solution p {
  color: var(--verde-oscuro);
}
.qv-menu,
.qv-advice {
  background: #fff;
  border: 1px solid var(--borde);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 18px;
}
.qv-menu header {
  background: linear-gradient(110deg, #6be0c4, var(--verde) 60%, var(--verde-oscuro));
  color: #fff;
  padding: 13px 16px;
  font-weight: 700;
}
.qv-advice header {
  background: linear-gradient(110deg, #ffd977, var(--dorado-alerta) 70%, #c98a1f);
  color: #3a2a00;
  padding: 13px 16px;
  font-weight: 700;
}
.qv-menu-body,
.qv-advice-body {
  padding: 20px;
}
.qv-menu-body section {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--borde);
}
.qv-menu-body h3,
.qv-advice-body h3 {
  color: var(--azul-profundo);
  font-weight: 700;
  margin-bottom: 8px;
}
.qv-advice-body h3 {
  color: #b9781f;
}
.qv-meal {
  font-size: 14px;
  margin-bottom: 8px;
}
.qv-meal span {
  display: block;
  font-size: 12.5px;
  color: var(--texto-suave);
}
.qv-advice-body p {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}
.qv-disclaimer {
  font-size: 11px;
  font-style: italic;
  text-align: center;
  color: var(--texto-suave);
  background: var(--panel-alt);
  border: 1px dashed var(--borde);
  border-radius: 8px;
  padding: 10px;
}
@keyframes qv-spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes qv-led-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.22;
    transform: scale(0.72);
  }
}
@media (max-width: 680px) {
  .qv-screen {
    padding: 20px 14px 24px;
  }
  .qv-product-body {
    flex-direction: column;
    align-items: center;
  }
  .qv-status {
    display: none;
  }
}
</style>
