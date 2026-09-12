import type { ConsultChoice } from '@/data/wellnessConsult'

export type FwpConsultForm = {
  age: number | null
  gender: string
  height: number | null
  weight: number | null
  health_rating: string
  current_symptoms: string
  conditions: string[]
  conditions_details: string
  medications: string
  allergies: string
  surgery: string
  surgery_details: string
  family_conditions: string[]
  family_details: string
  smoking: string
  alcohol: string
  stress: string
  sleep: number | null
  exercise: string
  supplements_interest: string
  mental_health_rating: string
  mental_conditions: string[]
  mental_symptoms: string[]
  mental_details: string
  meals_per_day: string
  diet_type: string
  diet_details: string
  symptoms: string[]
  symptoms_details: string
  athlete: string
  sport_type: string
  training_frequency: string
  sport_needs: string
  scan_done: boolean
}

export type FwpProduct = {
  key: string
  name: string
  image: string
  evidence: string
  solution: string
}

export type FwpMeal = { type: string; desc: string; nutrition: string }
export type FwpMenu = { title: string; days: Array<{ day: string; meals: FwpMeal[] }> }
export type FwpAdvice = { title: string; body: string }

export type FwpConsultReport = {
  bmi: string
  bmiLabel: string
  findings: string[]
  products: FwpProduct[]
  menu: FwpMenu
  advice: FwpAdvice[]
}

type MealSlot = { desc: string; tag: string }
type MealPool = {
  desayuno: MealSlot[]
  media_manana: MealSlot[]
  almuerzo: MealSlot[]
  merienda: MealSlot[]
  cena: MealSlot[]
}

export function emptyFwpConsultForm(): FwpConsultForm {
  return {
    age: null,
    gender: '',
    height: null,
    weight: null,
    health_rating: '',
    current_symptoms: '',
    conditions: [],
    conditions_details: '',
    medications: '',
    allergies: '',
    surgery: '',
    surgery_details: '',
    family_conditions: [],
    family_details: '',
    smoking: '',
    alcohol: '',
    stress: '',
    sleep: null,
    exercise: 'nunca',
    supplements_interest: '',
    mental_health_rating: '',
    mental_conditions: [],
    mental_symptoms: [],
    mental_details: '',
    meals_per_day: '',
    diet_type: '',
    diet_details: '',
    symptoms: [],
    symptoms_details: '',
    athlete: '',
    sport_type: '',
    training_frequency: '',
    sport_needs: '',
    scan_done: false,
  }
}

export const fwpHealthRatings: ConsultChoice[] = [
  { value: 'excelente', label: 'Excelente', icon: 'star' },
  { value: 'muy_buena', label: 'Muy buena', icon: 'heart' },
  { value: 'buena', label: 'Buena', icon: 'check' },
  { value: 'regular', label: 'Regular', icon: 'bell' },
  { value: 'mala', label: 'Mala', icon: 'alarm' },
]

export const fwpConditions: ConsultChoice[] = [
  { value: 'estreñimiento', label: 'Estreñimiento / problemas de tránsito', icon: 'clipboard' },
  { value: 'gastritis', label: 'Gastritis / molestias digestivas', icon: 'heart' },
  { value: 'dolor_huesos', label: 'Dolor de huesos / articulaciones', icon: 'plus' },
  { value: 'fatiga', label: 'Fatiga / falta de energía', icon: 'zap' },
  { value: 'estres', label: 'Estrés / ansiedad', icon: 'bell' },
  { value: 'piel', label: 'Problemas de piel / acné / envejecimiento', icon: 'star' },
  { value: 'menopausia', label: 'Menopausia / síntomas hormonales', icon: 'heart' },
  { value: 'peso', label: 'Control de peso / bajar de peso', icon: 'chart' },
  { value: 'concentracion', label: 'Falta de concentración / memoria', icon: 'monitor' },
  { value: 'infertilidad', label: 'Infertilidad / vitalidad sexual', icon: 'users' },
  { value: 'general', label: 'Bienestar general / prevención', icon: 'home' },
  { value: 'otro', label: 'Otra (especifica abajo)', icon: 'plus' },
]

export const fwpFamilyConditions: ConsultChoice[] = [
  { value: 'huesos_articulaciones', label: 'Osteoporosis / artritis', icon: 'plus' },
  { value: 'obesidad', label: 'Obesidad / sobrepeso', icon: 'chart' },
  { value: 'diabetes', label: 'Diabetes', icon: 'clipboard' },
  { value: 'hipertension', label: 'Hipertensión / cardiopatías', icon: 'heart' },
  { value: 'digestivas', label: 'Enfermedades digestivas (gastritis, colon irritable)', icon: 'file' },
  { value: 'hormonales', label: 'Problemas hormonales / menopausia temprana', icon: 'star' },
  { value: 'ansiedad_depresion', label: 'Ansiedad / depresión', icon: 'bell' },
  { value: 'piel', label: 'Enfermedades de la piel / envejecimiento prematuro', icon: 'sun' },
  { value: 'otro', label: 'Otro', icon: 'plus' },
]

export const fwpMentalConditions: ConsultChoice[] = [
  { value: 'ansiedad', label: 'Ansiedad', icon: 'bell' },
  { value: 'depresion', label: 'Depresión', icon: 'moon' },
  { value: 'estres_cronico', label: 'Estrés crónico', icon: 'zap' },
  { value: 'insomnio', label: 'Insomnio', icon: 'alarm' },
  { value: 'otro', label: 'Otro', icon: 'plus' },
]

export const fwpMentalSymptoms: ConsultChoice[] = [
  { value: 'ansiedad_excesiva', label: 'Ansiedad excesiva', icon: 'bell' },
  { value: 'tristeza_persistente', label: 'Tristeza persistente', icon: 'moon' },
  { value: 'cambios_humor', label: 'Cambios de humor', icon: 'chart' },
  { value: 'dificultad_concentracion', label: 'Dificultad para concentrarse', icon: 'monitor' },
  { value: 'otro', label: 'Otro', icon: 'plus' },
]

export const fwpSymptoms: ConsultChoice[] = [
  { value: 'hinchazon_abdominal', label: 'Hinchazón abdominal / gases', icon: 'bag' },
  { value: 'dolor_articular_matutino', label: 'Dolor articular al despertar', icon: 'alarm' },
  { value: 'piel_opaca', label: 'Piel opaca / envejecida', icon: 'sun' },
  { value: 'caida_cabello', label: 'Caída de cabello / uñas débiles', icon: 'star' },
  { value: 'bajo_rendimiento', label: 'Bajo rendimiento físico o mental', icon: 'zap' },
  { value: 'libido_baja', label: 'Baja vitalidad / libido', icon: 'heart' },
  { value: 'otro', label: 'Otro', icon: 'plus' },
]

export const fwpCatalog: Record<string, FwpProduct> = {
  renova: {
    key: 'renova',
    name: 'RENÖVA+',
    image: 'https://static.wixstatic.com/media/d00cad_e3ce0a09e4b543cf9912e2339398aa76~mv2.png',
    evidence:
      'Colágeno hidrolizado + resveratrol + Q10 + vitamina C + zinc + magnesio. Evidencia de Harvard Health y meta-análisis: mejora modestamente hidratación y elasticidad de la piel, y puede apoyar movilidad y confort articular. El hueso es ~60 % colágeno. Beneficios preliminares en densidad ósea en mujeres postmenopáusicas. Evidencia de calidad variable y muchos estudios con ingredientes adicionales.',
    solution:
      'Apoyo nutricional para piel más firme, uñas y cabello más fuertes, huesos y articulaciones, y bienestar desde el interior. Ideal para dolor de huesos, problemas de piel y menopausia.',
  },
  capucci: {
    key: 'capucci',
    name: 'AYNI CAPUCCI 360°',
    image: 'https://static.wixstatic.com/media/d00cad_5a605fcb8b7a40a7bcf9e12dc6009f0c~mv2.png',
    evidence:
      'Café funcional 7 en 1 (café + maca + moringa + ganoderma + amalaki + espirulina + colágeno + zinc). Harvard sobre alternativas de café y yerba mate: estimulación con menos nerviosismo, mejor enfoque. Maca con datos preliminares y tradicionales para energía, stamina, fertilidad y síntomas menopáusicos (MSKCC). Zinc apoya función inmune si hay deficiencia.',
    solution:
      'Energía sostenida, concentración, memoria, rendimiento físico-mental, defensas y piel saludable. Ideal para fatiga, estrés, falta de concentración, conductores e infertilidad.',
  },
  liv: {
    key: 'liv',
    name: 'LIV',
    image: 'https://static.wixstatic.com/media/d00cad_a79d0a7f3f2440789ddd9e1a2d86bbbf~mv2.webp',
    evidence:
      'Fibra de bambú + FOS (prebióticos) + probióticos + manzana verde (6 g fibra/porción). Mayo Clinic y revisiones (Cambridge/British Journal of Nutrition, Johns Hopkins): la fibra es primera línea para estreñimiento funcional; prebióticos mejoran frecuencia y consistencia de heces y modulan la microbiota. Promueve saciedad y control glucémico.',
    solution:
      'Mejora salud intestinal, digestión, elimina gases y desechos, favorece saciedad y flora intestinal. Ideal para estreñimiento, gastritis, control de peso y bienestar digestivo.',
  },
  reset: {
    key: 'reset',
    name: 'AYNI RESET 360°',
    image: 'https://static.wixstatic.com/media/d00cad_6cd9ce232bf544819121d4c1e875ed31~mv2.png',
    evidence:
      '8 superalimentos (amalaki, chía, açaí, calabaza, ciruela, coco, piña, papaya). Fibras naturales y polifenoles que actúan como laxantes suaves y promueven tránsito (evidencia de fibra de Mayo Clinic). Apoyan saciedad y sensación de ligereza. No es un detox médico real; el hígado y riñones realizan esa función.',
    solution:
      'Activa desintoxicación natural, apoya tránsito intestinal, digestión, control de peso y reduce hinchazón abdominal. Ideal para estreñimiento, control de peso y salud digestiva.',
  },
  eboost: {
    key: 'eboost',
    name: 'E BOOST',
    image: 'https://static.wixstatic.com/media/d00cad_7dca5be4a6ce40e5a52ae440f365e828~mv2.webp',
    evidence:
      'Maca negra + guaraná + té negro + yerba mate + mandarina. Cafeína natural + maca aportan estimulación y alerta (Harvard sobre yerba mate y alternativas de café; Mayo sobre bebidas con guaraná). Útil para fatiga diaria y concentración a corto plazo. Advertencia: puede afectar presión arterial o sueño.',
    solution:
      'Energía natural, concentración, potencia y activación. Ideal para fatiga, falta de energía, enfoque mental y rendimiento diario.',
  },
  moravi: {
    key: 'moravi',
    name: 'AYNI MORAVI 360°',
    image: 'https://static.wixstatic.com/media/d00cad_c12053ba0cfa4d6190d573b31df8abbf~mv2.png',
    evidence:
      'Fórmula 8 en 1 de bienestar integral (según línea AYNI 360). Complementa el sistema de energía, limpieza y nutrición celular. Se integra en protocolos de bienestar diario junto a Capucci y Reset para un enfoque 360° de vitalidad.',
    solution: 'Apoyo integral de bienestar funcional. Ideal como complemento de rutina diaria de energía, limpieza y nutrición celular.',
  },
  burn: {
    key: 'burn',
    name: '24 BURN',
    image: 'https://static.wixstatic.com/media/d00cad_66a849dddbfe4d019e036f90ac829e65~mv2.png',
    evidence:
      'Sinergia de limón, alcachofa, fibra de limón, espárrago (fuente natural de L-carnitina), polidextrosa, mix vitamínico, té verde/rojo/negro, citrato de magnesio, manzana, ginseng, brócoli y curcumina. La L-carnitina y los tés ayudan a la oxidación de grasas y al metabolismo energético (evidencia de revisiones sobre carnitina y catequinas del té verde). El ginseng y los antioxidantes apoyan rendimiento físico y recuperación muscular.',
    solution:
      'Activa el metabolismo, optimiza la oxidación de grasa, potencia el rendimiento físico, acelera la recuperación muscular y eleva el estado antioxidante. Ideal para control de peso, fatiga, entrenamiento y bienestar metabólico.',
  },
}

const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function buildWeekMenu(title: string, pool: MealPool): FwpMenu {
  return {
    title,
    days: dayNames.map((day, i) => ({
      day,
      meals: [
        { type: 'Desayuno', desc: pool.desayuno[i % pool.desayuno.length].desc, nutrition: pool.desayuno[i % pool.desayuno.length].tag },
        {
          type: 'Media mañana',
          desc: pool.media_manana[i % pool.media_manana.length].desc,
          nutrition: pool.media_manana[i % pool.media_manana.length].tag,
        },
        { type: 'Almuerzo', desc: pool.almuerzo[i % pool.almuerzo.length].desc, nutrition: pool.almuerzo[i % pool.almuerzo.length].tag },
        { type: 'Merienda', desc: pool.merienda[i % pool.merienda.length].desc, nutrition: pool.merienda[i % pool.merienda.length].tag },
        { type: 'Cena', desc: pool.cena[i % pool.cena.length].desc, nutrition: pool.cena[i % pool.cena.length].tag },
      ],
    })),
  }
}

const mealPools: Record<string, MealPool> = {
  estreñimiento: {
    desayuno: [
      { desc: 'Avena con manzana y semillas de chía + 1 sobre LIV en 250 ml de agua', tag: 'Fibra + prebióticos' },
      { desc: 'Pan integral con palta y 1 sobre LIV', tag: 'Fibra + grasas saludables' },
      { desc: 'Batido de papaya, linaza y agua', tag: 'Fibra soluble' },
    ],
    media_manana: [
      { desc: 'Yogur natural + ciruelas', tag: 'Probióticos + fibra' },
      { desc: 'Papaya en trozos', tag: 'Enzimas digestivas' },
      { desc: 'Puñado de nueces', tag: 'Grasas saludables' },
      { desc: 'Infusión de manzanilla + almendras', tag: 'Digestión suave' },
    ],
    almuerzo: [
      { desc: 'Ensalada de hojas verdes + legumbres + proteína magra + 1 sobre RESET 360°', tag: 'Fibra + superalimentos' },
      { desc: 'Pollo a la plancha con quinua y verduras salteadas', tag: 'Fibra + proteína' },
      { desc: 'Guiso de lentejas con vegetales', tag: 'Fibra vegetal' },
    ],
    merienda: [
      { desc: 'Fruta fresca + puñado de nueces', tag: 'Fibra + grasas saludables' },
      { desc: 'Yogur natural + semillas de chía', tag: 'Probióticos' },
      { desc: 'Bastones de zanahoria y apio', tag: 'Fibra cruda' },
      { desc: '1 sobre RESET 360° en agua', tag: 'Superalimentos' },
    ],
    cena: [
      { desc: 'Sopa de verduras + pescado + 1 sobre LIV', tag: 'Fibra + fácil digestión' },
      { desc: 'Tortilla de claras con espinaca y champiñones', tag: 'Proteína ligera' },
      { desc: 'Puré de zapallo con pollo desmenuzado', tag: 'Fibra + proteína' },
    ],
  },
  gastritis: {
    desayuno: [
      { desc: 'Avena cocida con plátano maduro + 1 sobre LIV', tag: 'Suave + prebióticos' },
      { desc: 'Pan tostado con queso fresco bajo en grasa', tag: 'Bajo residuo' },
      { desc: 'Infusión de manzanilla con tostadas de arroz', tag: 'Digestión ligera' },
    ],
    media_manana: [
      { desc: 'Manzana cocida o compota sin azúcar', tag: 'Fácil digestión' },
      { desc: 'Galletas de arroz', tag: 'Suave' },
      { desc: 'Yogur natural descremado', tag: 'Suave + probióticos' },
      { desc: 'Infusión de manzanilla', tag: 'Calmante digestivo' },
    ],
    almuerzo: [
      { desc: 'Arroz blanco + pollo a la plancha + zanahoria cocida', tag: 'Bajo residuo' },
      { desc: 'Pescado al vapor con puré de papa', tag: 'Digestión ligera' },
      { desc: 'Sopa de fideos con pollo desmenuzado', tag: 'Suave' },
    ],
    merienda: [
      { desc: 'Galletas de arroz + queso fresco', tag: 'Suave' },
      { desc: 'Compota de manzana', tag: 'Fácil digestión' },
      { desc: 'Infusión de manzanilla + 1 sobre LIV', tag: 'Digestivo + fibra' },
      { desc: 'Plátano maduro', tag: 'Suave' },
    ],
    cena: [
      { desc: 'Puré de calabaza + pescado blanco + 1 sobre LIV (noche)', tag: 'Digestión ligera' },
      { desc: 'Sopa de zapallo con pollo hervido', tag: 'Bajo residuo' },
      { desc: 'Tortilla de claras al vapor con zanahoria', tag: 'Proteína suave' },
    ],
  },
  dolor_huesos: {
    desayuno: [
      { desc: 'Huevos + espinacas + 1 sobre RENÖVA+ en agua o jugo', tag: 'Proteína + colágeno' },
      { desc: 'Yogur griego con almendras y miel', tag: 'Calcio + proteína' },
      { desc: 'Batido de leche, plátano y 1 sobre RENÖVA+', tag: 'Colágeno + calcio' },
    ],
    media_manana: [
      { desc: 'Yogur griego + almendras', tag: 'Calcio + proteína' },
      { desc: 'Queso fresco + nueces', tag: 'Calcio + omega-3' },
      { desc: 'Fruta + semillas de sésamo', tag: 'Calcio vegetal' },
      { desc: '1 sobre RENÖVA+ en agua', tag: 'Colágeno' },
    ],
    almuerzo: [
      { desc: 'Salmón o sardinas + ensalada de hojas verdes + quinoa', tag: 'Omega-3 + minerales' },
      { desc: 'Pollo al horno con brócoli y batata', tag: 'Proteína + vitaminas' },
      { desc: 'Guiso de garbanzos con espinaca', tag: 'Calcio vegetal + fibra' },
    ],
    merienda: [
      { desc: 'Batido de frutas + 1 sobre RENÖVA+', tag: 'Colágeno + antioxidantes' },
      { desc: 'Yogur natural con nueces', tag: 'Calcio + omega-3' },
      { desc: 'Queso fresco con tomate cherry', tag: 'Calcio' },
      { desc: 'Infusión + almendras', tag: 'Minerales' },
    ],
    cena: [
      { desc: 'Pollo + brócoli + batata', tag: 'Proteína + vitaminas' },
      { desc: 'Merluza a la plancha con espinaca salteada', tag: 'Omega-3 + calcio' },
      { desc: 'Tortilla de claras con champiñones + 1 sobre RENÖVA+', tag: 'Colágeno nocturno' },
    ],
  },
  fatiga: {
    desayuno: [
      { desc: 'Avena + plátano + 1 sobre CAPUCCI 360°', tag: 'Energía + maca' },
      { desc: 'Huevos revueltos + tostada integral', tag: 'Proteína + energía' },
      { desc: 'Batido de frutos rojos + 1 sobre E BOOST', tag: 'Estimulación natural' },
    ],
    media_manana: [
      { desc: 'Frutos secos + fruta', tag: 'Grasas + carbohidratos' },
      { desc: 'Yogur con granola', tag: 'Energía sostenida' },
      { desc: '1 sobre E BOOST en agua', tag: 'Energía natural' },
      { desc: 'Plátano con mantequilla de maní', tag: 'Energía rápida' },
    ],
    almuerzo: [
      { desc: 'Proteína magra + arroz integral + vegetales', tag: 'Energía estable' },
      { desc: 'Pollo con quinoa y ensalada', tag: 'Proteína + minerales' },
      { desc: 'Pescado con camote y verduras', tag: 'Energía + omega-3' },
    ],
    merienda: [
      { desc: 'Yogur + 1 sobre E BOOST', tag: 'Estimulación natural' },
      { desc: 'Fruta + nueces', tag: 'Energía natural' },
      { desc: 'Café CAPUCCI 360° con leche vegetal', tag: 'Energía + concentración' },
      { desc: 'Batido de banana y avena', tag: 'Carbohidratos de calidad' },
    ],
    cena: [
      { desc: 'Pescado + ensalada + 1 sobre CAPUCCI (versión suave si es tarde)', tag: 'Recuperación' },
      { desc: 'Pollo a la plancha con vegetales al vapor', tag: 'Proteína ligera' },
      { desc: 'Sopa de verduras con huevo', tag: 'Digestión ligera' },
    ],
  },
  estres: {
    desayuno: [
      { desc: 'Avena + frutos rojos + 1 sobre CAPUCCI 360°', tag: 'Enfoque + adaptógenos' },
      { desc: 'Tostada integral con palta', tag: 'Grasas saludables' },
      { desc: 'Batido verde con espinaca y manzana', tag: 'Antioxidantes' },
    ],
    media_manana: [
      { desc: 'Infusión de manzanilla + nueces', tag: 'Calmante' },
      { desc: 'Yogur con semillas de chía', tag: 'Magnesio' },
      { desc: 'Fruta fresca', tag: 'Vitaminas' },
      { desc: '1 sobre MORAVI 360° en agua', tag: 'Bienestar integral' },
    ],
    almuerzo: [
      { desc: 'Salmón + quinoa + vegetales de hoja', tag: 'Omega-3' },
      { desc: 'Pollo con arroz integral y brócoli', tag: 'Proteína + fibra' },
      { desc: 'Ensalada de garbanzos con verduras', tag: 'Fibra + magnesio' },
    ],
    merienda: [
      { desc: 'Chocolate negro 70 % + 1 sobre MORAVI 360°', tag: 'Bienestar integral' },
      { desc: 'Infusión de tilo + almendras', tag: 'Relajante' },
      { desc: 'Yogur con fruta', tag: 'Calma digestiva' },
      { desc: 'Té verde + nueces', tag: 'Antioxidantes' },
    ],
    cena: [
      { desc: 'Sopa de verduras + pavo + 1 sobre LIV', tag: 'Digestión + calma' },
      { desc: 'Pescado al horno con espárragos', tag: 'Magnesio + omega-3' },
      { desc: 'Tortilla de vegetales', tag: 'Ligero' },
    ],
  },
  piel: {
    desayuno: [
      { desc: 'Smoothie de berries + 1 sobre RENÖVA+', tag: 'Colágeno + antioxidantes' },
      { desc: 'Huevos con espinaca y tomate', tag: 'Proteína + vitamina C' },
      { desc: 'Yogur con semillas de girasol', tag: 'Vitamina E' },
    ],
    media_manana: [
      { desc: 'Zanahoria + hummus', tag: 'Vitamina A' },
      { desc: 'Fruta cítrica', tag: 'Vitamina C' },
      { desc: 'Nueces + semillas de calabaza', tag: 'Zinc' },
      { desc: '1 sobre RENÖVA+ en agua', tag: 'Colágeno' },
    ],
    almuerzo: [
      { desc: 'Salmón + aguacate + ensalada', tag: 'Omega-3 + grasas' },
      { desc: 'Pollo con quinoa y vegetales de color', tag: 'Antioxidantes' },
      { desc: 'Atún con ensalada de hojas verdes', tag: 'Proteína + omega-3' },
    ],
    merienda: [
      { desc: 'Yogur + semillas de girasol', tag: 'Zinc + vitamina E' },
      { desc: 'Batido de papaya y linaza', tag: 'Antioxidantes' },
      { desc: 'Fruta + almendras', tag: 'Vitamina E' },
      { desc: '1 sobre RENÖVA+ en jugo', tag: 'Colágeno' },
    ],
    cena: [
      { desc: 'Pollo + brócoli + 1 sobre RENÖVA+ (noche)', tag: 'Reparación nocturna' },
      { desc: 'Pescado con espárragos', tag: 'Antioxidantes' },
      { desc: 'Tortilla de claras con vegetales', tag: 'Proteína ligera' },
    ],
  },
  menopausia: {
    desayuno: [
      { desc: 'Avena + semilla de lino + 1 sobre RENÖVA+ o CAPUCCI', tag: 'Colágeno + maca' },
      { desc: 'Yogur con frutos rojos', tag: 'Calcio + antioxidantes' },
      { desc: 'Tostada integral con palta y huevo', tag: 'Proteína + grasas buenas' },
    ],
    media_manana: [
      { desc: 'Yogur + almendras', tag: 'Calcio' },
      { desc: 'Fruta + nueces', tag: 'Fitoestrógenos naturales' },
      { desc: '1 sobre CAPUCCI 360° en agua', tag: 'Energía + maca' },
      { desc: 'Infusión de manzanilla', tag: 'Calma' },
    ],
    almuerzo: [
      { desc: 'Salmón + quinoa + vegetales', tag: 'Proteína + omega-3' },
      { desc: 'Pollo con garbanzos y espinaca', tag: 'Calcio vegetal' },
      { desc: 'Pescado blanco con verduras al vapor', tag: 'Proteína ligera' },
    ],
    merienda: [
      { desc: 'Fruta + 1 sobre MORAVI 360°', tag: 'Bienestar integral' },
      { desc: 'Yogur con semillas de lino', tag: 'Fitoestrógenos' },
      { desc: 'Queso fresco con nueces', tag: 'Calcio' },
      { desc: '1 sobre RENÖVA+ en jugo', tag: 'Colágeno' },
    ],
    cena: [
      { desc: 'Pollo + brócoli + batata', tag: 'Nutrientes óseos' },
      { desc: 'Pescado con espárragos y quinoa', tag: 'Proteína + minerales' },
      { desc: 'Sopa de verduras con huevo', tag: 'Ligero + calcio' },
    ],
  },
  peso: {
    desayuno: [
      { desc: 'Avena + 1 sobre LIV o RESET 360° en ayunas', tag: 'Fibra + saciedad' },
      { desc: 'Huevos con vegetales salteados', tag: 'Proteína + saciedad' },
      { desc: 'Yogur descremado con fruta', tag: 'Proteína ligera' },
    ],
    media_manana: [
      { desc: 'Manzana + puñado de almendras', tag: 'Fibra + proteína' },
      { desc: 'Yogur griego light', tag: 'Proteína' },
      { desc: 'Bastones de vegetales', tag: 'Bajo en calorías' },
      { desc: '1 sobre RESET 360° en agua', tag: 'Saciedad natural' },
    ],
    almuerzo: [
      { desc: 'Ensalada grande + proteína magra + 1 sobre RESET', tag: 'Volumen + control' },
      { desc: 'Pollo a la plancha con vegetales al vapor', tag: 'Bajo en grasa' },
      { desc: 'Pescado con ensalada de hojas verdes', tag: 'Proteína magra' },
    ],
    merienda: [
      { desc: 'Yogur griego light', tag: 'Proteína' },
      { desc: 'Fruta fresca', tag: 'Fibra natural' },
      { desc: '1 sobre LIV en agua', tag: 'Fibra + saciedad' },
      { desc: 'Bastones de zanahoria y pepino', tag: 'Bajo en calorías' },
    ],
    cena: [
      { desc: 'Verduras al vapor + pescado + 1 sobre LIV', tag: 'Baja densidad calórica' },
      { desc: 'Ensalada de pollo con vegetales', tag: 'Proteína ligera' },
      { desc: 'Sopa de verduras con tofu', tag: 'Bajo en calorías' },
    ],
  },
  concentracion: {
    desayuno: [
      { desc: 'Huevos + aguacate + 1 sobre CAPUCCI 360° o E BOOST', tag: 'Proteína + estimulación' },
      { desc: 'Avena con nueces y arándanos', tag: 'Omega-3 + antioxidantes' },
      { desc: 'Batido de espinaca y plátano', tag: 'Vitaminas + energía' },
    ],
    media_manana: [
      { desc: 'Nueces + arándanos', tag: 'Omega-3 + antioxidantes' },
      { desc: '1 sobre E BOOST en agua', tag: 'Boost mental' },
      { desc: 'Yogur con semillas de chía', tag: 'Concentración' },
      { desc: 'Fruta cítrica', tag: 'Vitamina C' },
    ],
    almuerzo: [
      { desc: 'Salmón + quinoa + vegetales', tag: 'Cerebro' },
      { desc: 'Pollo con arroz integral y brócoli', tag: 'Proteína + fibra' },
      { desc: 'Atún con ensalada de hojas verdes', tag: 'Omega-3' },
    ],
    merienda: [
      { desc: 'Chocolate negro + 1 sobre E BOOST', tag: 'Boost mental' },
      { desc: 'Café CAPUCCI 360°', tag: 'Enfoque' },
      { desc: 'Fruta + nueces', tag: 'Energía sostenida' },
      { desc: 'Yogur con granola', tag: 'Energía' },
    ],
    cena: [
      { desc: 'Pavo + batata + 1 sobre MORAVI', tag: 'Recuperación' },
      { desc: 'Pescado con vegetales al vapor', tag: 'Omega-3 ligero' },
      { desc: 'Tortilla de claras con espinaca', tag: 'Proteína ligera' },
    ],
  },
  infertilidad: {
    desayuno: [
      { desc: 'Avena + maca (CAPUCCI 360°) + frutas', tag: 'Maca + energía' },
      { desc: 'Huevos con espinaca', tag: 'Proteína + zinc' },
      { desc: 'Batido de frutos rojos y semillas de calabaza', tag: 'Antioxidantes + zinc' },
    ],
    media_manana: [
      { desc: 'Yogur + semillas de calabaza', tag: 'Zinc' },
      { desc: 'Frutos secos', tag: 'Vitalidad' },
      { desc: '1 sobre CAPUCCI 360° en agua', tag: 'Maca + energía' },
      { desc: 'Fruta fresca', tag: 'Vitaminas' },
    ],
    almuerzo: [
      { desc: 'Salmón + vegetales + quinoa', tag: 'Omega-3 + nutrientes' },
      { desc: 'Pollo con espinaca y garbanzos', tag: 'Zinc + hierro' },
      { desc: 'Pescado blanco con verduras', tag: 'Proteína ligera' },
    ],
    merienda: [
      { desc: 'Frutos secos + 1 sobre CAPUCCI', tag: 'Vitalidad' },
      { desc: 'Yogur con semillas de girasol', tag: 'Zinc' },
      { desc: 'Fruta + nueces', tag: 'Energía' },
      { desc: '1 sobre RENÖVA+ en jugo', tag: 'Colágeno + antioxidantes' },
    ],
    cena: [
      { desc: 'Pollo + brócoli + 1 sobre RENÖVA+', tag: 'Colágeno + minerales' },
      { desc: 'Pescado con espárragos', tag: 'Antioxidantes' },
      { desc: 'Sopa de verduras con huevo', tag: 'Ligero' },
    ],
  },
  general: {
    desayuno: [
      { desc: 'Avena + berries + 1 sobre CAPUCCI o RENÖVA+', tag: 'Energía + colágeno' },
      { desc: 'Huevos con tostada integral', tag: 'Proteína equilibrada' },
      { desc: 'Yogur con granola y fruta', tag: 'Energía sostenida' },
    ],
    media_manana: [
      { desc: 'Fruta + nueces', tag: 'Nutrientes' },
      { desc: 'Yogur natural', tag: 'Probióticos' },
      { desc: '1 sobre MORAVI 360° en agua', tag: 'Bienestar integral' },
      { desc: 'Bastones de vegetales', tag: 'Fibra' },
    ],
    almuerzo: [
      { desc: 'Proteína + vegetales + grano integral', tag: 'Equilibrio' },
      { desc: 'Pollo con quinoa y ensalada', tag: 'Proteína + fibra' },
      { desc: 'Pescado con arroz integral', tag: 'Omega-3' },
    ],
    merienda: [
      { desc: 'Yogur + 1 sobre LIV o MORAVI', tag: 'Digestión + bienestar' },
      { desc: 'Fruta fresca', tag: 'Vitaminas' },
      { desc: 'Frutos secos', tag: 'Grasas saludables' },
      { desc: 'Infusión + galletas integrales', tag: 'Snack ligero' },
    ],
    cena: [
      { desc: 'Pescado + ensalada + 1 sobre RESET (2-3 veces/semana)', tag: 'Limpieza ligera' },
      { desc: 'Pollo a la plancha con vegetales', tag: 'Proteína ligera' },
      { desc: 'Sopa de verduras', tag: 'Ligero' },
    ],
  },
  default: {
    desayuno: [
      { desc: 'Avena + fruta + 1 sobre CAPUCCI 360°', tag: 'Energía' },
      { desc: 'Huevos con tostada integral', tag: 'Proteína' },
      { desc: 'Yogur con granola', tag: 'Energía sostenida' },
    ],
    media_manana: [
      { desc: 'Frutos secos', tag: 'Snack saludable' },
      { desc: 'Fruta fresca', tag: 'Vitaminas' },
      { desc: 'Yogur natural', tag: 'Probióticos' },
      { desc: '1 sobre MORAVI 360° en agua', tag: 'Bienestar integral' },
    ],
    almuerzo: [
      { desc: 'Proteína + vegetales + grano', tag: 'Equilibrio' },
      { desc: 'Pollo con arroz integral y ensalada', tag: 'Proteína + fibra' },
      { desc: 'Pescado con vegetales al vapor', tag: 'Omega-3' },
    ],
    merienda: [
      { desc: 'Yogur + 1 sobre LIV', tag: 'Digestión' },
      { desc: 'Fruta + nueces', tag: 'Energía' },
      { desc: 'Bastones de vegetales', tag: 'Fibra' },
      { desc: 'Infusión ligera', tag: 'Hidratación' },
    ],
    cena: [
      { desc: 'Pescado o pollo + ensalada', tag: 'Ligero' },
      { desc: 'Sopa de verduras con proteína magra', tag: 'Digestión ligera' },
      { desc: 'Tortilla de claras con vegetales', tag: 'Proteína ligera' },
    ],
  },
}

const nutritionalMenus: Record<string, FwpMenu> = {
  estreñimiento: buildWeekMenu('Menú semanal para tránsito intestinal', mealPools.estreñimiento),
  gastritis: buildWeekMenu('Menú semanal suave para molestias digestivas', mealPools.gastritis),
  dolor_huesos: buildWeekMenu('Menú semanal de soporte óseo y articular', mealPools.dolor_huesos),
  fatiga: buildWeekMenu('Menú semanal de energía sostenida', mealPools.fatiga),
  estres: buildWeekMenu('Menú semanal de apoyo al manejo del estrés', mealPools.estres),
  piel: buildWeekMenu('Menú semanal de soporte cutáneo', mealPools.piel),
  menopausia: buildWeekMenu('Menú semanal de apoyo en menopausia', mealPools.menopausia),
  peso: buildWeekMenu('Menú semanal de control de peso y saciedad', mealPools.peso),
  concentracion: buildWeekMenu('Menú semanal de enfoque y claridad mental', mealPools.concentracion),
  infertilidad: buildWeekMenu('Menú semanal de vitalidad', mealPools.infertilidad),
  general: buildWeekMenu('Menú semanal de bienestar general y prevención', mealPools.general),
  default: buildWeekMenu('Menú semanal de bienestar general', mealPools.default),
}

function prettyList(values: string[]): string {
  return values.join(', ').replace(/_/g, ' ')
}

export function buildFwpConsultReport(form: FwpConsultForm): FwpConsultReport {
  const height = form.height || 0
  const weight = form.weight || 0
  let bmi = '—'
  let bmiLabel = '—'
  let bmiValue = 0
  if (height && weight) {
    const hM = height / 100
    bmiValue = weight / (hM * hM)
    bmi = bmiValue.toFixed(1)
    if (bmiValue < 18.5) bmiLabel = 'Bajo peso'
    else if (bmiValue < 25) bmiLabel = 'Peso saludable'
    else if (bmiValue < 30) bmiLabel = 'Sobrepeso'
    else bmiLabel = 'Obesidad'
  }

  const findings: string[] = []
  if (bmiValue > 0) findings.push(`Índice de masa corporal (IMC): ${bmi} – ${bmiLabel}.`)
  findings.push(
    form.conditions.length > 0
      ? `Condiciones / dolencias reportadas: ${prettyList(form.conditions)}.`
      : 'Condiciones reportadas: ninguna específica.',
  )
  if (form.stress === 'alto') findings.push('Nivel de estrés: alto.')
  if ((form.sleep || 0) > 0 && (form.sleep || 0) < 6) findings.push(`Sueño: insuficiente (${form.sleep} h).`)
  if (form.family_conditions.length > 0) findings.push(`Antecedentes familiares: ${prettyList(form.family_conditions)}.`)
  if (form.mental_conditions.length > 0) findings.push(`Salud mental diagnosticada: ${prettyList(form.mental_conditions)}.`)
  if (form.mental_health_rating === 'mala' || form.mental_health_rating === 'regular') {
    findings.push(`Autoevaluación de salud mental: ${form.mental_health_rating}.`)
  }
  if (form.symptoms.length > 0) findings.push(`Síntomas específicos: ${prettyList(form.symptoms)}.`)
  if (form.athlete === 'yes') findings.push(`Actividad física: deportista / entrenamiento ${form.training_frequency || 'regular'}.`)
  if (form.smoking === 'actual') findings.push('Tabaco: fumador actual.')
  if (form.alcohol === 'diario') findings.push('Alcohol: consumo diario.')

  const keys: string[] = []
  const push = (key: string) => {
    if (!keys.includes(key)) keys.push(key)
  }

  const c = form.conditions
  if (c.includes('dolor_huesos') || ((form.age || 0) > 45 && form.gender === 'femenino') || c.includes('piel') || c.includes('menopausia')) {
    push('renova')
  }
  if (c.includes('fatiga') || c.includes('estres') || c.includes('concentracion') || c.includes('infertilidad') || form.stress === 'alto') {
    push('capucci')
  }
  if (c.includes('estreñimiento') || c.includes('gastritis') || c.includes('peso')) {
    push('liv')
  }
  if (c.includes('estreñimiento') || c.includes('peso') || c.includes('gastritis')) {
    push('reset')
  }
  if (c.includes('fatiga') || c.includes('concentracion') || ((form.sleep || 0) < 6 && form.exercise === 'nunca')) {
    push('eboost')
  }
  if (c.includes('peso') || c.includes('fatiga') || c.includes('general') || form.exercise === '3-5' || form.exercise === 'diario') {
    push('burn')
  }
  if (c.includes('general') || form.supplements_interest === 'yes' || keys.length === 0) {
    push('moravi')
  }

  if (form.family_conditions.includes('huesos_articulaciones') || form.family_conditions.includes('hormonales')) push('renova')
  if (
    form.mental_conditions.includes('ansiedad') ||
    form.mental_conditions.includes('estres_cronico') ||
    form.mental_symptoms.includes('dificultad_concentracion') ||
    form.mental_health_rating === 'mala' ||
    form.mental_health_rating === 'regular'
  ) {
    push('capucci')
  }
  if (form.symptoms.includes('hinchazon_abdominal') || form.diet_type === 'baja_en_fibra' || form.meals_per_day === '1-2') {
    push('liv')
    push('reset')
  }
  if (form.symptoms.includes('dolor_articular_matutino') || form.symptoms.includes('piel_opaca') || form.symptoms.includes('caida_cabello')) {
    push('renova')
  }
  if (form.symptoms.includes('bajo_rendimiento') || form.symptoms.includes('libido_baja')) push('capucci')
  if (form.athlete === 'yes' || form.training_frequency === 'intensivo' || form.training_frequency === 'regular') {
    push('burn')
    push('eboost')
  }
  if (form.diet_type === 'alta_en_procesados' || form.family_conditions.includes('obesidad')) push('reset')

  const menuPriority = [
    'estreñimiento',
    'gastritis',
    'dolor_huesos',
    'fatiga',
    'estres',
    'piel',
    'menopausia',
    'peso',
    'concentracion',
    'infertilidad',
    'general',
  ]
  let menuKey = 'default'
  for (const cond of menuPriority) {
    if (c.includes(cond)) {
      menuKey = cond
      break
    }
  }

  const sleep = form.sleep || 0
  let sleepAdvice = 'Según la Mayo Clinic, los adultos necesitan 7-9 horas de sueño. Mantén un horario regular.'
  if (sleep > 0 && sleep < 6) sleepAdvice += ' Tu reporte indica sueño insuficiente; priorízalo.'
  if (form.mental_symptoms.includes('dificultad_concentracion') || form.mental_conditions.includes('insomnio')) {
    sleepAdvice += ' Mejorar el sueño ayuda directamente a tu concentración y salud mental.'
  }
  let stressAdvice =
    'Según Harvard Health, técnicas de respiración, meditación mindfulness y yoga ayudan a reducir el estrés. Practica diariamente.'
  if (form.stress === 'alto') stressAdvice += ' Tu nivel de estrés es alto; empieza con 5-10 minutos diarios.'
  if (form.mental_conditions.includes('ansiedad') || form.mental_symptoms.includes('ansiedad_excesiva')) {
    stressAdvice += ' Considera acompañarlo con apoyo profesional si los síntomas persisten.'
  }
  let waterAdvice = 'Mayo Clinic recomienda ~3.7 L (hombres) y ~2.7 L (mujeres) de fluidos totales al día.'
  if (form.symptoms.includes('hinchazon_abdominal')) waterAdvice += ' Una buena hidratación favorece el tránsito intestinal.'
  let exerciseAdvice =
    'Johns Hopkins recomienda empezar con ejercicios cortos en casa (sentadillas de silla, equilibrio). 5-10 min diarios.'
  if (form.athlete === 'yes' || form.training_frequency === 'intensivo') {
    exerciseAdvice =
      'Johns Hopkins destaca la importancia de una recuperación muscular adecuada y una nutrición de soporte en entrenamientos intensivos; cuida la hidratación y el descanso entre sesiones.'
  }
  let habitsAdvice = ''
  if (form.smoking === 'actual') {
    habitsAdvice += 'El tabaco activo reduce la absorción de nutrientes clave (vitamina C, zinc) y afecta la piel y la circulación. '
  }
  if (form.alcohol === 'diario' || form.alcohol === 'semanal') {
    habitsAdvice += 'Un consumo frecuente de alcohol sobrecarga la función hepática; modera su ingesta y prioriza la hidratación.'
  }

  const advice: FwpAdvice[] = [
    { title: 'Sueño adecuado', body: sleepAdvice },
    { title: 'Manejo del estrés', body: stressAdvice },
    { title: 'Consumo de agua', body: waterAdvice },
    { title: 'Ejercicio', body: exerciseAdvice },
  ]
  if (habitsAdvice) advice.push({ title: 'Hábitos a vigilar', body: habitsAdvice })

  return {
    bmi,
    bmiLabel,
    findings,
    products: keys.map((key) => fwpCatalog[key]).filter(Boolean),
    menu: nutritionalMenus[menuKey] || nutritionalMenus.default,
    advice,
  }
}

export function formatFwpConsultReport(form: FwpConsultForm, report: FwpConsultReport): string {
  const productBlock =
    report.products.length > 0
      ? report.products.map((product) => `• ${product.name}: ${product.solution}`)
      : ['• No se identificaron productos FWP específicos para este perfil.']

  return [
    'Q-VITAL · Consulta personalizada FWP',
    `Edad: ${form.age ?? '—'} · Género: ${form.gender || '—'}`,
    '',
    `IMC: ${report.bmi} (${report.bmiLabel})`,
    ...report.findings.map((item) => `• ${item}`),
    '',
    'Recomendaciones de producto (línea FWP):',
    ...productBlock,
    '',
    report.menu.title,
    ...report.menu.days.flatMap((day) => [
      day.day,
      ...day.meals.map((meal) => `  ${meal.type}: ${meal.desc} (${meal.nutrition})`),
    ]),
    '',
    ...report.advice.map((item) => `${item.title}: ${item.body}`),
    '',
    'Estos son suplementos alimenticios, no medicamentos. No tratan ni curan enfermedades. Consulta siempre a un profesional de la salud.',
  ].join('\n')
}
