import type { IconName } from '@/components/ui/AppIcon.vue'

export type ConsultChoice = { value: string; label: string; icon?: IconName }

export const healthRatings: ConsultChoice[] = [
  { value: 'excelente', label: 'Excelente', icon: 'star' },
  { value: 'muy_buena', label: 'Muy buena', icon: 'heart' },
  { value: 'buena', label: 'Buena', icon: 'check' },
  { value: 'regular', label: 'Regular', icon: 'bell' },
  { value: 'mala', label: 'Mala', icon: 'alarm' },
]

export const chronicConditions: ConsultChoice[] = [
  { value: 'diabetes', label: 'Diabetes', icon: 'clipboard' },
  { value: 'hipertension', label: 'Hipertensión', icon: 'heart' },
  { value: 'cardiopatia', label: 'Cardiopatía', icon: 'heart' },
  { value: 'cancer', label: 'Cáncer', icon: 'plus' },
  { value: 'cancer_gastrico', label: 'Cáncer gástrico', icon: 'plus' },
  { value: 'gastritis', label: 'Gastritis media o aguda', icon: 'bag' },
  { value: 'enfermedad_renal', label: 'Enfermedad renal crónica', icon: 'file' },
  { value: 'cirrosis_hepatica', label: 'Cirrosis hepática', icon: 'file' },
  { value: 'epoc', label: 'EPOC', icon: 'zap' },
  { value: 'accidente_cerebrovascular', label: 'Accidente cerebrovascular', icon: 'monitor' },
  { value: 'vih', label: 'VIH/SIDA', icon: 'users' },
  { value: 'tuberculosis', label: 'Tuberculosis', icon: 'clipboard' },
  { value: 'chagas', label: 'Enfermedad de Chagas', icon: 'heart' },
  { value: 'artritis', label: 'Artritis', icon: 'plus' },
  { value: 'asma', label: 'Asma', icon: 'zap' },
  { value: 'enfermedades_tiroideas', label: 'Enfermedades tiroideas', icon: 'star' },
  { value: 'otro', label: 'Otro (especifique abajo)', icon: 'plus' },
]

export const familyConditions: ConsultChoice[] = chronicConditions.map((item) => ({
  value: item.value,
  label: item.label.replace(' (especifique abajo)', ''),
}))

export const mentalConditions: ConsultChoice[] = [
  { value: 'ansiedad', label: 'Ansiedad', icon: 'bell' },
  { value: 'depresion', label: 'Depresión', icon: 'moon' },
  { value: 'trastorno_bipolar', label: 'Trastorno bipolar', icon: 'chart' },
  { value: 'esquizofrenia', label: 'Esquizofrenia', icon: 'monitor' },
  { value: 'otro', label: 'Otro (especifique abajo)', icon: 'plus' },
]

export const mentalSymptoms: ConsultChoice[] = [
  { value: 'ansiedad_excesiva', label: 'Ansiedad excesiva', icon: 'bell' },
  { value: 'tristeza_persistente', label: 'Tristeza persistente', icon: 'moon' },
  { value: 'cambios_humor', label: 'Cambios de humor', icon: 'chart' },
  { value: 'dificultad_concentracion', label: 'Dificultad para concentrarse', icon: 'monitor' },
  { value: 'otro', label: 'Otro', icon: 'plus' },
]

export const recentSymptoms: ConsultChoice[] = [
  { value: 'fatiga', label: 'Fatiga', icon: 'zap' },
  { value: 'dolor_pecho', label: 'Dolor en el pecho', icon: 'heart' },
  { value: 'perdida_peso', label: 'Pérdida de peso inexplicable', icon: 'chart' },
  { value: 'sed_excesiva', label: 'Sed excesiva', icon: 'bag' },
  { value: 'otro', label: 'Otro', icon: 'plus' },
]

export type ConsultForm = {
  age: number | null
  gender: string
  height: number | null
  weight: number | null
  health_rating: string
  current_symptoms: string
  conditions: string[]
  other_conditions: string
  medications: string
  allergies: string
  surgery: string
  surgery_details: string
  family_conditions: string[]
  family_details: string
  smoking: string
  smoking_details: string
  alcohol: string
  exercise: string
  sleep: number | null
  stress: string
  stress_details: string
  mental_health_rating: string
  mental_conditions: string[]
  other_mental_conditions: string
  mental_medications: string
  mental_symptoms: string[]
  mental_symptoms_details: string
  meals_per_day: string
  diet_type: string
  diet_details: string
  supplements_interest: string
  symptoms: string[]
  symptoms_details: string
  athlete: string
  sport_type: string
  training_frequency: string
  sport_needs: string
  scan_done: boolean
}

export function emptyConsultForm(): ConsultForm {
  return {
    age: null,
    gender: '',
    height: null,
    weight: null,
    health_rating: '',
    current_symptoms: '',
    conditions: [],
    other_conditions: '',
    medications: '',
    allergies: '',
    surgery: '',
    surgery_details: '',
    family_conditions: [],
    family_details: '',
    smoking: '',
    smoking_details: '',
    alcohol: '',
    exercise: '',
    sleep: null,
    stress: '',
    stress_details: '',
    mental_health_rating: '',
    mental_conditions: [],
    other_mental_conditions: '',
    mental_medications: '',
    mental_symptoms: [],
    mental_symptoms_details: '',
    meals_per_day: '',
    diet_type: '',
    diet_details: '',
    supplements_interest: '',
    symptoms: [],
    symptoms_details: '',
    athlete: '',
    sport_type: '',
    training_frequency: '',
    sport_needs: '',
    scan_done: false,
  }
}

function labelsOf(values: string[], catalog: ConsultChoice[]): string {
  if (!values.length) {
    return 'Ninguna seleccionada'
  }

  return values
    .map((value) => catalog.find((item) => item.value === value)?.label ?? value)
    .join(', ')
}

export function consultBmi(form: ConsultForm): string {
  const height = Number(form.height || 0) / 100
  const weight = Number(form.weight || 0)
  if (height <= 0 || weight <= 0) {
    return '—'
  }

  return (weight / (height * height)).toFixed(1)
}

export function formatConsultSummary(form: ConsultForm): string {
  return [
    'CONSULTA INTERACTIVA DE BIENESTAR',
    '',
    `Edad: ${form.age ?? '—'} · Género: ${form.gender || '—'}`,
    `Altura: ${form.height ?? '—'} cm · Peso: ${form.weight ?? '—'} kg · IMC: ${consultBmi(form)}`,
    `Salud general: ${form.health_rating || '—'}`,
    `Síntomas actuales: ${form.current_symptoms || '—'}`,
    '',
    `Condiciones: ${labelsOf(form.conditions, chronicConditions)}`,
    form.other_conditions ? `Otras condiciones: ${form.other_conditions}` : null,
    `Medicamentos: ${form.medications || '—'}`,
    `Alergias: ${form.allergies || '—'}`,
    `Cirugías: ${form.surgery || '—'} ${form.surgery_details}`.trim(),
    '',
    `Antecedentes familiares: ${labelsOf(form.family_conditions, familyConditions)}`,
    form.family_details ? `Detalle familiar: ${form.family_details}` : null,
    '',
    `Tabaco: ${form.smoking || '—'} ${form.smoking_details}`.trim(),
    `Alcohol: ${form.alcohol || '—'}`,
    `Ejercicio: ${form.exercise || '—'}`,
    `Sueño: ${form.sleep ?? '—'} h`,
    `Estrés: ${form.stress || '—'} ${form.stress_details}`.trim(),
    '',
    `Salud mental: ${form.mental_health_rating || '—'}`,
    `Condiciones mentales: ${labelsOf(form.mental_conditions, mentalConditions)}`,
    `Síntomas mentales: ${labelsOf(form.mental_symptoms, mentalSymptoms)}`,
    '',
    `Comidas/día: ${form.meals_per_day || '—'} · Dieta: ${form.diet_type || '—'}`,
    `Interés en suplementos: ${form.supplements_interest || '—'}`,
    `Síntomas recientes: ${labelsOf(form.symptoms, recentSymptoms)}`,
    '',
    `Deportista: ${form.athlete || '—'} · Deporte: ${form.sport_type || '—'}`,
    `Entrenamiento: ${form.training_frequency || '—'}`,
    form.sport_needs ? `Necesidad deportiva: ${form.sport_needs}` : null,
    '',
    `Escaneo biométrico (simulado): ${form.scan_done ? 'completado' : 'no realizado'}`,
    '',
    'Esta consulta no sustituye evaluación médica profesional. Consulte a su médico antes de iniciar cualquier suplemento o tratamiento.',
  ]
    .filter((line) => line !== null)
    .join('\n')
}
