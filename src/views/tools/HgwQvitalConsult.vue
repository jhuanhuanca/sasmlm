<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SoftButton from '@/components/ui/SoftButton.vue'
import SoftField from '@/components/ui/SoftField.vue'
import WellnessChoiceGroup from '@/components/tools/WellnessChoiceGroup.vue'
import {
  chronicConditions,
  emptyConsultForm,
  familyConditions,
  healthRatings,
  mentalConditions,
  mentalSymptoms,
  recentSymptoms,
} from '@/data/wellnessConsult'
import {
  buildHgwConsultReport,
  formatHgwConsultReport,
  type HgwConsultReport,
} from '@/data/wellnessHgwConsult'
import { fieldControlClass } from '@/utils/ui'
import '@/styles/qvital.css'

const TOTAL_STEPS = 11
const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const form = reactive(emptyConsultForm())
const currentStep = ref(1)
const phase = ref<'form' | 'loading' | 'results'>('form')
const report = ref<HgwConsultReport | null>(null)
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
  3: { icon: 'clipboard', title: 'Condiciones crónicas' },
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
    'Cruzando tus respuestas con la línea Health Green World…',
    'Armando el menú semanal y los consejos…',
    'Comparando hallazgos con el catálogo HGW…',
    'Ensamblando informe personalizado…',
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
    report.value = buildHgwConsultReport(form)
    phase.value = 'results'
  }, 2400)
}

async function copySummary(): Promise<void> {
  if (!report.value) return
  await navigator.clipboard.writeText(formatHgwConsultReport(form, report.value))
  copied.value = true
}

function hideBrokenImage(event: Event): void {
  const image = event.target
  if (image instanceof HTMLImageElement) image.style.display = 'none'
}

function reset(): void {
  clearSyncTimer()
  clearLoadTimers()
  Object.assign(form, emptyConsultForm())
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
            <span>MODELO QNX-7 · SISTEMA DE BIENESTAR HGW</span>
          </div>
        </div>
        <div class="qv-status">
          <span class="qv-led" /><span class="qv-led" /><span class="qv-led" />
          EN LÍNEA
        </div>
      </div>

      <div class="qv-screen">
        <p class="qv-lead">
          Este sistema procesa sus respuestas, hábitos e historial para generar un informe de bienestar personalizado
          con la línea Health Green World. Complete cada panel con honestidad; toda la información es confidencial.
          No sustituye una consulta médica.
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
              Este informe cruza tus respuestas con la línea <strong>Health Green World (HGW)</strong>.
              Las recomendaciones de producto son complementos alimenticios de esa línea, no medicamentos.
            </p>
            <p>
              <strong>Importante:</strong> No tratan ni curan enfermedades. Consulta siempre a un profesional de la salud.
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
            No se identificaron necesidades específicas que requieran recomendaciones de suplementos HGW en este momento.
          </p>

          <article v-for="product in report.products" :key="product.key" class="qv-product">
            <header>Recomendación: {{ product.name }}</header>
            <div class="qv-product-body">
              <img :src="product.image" :alt="product.name" @error="hideBrokenImage" />
              <div>
                <div class="qv-solution">
                  <p>Solución HGW</p>
                  {{ product.summary }}
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
            Esta información se genera a partir de tus respuestas y de la línea HGW. No sustituye el consejo de un médico.
            Consulte siempre a su médico antes de iniciar cualquier suplemento.
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
              <input v-model.number="form.age" :class="fieldControlClass" type="number" min="18" required />
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
              <input v-model.number="form.height" :class="fieldControlClass" type="number" min="80" required />
            </SoftField>
            <SoftField label="Peso (kg)">
              <input v-model.number="form.weight" :class="fieldControlClass" type="number" min="20" step="0.1" required />
            </SoftField>
          </div>

          <div v-if="currentStep === 2" class="space-y-4">
            <SoftField label="En general, ¿cómo calificaría su salud?">
              <WellnessChoiceGroup v-model="form.health_rating" type="radio" name="health_rating" :options="healthRatings" />
            </SoftField>
            <SoftField label="¿Cuáles son sus síntomas actuales, si los tiene?">
              <textarea v-model="form.current_symptoms" :class="fieldControlClass" rows="3" />
            </SoftField>
          </div>

          <div v-if="currentStep === 3" class="space-y-4">
            <WellnessChoiceGroup v-model="form.conditions" type="checkbox" name="hgw_conditions" :options="chronicConditions" />
            <SoftField label="Otras condiciones">
              <textarea v-model="form.other_conditions" :class="fieldControlClass" rows="2" placeholder="Detalles de otras condiciones…" />
            </SoftField>
          </div>

          <div v-if="currentStep === 4" class="space-y-4">
            <SoftField label="Medicamentos o suplementos actuales">
              <textarea v-model="form.medications" :class="fieldControlClass" rows="3" placeholder="Liste con dosis y frecuencia" />
            </SoftField>
            <SoftField label="Alergias">
              <textarea v-model="form.allergies" :class="fieldControlClass" rows="2" />
            </SoftField>
            <SoftField label="¿Ha tenido cirugías u hospitalizaciones?">
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
            <SoftField v-if="form.surgery === 'yes'" label="Detalle de cirugías">
              <textarea v-model="form.surgery_details" :class="fieldControlClass" rows="2" />
            </SoftField>
          </div>

          <div v-if="currentStep === 5" class="space-y-4">
            <p class="text-sm">Antecedentes en su familia directa</p>
            <WellnessChoiceGroup v-model="form.family_conditions" type="checkbox" name="hgw_family" :options="familyConditions" />
            <SoftField label="Detalles familiares">
              <textarea v-model="form.family_details" :class="fieldControlClass" rows="2" placeholder="Edad de diagnóstico, parentesco…" />
            </SoftField>
          </div>

          <div v-if="currentStep === 6" class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <SoftField label="¿Fuma o ha fumado?">
                <select v-model="form.smoking" :class="fieldControlClass">
                  <option value="">Seleccione</option>
                  <option value="nunca">Nunca</option>
                  <option value="pasado">En el pasado</option>
                  <option value="actual">Actualmente</option>
                </select>
              </SoftField>
              <SoftField label="Detalle de tabaco">
                <input v-model="form.smoking_details" :class="fieldControlClass" placeholder="Cantidad y duración" />
              </SoftField>
              <SoftField label="Alcohol">
                <select v-model="form.alcohol" :class="fieldControlClass">
                  <option value="">Seleccione</option>
                  <option value="nunca">Nunca</option>
                  <option value="ocasional">Ocasionalmente</option>
                  <option value="semanal">Semanalmente</option>
                  <option value="diario">Diariamente</option>
                </select>
              </SoftField>
              <SoftField label="Ejercicio">
                <select v-model="form.exercise" :class="fieldControlClass">
                  <option value="">Seleccione</option>
                  <option value="nunca">Nunca</option>
                  <option value="1-2">1-2 veces por semana</option>
                  <option value="3-5">3-5 veces por semana</option>
                  <option value="diario">Diariamente</option>
                </select>
              </SoftField>
              <SoftField label="Horas de sueño">
                <input v-model.number="form.sleep" :class="fieldControlClass" type="number" min="0" max="24" />
              </SoftField>
            </div>
            <SoftField label="¿Experimenta estrés significativo?">
              <WellnessChoiceGroup
                v-model="form.stress"
                type="radio"
                name="stress"
                :options="[
                  { value: 'yes', label: 'Sí', icon: 'zap' },
                  { value: 'no', label: 'No', icon: 'check' },
                ]"
              />
            </SoftField>
            <SoftField v-if="form.stress === 'yes'" label="Detalle de estrés">
              <textarea v-model="form.stress_details" :class="fieldControlClass" rows="2" />
            </SoftField>
          </div>

          <div v-if="currentStep === 7" class="space-y-4">
            <SoftField label="¿Cómo calificaría su salud mental?">
              <WellnessChoiceGroup v-model="form.mental_health_rating" type="radio" name="mental_health_rating" :options="healthRatings" />
            </SoftField>
            <SoftField label="Condiciones de salud mental">
              <WellnessChoiceGroup v-model="form.mental_conditions" type="checkbox" name="mental_conditions" :options="mentalConditions" />
            </SoftField>
            <SoftField label="Otras condiciones mentales">
              <textarea v-model="form.other_mental_conditions" :class="fieldControlClass" rows="2" />
            </SoftField>
            <SoftField label="Medicación para salud mental">
              <textarea v-model="form.mental_medications" :class="fieldControlClass" rows="2" />
            </SoftField>
            <SoftField label="Síntomas mentales recientes">
              <WellnessChoiceGroup v-model="form.mental_symptoms" type="checkbox" name="mental_symptoms" :options="mentalSymptoms" />
            </SoftField>
            <SoftField label="Detalle de síntomas mentales">
              <textarea v-model="form.mental_symptoms_details" :class="fieldControlClass" rows="2" />
            </SoftField>
          </div>

          <div v-if="currentStep === 8" class="space-y-4">
            <SoftField label="Comidas al día">
              <select v-model="form.meals_per_day" :class="fieldControlClass">
                <option value="">Seleccione</option>
                <option value="1-2">1-2</option>
                <option value="3">3</option>
                <option value="4+">4 o más</option>
              </select>
            </SoftField>
            <SoftField label="Dieta específica">
              <select v-model="form.diet_type" :class="fieldControlClass">
                <option value="">Seleccione</option>
                <option value="ninguna">Ninguna</option>
                <option value="vegetariana">Vegetariana</option>
                <option value="vegana">Vegana</option>
                <option value="baja_en_carbo">Baja en carbohidratos</option>
                <option value="otro">Otra</option>
              </select>
            </SoftField>
            <SoftField label="Dieta típica de un día">
              <textarea v-model="form.diet_details" :class="fieldControlClass" rows="2" />
            </SoftField>
            <SoftField label="¿Interesado en suplementos para prevención?">
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

          <div v-if="currentStep === 9" class="space-y-4">
            <p class="text-sm">Síntomas recientes</p>
            <WellnessChoiceGroup v-model="form.symptoms" type="checkbox" name="hgw_symptoms" :options="recentSymptoms" />
            <SoftField label="Detalles y duración">
              <textarea v-model="form.symptoms_details" :class="fieldControlClass" rows="2" />
            </SoftField>
          </div>

          <div v-if="currentStep === 10" class="space-y-4">
            <SoftField label="¿Es deportista o hace actividad intensa?">
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
            <SoftField label="Tipo de deporte">
              <select v-model="form.sport_type" :class="fieldControlClass">
                <option value="">Seleccione</option>
                <option value="ninguno">Ninguno</option>
                <option value="correr">Correr</option>
                <option value="gimnasio">Gimnasio</option>
                <option value="equipo">Deportes de equipo</option>
                <option value="otro">Otro</option>
              </select>
            </SoftField>
            <SoftField label="Frecuencia de entrenamiento">
              <select v-model="form.training_frequency" :class="fieldControlClass">
                <option value="">Seleccione</option>
                <option value="ocasional">Ocasional</option>
                <option value="regular">Regular (3-5 días/semana)</option>
                <option value="intensivo">Intensivo (diario)</option>
              </select>
            </SoftField>
            <SoftField label="Apoyo nutricional para rendimiento">
              <textarea v-model="form.sport_needs" :class="fieldControlClass" rows="2" />
            </SoftField>
          </div>

          <div v-if="currentStep === 11" class="qv-sync">
            <p>
              Antes de procesar tu informe, activa el núcleo del analizador. Esto no lee datos biométricos: es la calibración
              del propio sistema antes de correlacionar tus respuestas con la base de recomendaciones HGW.
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
