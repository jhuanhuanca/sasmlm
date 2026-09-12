/**
 * Motor de consulta personalizada — solo línea Health Green World (HGW).
 * Otras empresas del catálogo se conectarán más adelante.
 */
import {
  chronicConditions,
  consultBmi,
  familyConditions,
  mentalConditions,
  mentalSymptoms,
  recentSymptoms,
  type ConsultForm,
} from '@/data/wellnessConsult'

export type HgwProductCard = {
  key: string
  name: string
  image: string
  summary: string
}

export type HgwMeal = {
  type: string
  desc: string
  nutrition: string
}

export type HgwMenu = {
  title: string
  days: Array<{ day: string; meals: HgwMeal[] }>
}

export type HgwAdvice = {
  title: string
  body: string
}

export type HgwConsultReport = {
  bmi: string
  bmiLabel: string
  findings: string[]
  products: HgwProductCard[]
  menu: HgwMenu
  advice: HgwAdvice[]
}

const img = (id: string) => `https://static.wixstatic.com/media/${id}`

export const hgwCatalog: Record<string, HgwProductCard> = {
  diabetes: {
    key: 'diabetes',
    name: 'Chitosan Capsule (300mg × 60)',
    image: img('d00cad_2d8490e803b5464b839d35d2b33bc602~mv2.png'),
    summary:
      'El Chitosan de HGW ayuda a limitar la absorción de grasas y azúcares en el intestino, como apoyo al control de picos de glucosa. No reemplaza medicación ni el control del médico.',
  },
  cardio: {
    key: 'cardio',
    name: 'OMEGA 3-6-9 + Lecithin Softgel',
    image: img('d00cad_d8f4aa6a8de24fb0bac6b07f29212427~mv2.jpg'),
    summary: 'Fórmula HGW de aceites esenciales para apoyar circulación y hábitos cardiovasculares, junto a dieta y control médico.',
  },
  inmune: {
    key: 'inmune',
    name: 'Ganoderma Plus Capsule',
    image: img('d00cad_36925b10a7024a22a864985c6e8ba8a7~mv2.jpg'),
    summary: 'Ganoderma (Reishi) de la línea HGW como apoyo a vitalidad y defensas. No es tratamiento oncológico.',
  },
  huesos: {
    key: 'huesos',
    name: 'Liquid Calcium & Magnesium With Vitamin D',
    image: img('d00cad_54e6bf04c84543809935a380b1d759f8~mv2.jpg'),
    summary: 'Calcio, magnesio y vitamina D en formato líquido HGW para huesos y músculo, como complemento de una dieta adecuada.',
  },
  cerebro: {
    key: 'cerebro',
    name: 'Zinc & Selenio Capsules',
    image: 'https://hgw-bolivia.com/images/43.png',
    summary: 'Zinc y selenio HGW como apoyo nutricional al sistema nervioso y al estado general. No sustituye salud mental profesional.',
  },
  energia: {
    key: 'energia',
    name: 'Cordyceps Capsule',
    image: img('d00cad_0b36c72930184bc59d539dce9280283f~mv2.png'),
    summary: 'Cordyceps HGW para energía y resistencia física. Úsalo como complemento, no como estimulante médico.',
  },
  general: {
    key: 'general',
    name: 'Spirulina Plus Capsule',
    image: img('d00cad_3e5bc0b597ad48589144c327994fb9df~mv2.png'),
    summary: 'Espirulina HGW: proteínas, vitaminas y minerales de la línea para nutrición diaria.',
  },
  stress: {
    key: 'stress',
    name: 'Ashwaganda Coffee',
    image: 'https://hgw-bolivia.com/images/aswaganda-coffee.png',
    summary: 'Café con ashwagandha HGW como ritual de calma. No reemplaza terapia ni medicación para ansiedad.',
  },
  respiratory: {
    key: 'respiratory',
    name: 'Cordyceps Coffee',
    image: img('d00cad_232d19999a9947518d5d44a2c02d773f~mv2.jpg'),
    summary: 'Café con cordyceps HGW para energía y hábito respiratorio cotidiano, siempre junto al neumólogo si hay enfermedad.',
  },
  antioxidants: {
    key: 'antioxidants',
    name: 'Berry Juice',
    image: img('d00cad_1cbb13de958546f3912d3de3e3bf02f8~mv2.jpg'),
    summary: 'Jugo de bayas HGW, fuente de antioxidantes de la línea para el día a día.',
  },
  digestive: {
    key: 'digestive',
    name: 'Probióticos HGW',
    image: 'https://hgw-bolivia.com/images/probioticos.png',
    summary: 'Probióticos HGW para flora intestinal y digestión, como complemento de una dieta ordenada.',
  },
  enzyme: {
    key: 'enzyme',
    name: 'Enzimas HGW',
    image: 'https://hgw-bolivia.com/images/encimas.png',
    summary: 'Enzimas HGW para apoyar la digestión de las comidas.',
  },
  weight: {
    key: 'weight',
    name: 'Pro Shaping Tea',
    image: img('d00cad_f5fceef1bac649339f86ba78a736f92c~mv2.jpg'),
    summary: 'Té Pro Shaping HGW como apoyo a hábitos de peso, nunca como dieta milagro.',
  },
  virus: {
    key: 'virus',
    name: 'Jinpure Tea',
    image: img('d00cad_c9c5e20d35d44956a263f0ca3c8fd7a1~mv2.jpg'),
    summary: 'Té Jinpure HGW para malestares de temporada. Un resfriado grave o fiebre alta es médico.',
  },
  sport: {
    key: 'sport',
    name: 'Bebida Energética',
    image: 'https://hgw-bolivia.com/images/energy-drink.png',
    summary: 'Bebida energética HGW para recuperación post-ejercicio, no para sustituir comida ni hidratación.',
  },
  protein: {
    key: 'protein',
    name: 'Proteína de Soya con Arándano',
    image: img('d00cad_237d48348b95452883a486f13cf0c920~mv2.jpg'),
    summary: 'Proteína de soya HGW para completar la dieta, útil en vegetarianos o deportistas.',
  },
  collagen: {
    key: 'collagen',
    name: 'Péptido de Colágeno',
    image: img('d00cad_c28dcebe48b945949dbfbb67e361bf12~mv2.jpg'),
    summary: 'Colágeno HGW como apoyo a piel y articulaciones dentro de una alimentación completa.',
  },
  vision: {
    key: 'vision',
    name: 'Blueberry Coffee',
    image: 'https://hgw-bolivia.com/images/blueberry-coffee.png',
    summary: 'Café con arándanos HGW para el hábito diario y apoyo antioxidante.',
  },
  lactiberry: {
    key: 'lactiberry',
    name: 'Lactiberry',
    image: img('d00cad_eff62ae10ded48119cb21ac5d3974312~mv2.jpg'),
    summary: 'Lactiberry HGW: arándano y apoyo digestivo de la línea.',
  },
  candy: {
    key: 'candy',
    name: 'Caramelos de Arándano',
    image: img('d00cad_94b83b11ccbf42a0afad48d99bd64685~mv2.jpg'),
    summary: 'Formato práctico de arándano HGW para el día a día.',
  },
  zimocaldiet: {
    key: 'zimocaldiet',
    name: 'Zimocal Diet',
    image: 'https://hgw-bolivia.com/images/0265.png',
    summary: 'Zimocal Diet HGW como apoyo óseo y de hábitos, no como fármaco.',
  },
}

const menuPriority = [
  'diabetes',
  'hipertension',
  'cardiopatia',
  'cancer_gastrico',
  'cancer',
  'gastritis',
  'enfermedad_renal',
  'cirrosis_hepatica',
  'epoc',
  'accidente_cerebrovascular',
  'vih',
  'tuberculosis',
  'chagas',
  'artritis',
  'asma',
  'enfermedades_tiroideas',
] as const

function week(
  title: string,
  days: Array<[string, Array<[string, string, string]>]>,
): HgwMenu {
  return {
    title,
    days: days.map(([day, meals]) => ({
      day,
      meals: meals.map(([type, desc, nutrition]) => ({ type, desc, nutrition })),
    })),
  }
}

const defaultMenu = week('Menú semanal general saludable — línea HGW', [
  ['Lunes', [
    ['Desayuno', 'Batido de frutas con proteína de soya HGW y avena.', '≈320 kcal'],
    ['Almuerzo', 'Pollo a la plancha, arroz integral y ensalada.', '≈460 kcal'],
    ['Cena', 'Pescado a la plancha con vegetales.', '≈320 kcal'],
  ]],
  ['Martes', [
    ['Desayuno', 'Tostadas integrales con palta y huevo.', '≈330 kcal'],
    ['Almuerzo', 'Carne magra, papa al horno y hojas verdes.', '≈480 kcal'],
    ['Cena', 'Sopa de verduras con quinua.', '≈260 kcal'],
  ]],
  ['Miércoles', [
    ['Desayuno', 'Yogur natural con frutas y chía.', '≈260 kcal'],
    ['Almuerzo', 'Pasta integral con vegetales y pollo.', '≈470 kcal'],
    ['Cena', 'Ensalada completa con atún y huevo.', '≈330 kcal'],
  ]],
  ['Jueves', [
    ['Desayuno', 'Pan integral con queso fresco y tomate.', '≈280 kcal'],
    ['Almuerzo', 'Pavo a la plancha con camote y ensalada.', '≈440 kcal'],
    ['Cena', 'Camarones salteados con vegetales.', '≈300 kcal'],
  ]],
  ['Viernes', [
    ['Desayuno', 'Avena con plátano y miel.', '≈310 kcal'],
    ['Almuerzo', 'Trucha al horno con arroz integral.', '≈460 kcal'],
    ['Cena', 'Salteado de pollo y vegetales.', '≈320 kcal'],
  ]],
  ['Sábado', [
    ['Desayuno', 'Yogur con fresas y granola.', '≈270 kcal'],
    ['Almuerzo', 'Pollo al curry con arroz integral.', '≈470 kcal'],
    ['Cena', 'Sopa de verduras con pechuga.', '≈280 kcal'],
  ]],
  ['Domingo', [
    ['Desayuno', 'Omelet de vegetales y pan integral.', '≈300 kcal'],
    ['Almuerzo', 'Guiso de lentejas con verduras.', '≈440 kcal'],
    ['Cena', 'Merluza a la plancha con ensalada.', '≈310 kcal'],
  ]],
])

const menus: Record<string, HgwMenu> = {
  default: defaultMenu,
  diabetes: week('Menú semanal para control de diabetes', [
    ['Lunes', [
      ['Desayuno', 'Avena con canela y manzana, sin azúcar.', '≈290 kcal'],
      ['Almuerzo', 'Pechuga a la plancha, quinua y ensalada.', '≈420 kcal'],
      ['Cena', 'Merluza al vapor con brócoli.', '≈300 kcal'],
    ]],
    ['Martes', [
      ['Desayuno', 'Huevos con espinaca y pan integral.', '≈300 kcal'],
      ['Almuerzo', 'Res magra, lenteja y ensalada verde.', '≈450 kcal'],
      ['Cena', 'Tortilla de claras con champiñones.', '≈230 kcal'],
    ]],
    ['Miércoles', [
      ['Desayuno', 'Batido de proteína de soya HGW con leche vegetal.', '≈260 kcal'],
      ['Almuerzo', 'Pollo suave con arroz integral y zapallo.', '≈460 kcal'],
      ['Cena', 'Sopa de verduras con pollo.', '≈280 kcal'],
    ]],
    ['Jueves', [
      ['Desayuno', 'Pan integral, queso fresco y tomate.', '≈270 kcal'],
      ['Almuerzo', 'Trucha al horno con quinua.', '≈430 kcal'],
      ['Cena', 'Ensalada de atún con hojas verdes.', '≈310 kcal'],
    ]],
    ['Viernes', [
      ['Desayuno', 'Avena con frutos rojos y lino.', '≈290 kcal'],
      ['Almuerzo', 'Pavo a la plancha con camote.', '≈440 kcal'],
      ['Cena', 'Camarones con vegetales y limón.', '≈290 kcal'],
    ]],
    ['Sábado', [
      ['Desayuno', 'Yogur sin azúcar con fresas y chía.', '≈220 kcal'],
      ['Almuerzo', 'Pollo al horno con ensalada de garbanzos.', '≈460 kcal'],
      ['Cena', 'Tofu con brócoli y pimientos.', '≈300 kcal'],
    ]],
    ['Domingo', [
      ['Desayuno', 'Omelet de claras y champiñones.', '≈240 kcal'],
      ['Almuerzo', 'Guiso de lentejas y poco arroz integral.', '≈420 kcal'],
      ['Cena', 'Merluza con espinaca.', '≈300 kcal'],
    ]],
  ]),
  hipertension: week('Menú semanal para hipertensión (bajo en sal)', [
    ['Lunes', [
      ['Desayuno', 'Avena con plátano y lino, sin sal.', '≈320 kcal'],
      ['Almuerzo', 'Pollo hervido, quinua y ensalada con aceite de oliva.', '≈430 kcal'],
      ['Cena', 'Pescado blanco al vapor con verduras.', '≈300 kcal'],
    ]],
    ['Martes', [
      ['Desayuno', 'Pan integral, palta y huevo pochado.', '≈320 kcal'],
      ['Almuerzo', 'Lentejas sin sal con camote.', '≈440 kcal'],
      ['Cena', 'Pavo a la plancha con pepino y apio.', '≈320 kcal'],
    ]],
    ['Miércoles', [
      ['Desayuno', 'Batido de espinaca, manzana y pepino.', '≈120 kcal'],
      ['Almuerzo', 'Salmón al horno, arroz integral y espárragos.', '≈470 kcal'],
      ['Cena', 'Sopa de verduras sin sal con pollo.', '≈280 kcal'],
    ]],
    ['Jueves', [
      ['Desayuno', 'Yogur con manzana y avena.', '≈270 kcal'],
      ['Almuerzo', 'Atún al natural con quinua.', '≈420 kcal'],
      ['Cena', 'Claras con vegetales, sin sal.', '≈220 kcal'],
    ]],
    ['Viernes', [
      ['Desayuno', 'Avena con fresas y chía.', '≈300 kcal'],
      ['Almuerzo', 'Pollo con pasta integral y tomate.', '≈450 kcal'],
      ['Cena', 'Trucha al vapor con zapallo.', '≈310 kcal'],
    ]],
    ['Sábado', [
      ['Desayuno', 'Pan integral, requesón y tomate.', '≈260 kcal'],
      ['Almuerzo', 'Garbanzos con vegetales y arroz integral.', '≈440 kcal'],
      ['Cena', 'Pollo a la plancha y ensalada.', '≈380 kcal'],
    ]],
    ['Domingo', [
      ['Desayuno', 'Tortilla de claras con espinaca.', '≈250 kcal'],
      ['Almuerzo', 'Merluza, quinua y brócoli.', '≈420 kcal'],
      ['Cena', 'Sopa de zapallo con cúrcuma, sin sal.', '≈180 kcal'],
    ]],
  ]),
  gastritis: week('Menú semanal suave para gastritis', [
    ['Lunes', [
      ['Desayuno', 'Avena suave con plátano maduro.', '≈300 kcal'],
      ['Almuerzo', 'Pollo hervido, arroz blanco y zanahoria.', '≈400 kcal'],
      ['Cena', 'Sopa de zanahoria y camote.', '≈280 kcal'],
    ]],
    ['Martes', [
      ['Desayuno', 'Pan integral, requesón y plátano.', '≈290 kcal'],
      ['Almuerzo', 'Pescado blanco, arroz y espárragos.', '≈390 kcal'],
      ['Cena', 'Crema de zapallo sin condimentos fuertes.', '≈200 kcal'],
    ]],
    ['Miércoles', [
      ['Desayuno', 'Yogur, avena y papaya.', '≈270 kcal'],
      ['Almuerzo', 'Pavo hervido con quinua.', '≈420 kcal'],
      ['Cena', 'Fideos integrales con pollo bien cocido.', '≈300 kcal'],
    ]],
    ['Jueves', [
      ['Desayuno', 'Claras con espinaca y pan integral.', '≈250 kcal'],
      ['Almuerzo', 'Lentejas suaves con arroz y zanahoria.', '≈400 kcal'],
      ['Cena', 'Merluza al vapor con puré de camote.', '≈340 kcal'],
    ]],
    ['Viernes', [
      ['Desayuno', 'Avena con plátano y canela.', '≈290 kcal'],
      ['Almuerzo', 'Pollo suave, arroz integral y zucchini.', '≈420 kcal'],
      ['Cena', 'Sopa de verduras suaves.', '≈270 kcal'],
    ]],
    ['Sábado', [
      ['Desayuno', 'Pan integral, queso fresco y plátano.', '≈280 kcal'],
      ['Almuerzo', 'Trucha al horno y arroz blanco.', '≈400 kcal'],
      ['Cena', 'Crema de zanahoria y camote.', '≈250 kcal'],
    ]],
    ['Domingo', [
      ['Desayuno', 'Yogur, papaya y avena fina.', '≈270 kcal'],
      ['Almuerzo', 'Pavo con puré de camote.', '≈410 kcal'],
      ['Cena', 'Sopa de arroz con pollo.', '≈280 kcal'],
    ]],
  ]),
  artritis: week('Menú semanal antiinflamatorio para artritis', [
    ['Lunes', [
      ['Desayuno', 'Avena con arándanos, cúrcuma y lino.', '≈310 kcal'],
      ['Almuerzo', 'Salmón, quinua y espinaca.', '≈480 kcal'],
      ['Cena', 'Pollo hervido, brócoli y arroz integral.', '≈400 kcal'],
    ]],
    ['Martes', [
      ['Desayuno', 'Yogur, fresas y chía.', '≈240 kcal'],
      ['Almuerzo', 'Atún, quinua y ensalada.', '≈420 kcal'],
      ['Cena', 'Lentejas con vegetales y aceite de oliva.', '≈400 kcal'],
    ]],
    ['Miércoles', [
      ['Desayuno', 'Pan integral, palta y huevo.', '≈330 kcal'],
      ['Almuerzo', 'Trucha, camote y espárragos.', '≈430 kcal'],
      ['Cena', 'Sopa de zapallo con cúrcuma y pollo.', '≈280 kcal'],
    ]],
    ['Jueves', [
      ['Desayuno', 'Batido de cúrcuma y piña.', '≈260 kcal'],
      ['Almuerzo', 'Salmón, arroz integral y brócoli.', '≈480 kcal'],
      ['Cena', 'Garbanzos con espinaca.', '≈310 kcal'],
    ]],
    ['Viernes', [
      ['Desayuno', 'Avena, plátano y nueces.', '≈360 kcal'],
      ['Almuerzo', 'Pollo, quinua y pimientos.', '≈450 kcal'],
      ['Cena', 'Atún con ensalada de espinaca.', '≈310 kcal'],
    ]],
    ['Sábado', [
      ['Desayuno', 'Yogur, granola y arándanos.', '≈290 kcal'],
      ['Almuerzo', 'Merluza, camote y espinaca.', '≈380 kcal'],
      ['Cena', 'Sopa de zanahoria, cúrcuma y pollo.', '≈290 kcal'],
    ]],
    ['Domingo', [
      ['Desayuno', 'Claras con espinaca y cúrcuma.', '≈230 kcal'],
      ['Almuerzo', 'Trucha, pasta integral y vegetales.', '≈460 kcal'],
      ['Cena', 'Lentejas rojas con vegetales.', '≈380 kcal'],
    ]],
  ]),
  asma: week('Menú semanal de apoyo para asma', [
    ['Lunes', [
      ['Desayuno', 'Avena con manzana, jengibre y miel.', '≈320 kcal'],
      ['Almuerzo', 'Salmón, quinua y espinaca.', '≈480 kcal'],
      ['Cena', 'Pollo, brócoli y arroz integral.', '≈420 kcal'],
    ]],
    ['Martes', [
      ['Desayuno', 'Pan integral, queso fresco y arándanos.', '≈280 kcal'],
      ['Almuerzo', 'Pavo, camote y pimientos.', '≈430 kcal'],
      ['Cena', 'Lentejas con zanahoria y cúrcuma.', '≈380 kcal'],
    ]],
    ['Miércoles', [
      ['Desayuno', 'Yogur, arándanos y chía.', '≈240 kcal'],
      ['Almuerzo', 'Atún, quinua y ensalada.', '≈420 kcal'],
      ['Cena', 'Crema de zanahoria y jengibre.', '≈270 kcal'],
    ]],
    ['Jueves', [
      ['Desayuno', 'Huevos, espinaca y jugo de naranja.', '≈360 kcal'],
      ['Almuerzo', 'Trucha, arroz integral y espárragos.', '≈440 kcal'],
      ['Cena', 'Sopa de verduras con pollo y cúrcuma.', '≈280 kcal'],
    ]],
    ['Viernes', [
      ['Desayuno', 'Batido de manzana, espinaca y jengibre.', '≈270 kcal'],
      ['Almuerzo', 'Garbanzos, pimientos y espinaca.', '≈360 kcal'],
      ['Cena', 'Merluza, camote y zanahoria.', '≈370 kcal'],
    ]],
    ['Sábado', [
      ['Desayuno', 'Avena, plátano, nueces y lino.', '≈360 kcal'],
      ['Almuerzo', 'Pollo, quinua y brócoli.', '≈440 kcal'],
      ['Cena', 'Salmón, pasta integral y espinaca.', '≈470 kcal'],
    ]],
    ['Domingo', [
      ['Desayuno', 'Claras con pimiento y tomate.', '≈230 kcal'],
      ['Almuerzo', 'Pavo, arroz integral y zanahoria.', '≈430 kcal'],
      ['Cena', 'Sopa de zanahoria, cúrcuma y jengibre.', '≈270 kcal'],
    ]],
  ]),
  cardiopatia: week('Menú semanal de apoyo cardiovascular', [
    ['Lunes', [
      ['Desayuno', 'Avena con arándanos, nueces y leche descremada.', '≈340 kcal'],
      ['Almuerzo', 'Salmón, quinua y ensalada de espinaca.', '≈480 kcal'],
      ['Cena', 'Pavo a la plancha con vegetales.', '≈340 kcal'],
    ]],
    ['Martes', [
      ['Desayuno', 'Pan integral, palta y huevo pochado.', '≈330 kcal'],
      ['Almuerzo', 'Lentejas con verduras y arroz integral.', '≈450 kcal'],
      ['Cena', 'Pescado blanco al vapor con brócoli.', '≈300 kcal'],
    ]],
    ['Miércoles', [
      ['Desayuno', 'Yogur, granola sin azúcar y arándanos.', '≈280 kcal'],
      ['Almuerzo', 'Atún con ensalada y pan integral.', '≈420 kcal'],
      ['Cena', 'Crema de zapallo con pan integral.', '≈260 kcal'],
    ]],
    ['Jueves', [
      ['Desayuno', 'Batido de fresas, arándanos y avena.', '≈300 kcal'],
      ['Almuerzo', 'Trucha, quinua y espárragos.', '≈440 kcal'],
      ['Cena', 'Garbanzos con espinaca y tomate.', '≈310 kcal'],
    ]],
    ['Viernes', [
      ['Desayuno', 'Huevos, tomate, espinaca y pan integral.', '≈310 kcal'],
      ['Almuerzo', 'Pavo, pasta integral y pimientos.', '≈460 kcal'],
      ['Cena', 'Camarones con espárragos.', '≈270 kcal'],
    ]],
    ['Sábado', [
      ['Desayuno', 'Panqueques de avena con frutos rojos.', '≈330 kcal'],
      ['Almuerzo', 'Salmón, camote y hojas verdes.', '≈470 kcal'],
      ['Cena', 'Ensalada de garbanzos con aceite de oliva.', '≈300 kcal'],
    ]],
    ['Domingo', [
      ['Desayuno', 'Claras con champiñones.', '≈260 kcal'],
      ['Almuerzo', 'Lentejas con vegetales y pan integral.', '≈420 kcal'],
      ['Cena', 'Sopa de vegetales con pollo.', '≈280 kcal'],
    ]],
  ]),
}

function bmiClass(value: number): string {
  if (value < 18.5) {
    return 'Bajo peso'
  }
  if (value < 25) {
    return 'Peso saludable'
  }
  if (value < 30) {
    return 'Sobrepeso'
  }
  return 'Obesidad'
}

function labels(values: string[], catalog: { value: string; label: string }[]): string {
  return values.map((value) => catalog.find((item) => item.value === value)?.label ?? value).join(', ')
}

export function buildHgwConsultReport(form: ConsultForm): HgwConsultReport {
  const bmi = consultBmi(form)
  const bmiValue = Number(bmi)
  const bmiLabel = bmi === '—' ? '—' : bmiClass(bmiValue)
  const conditions = form.conditions
  const family = form.family_conditions
  const symptoms = form.symptoms
  const mental = form.mental_conditions
  const mentalSymptomsSelected = form.mental_symptoms
  const age = Number(form.age || 0)

  const findings: string[] = []
  if (bmi !== '—') {
    findings.push(`IMC ${bmi} (${bmiLabel}).`)
  }
  findings.push(
    conditions.length
      ? `Condiciones reportadas: ${labels(conditions, chronicConditions)}.`
      : 'Sin condiciones crónicas seleccionadas.',
  )
  if (form.other_conditions.trim()) {
    findings.push(`Otras condiciones: ${form.other_conditions.trim()}.`)
  }
  if (form.current_symptoms.trim()) {
    findings.push(`Síntomas actuales: ${form.current_symptoms.trim()}.`)
  }
  if (family.length) {
    findings.push(`Antecedentes familiares: ${labels(family, familyConditions)}.`)
  }
  if (symptoms.length) {
    findings.push(`Síntomas recientes: ${labels(symptoms, recentSymptoms)}.`)
  }
  if (mental.length || mentalSymptomsSelected.length) {
    findings.push(
      `Salud mental: ${labels([...mental, ...mentalSymptomsSelected], [...mentalConditions, ...mentalSymptoms])}.`,
    )
  }

  const keys: string[] = []
  const add = (...list: string[]) => {
    for (const key of list) {
      if (!keys.includes(key) && hgwCatalog[key]) {
        keys.push(key)
      }
    }
  }

  if (conditions.includes('diabetes') || (family.includes('diabetes') && (bmiValue > 29 || symptoms.includes('sed_excesiva')))) {
    add('diabetes', 'weight', 'lactiberry', 'vision', 'candy', 'cardio', 'energia')
  }
  if (conditions.includes('artritis')) {
    add('energia', 'collagen', 'zimocaldiet')
  }
  if (
    conditions.includes('hipertension') ||
    conditions.includes('cardiopatia') ||
    (family.includes('cardiopatia') && age > 50) ||
    (family.includes('hipertension') && symptoms.includes('dolor_pecho'))
  ) {
    add('cardio')
  }
  if (conditions.includes('cancer') || conditions.includes('cancer_gastrico') || (family.includes('cancer') && symptoms.includes('fatiga'))) {
    add('inmune')
  }
  if (conditions.includes('gastritis') || (family.includes('gastritis') && form.health_rating === 'mala')) {
    add('digestive')
  }
  if ((age > 45 && form.supplements_interest === 'yes') || (age > 45 && symptoms.includes('dolor_pecho'))) {
    add('huesos')
  }
  if (mental.length || mentalSymptomsSelected.length) {
    add('cerebro')
  }
  if (symptoms.includes('fatiga') && (Number(form.sleep || 0) < 6 || form.exercise === 'nunca')) {
    add('energia')
  }
  if (form.stress === 'yes' || mental.includes('ansiedad') || mentalSymptomsSelected.includes('ansiedad_excesiva')) {
    add('stress')
  }
  if (form.health_rating === 'mala' && symptoms.includes('fatiga')) {
    add('respiratory')
  }
  if ((family.includes('cancer') || age > 50) && form.supplements_interest === 'yes') {
    add('antioxidants')
  }
  if ((form.diet_type === 'ninguna' || form.meals_per_day === '1-2') && form.health_rating === 'mala') {
    add('digestive')
  }
  if (form.diet_type === 'ninguna' && conditions.includes('otro')) {
    add('enzyme')
  }
  if (bmiValue > 29) {
    add('weight')
  }
  if (form.health_rating === 'mala' && form.supplements_interest === 'yes') {
    add('virus')
  }
  if (form.athlete === 'yes' && (form.exercise === 'diario' || form.exercise === '3-5' || form.training_frequency === 'intensivo')) {
    add('sport')
  }
  if ((form.diet_type === 'vegetariana' || form.diet_type === 'vegana') && form.supplements_interest === 'yes') {
    add('protein')
  }
  if (age > 40 && form.gender === 'femenino' && form.supplements_interest === 'yes') {
    add('collagen')
  }
  if (age > 40 && form.supplements_interest === 'yes') {
    add('vision')
  }

  const menuAliases: Record<string, string> = {
    diabetes: 'diabetes',
    hipertension: 'hipertension',
    cardiopatia: 'cardiopatia',
    cancer_gastrico: 'gastritis',
    cancer: 'default',
    gastritis: 'gastritis',
    enfermedad_renal: 'default',
    cirrosis_hepatica: 'default',
    epoc: 'asma',
    accidente_cerebrovascular: 'cardiopatia',
    vih: 'default',
    tuberculosis: 'default',
    chagas: 'cardiopatia',
    artritis: 'artritis',
    asma: 'asma',
    enfermedades_tiroideas: 'default',
  }
  let menuKey = 'default'
  for (const condition of menuPriority) {
    if (conditions.includes(condition)) {
      menuKey = menuAliases[condition] ?? 'default'
      break
    }
  }

  const advice: HgwAdvice[] = [
    {
      title: 'Sueño',
      body: 'Los adultos suelen necesitar 7 a 9 horas. Un horario regular ayuda al peso, al ánimo y a la presión. Esto no sustituye evaluación médica si hay insomnio grave.',
    },
    {
      title: 'Estrés',
      body: 'Respiración lenta, caminata y un rato sin pantallas bajan la carga del día. Si hay ansiedad o depresión diagnosticada, el profesional de salud mental manda.',
    },
    {
      title: 'Agua',
      body: 'Bebe según sed, clima y actividad. Con fatiga o diabetes, no dejes la hidratación para el final del día.',
    },
    {
      title: 'Movimiento',
      body: 'Si hoy no entrenas, empieza con 5–10 minutos: sentarte y levantarte de una silla, o caminar. El médico define límites si hay corazón o articulación comprometidos.',
    },
  ]

  return {
    bmi,
    bmiLabel,
    findings,
    products: keys.map((key) => hgwCatalog[key]).filter(Boolean),
    menu: menus[menuKey] ?? defaultMenu,
    advice,
  }
}

export function formatHgwConsultReport(form: ConsultForm, report: HgwConsultReport): string {
  const productBlock =
    report.products.length > 0
      ? report.products.map((product) => `• ${product.name}: ${product.summary}`)
      : ['• No se identificaron productos HGW específicos para este perfil.']

  return [
    'CONSULTA PERSONAL HGW — Health Green World',
    `Edad: ${form.age ?? '—'} · Género: ${form.gender || '—'}`,
    '',
    `IMC: ${report.bmi} (${report.bmiLabel})`,
    ...report.findings.map((item) => `• ${item}`),
    '',
    'Recomendaciones de producto (línea HGW):',
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
    'Esta información se basa en la línea Health Green World (HGW). No sustituye el consejo médico profesional. Consulte siempre a su médico antes de iniciar cualquier suplemento.',
  ].join('\n')
}
