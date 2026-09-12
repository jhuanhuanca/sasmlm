export type ImcGoal = 'lose_weight' | 'gain_weight'

export type ImcProduct = {
  name: string
  usage: string
}

export type ImcPackage = {
  id: ImcGoal | number | string
  goal?: string
  title: string
  focus: string
  products: ImcProduct[]
}

export function formatImcPackage(pack: ImcPackage, bmi: string, status: string, companyName?: string | null): string {
  const brand = companyName?.trim() || 'tu empresa'

  return [
    `Calculadora IMC — ${pack.title}`,
    `IMC: ${bmi} · ${status}`,
    brand,
    '',
    pack.focus,
    '',
    ...pack.products.map((product, index) => `${index + 1}. ${product.name}${product.usage ? ` — ${product.usage}` : ''}`),
    '',
    'Esta información es orientativa y no sustituye consejo médico. Consulte a su médico antes de iniciar cualquier suplemento.',
  ].join('\n')
}

export function imcStatus(bmi: number): string {
  if (bmi < 18.5) {
    return 'Bajo peso'
  }
  if (bmi < 24.9) {
    return 'Peso Saludable'
  }
  if (bmi < 29.9) {
    return 'Sobrepeso'
  }

  return 'Obesidad'
}
