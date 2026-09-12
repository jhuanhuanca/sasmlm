export type ShopPaymentMethod = 'qr' | 'qr_binance' | 'deposit' | 'transfer'

export type ShopPayments = {
  qr_enabled: boolean
  qr_image: string
  qr_notes: string
  binance_enabled: boolean
  binance_image: string
  binance_pay_id: string
  binance_notes: string
  deposit_enabled: boolean
  deposit_notes: string
  transfer_enabled: boolean
  transfer_notes: string
  bank_name: string
  bank_account_holder: string
  bank_account_number: string
  bank_account_type: string
  bank_document: string
}

export const PAYMENT_METHODS: Array<{
  id: ShopPaymentMethod
  label: string
  hint: string
}> = [
  { id: 'qr', label: 'QR bancario / billetera', hint: 'El cliente escanea el QR de tu banco o billetera.' },
  { id: 'qr_binance', label: 'QR Binance', hint: 'Pago con Binance Pay o QR de Binance.' },
  { id: 'deposit', label: 'Depósito bancario', hint: 'Depósito en ventanilla o cajero a tu cuenta.' },
  { id: 'transfer', label: 'Transferencia bancaria', hint: 'Transferencia a tu cuenta desde otra entidad.' },
]

export function emptyShopPayments(): ShopPayments {
  return {
    qr_enabled: false,
    qr_image: '',
    qr_notes: '',
    binance_enabled: false,
    binance_image: '',
    binance_pay_id: '',
    binance_notes: '',
    deposit_enabled: false,
    deposit_notes: '',
    transfer_enabled: false,
    transfer_notes: '',
    bank_name: '',
    bank_account_holder: '',
    bank_account_number: '',
    bank_account_type: 'ahorros',
    bank_document: '',
  }
}

export function hydrateShopPayments(raw: unknown): ShopPayments {
  const base = emptyShopPayments()
  if (!raw || typeof raw !== 'object') {
    return base
  }
  const row = raw as Record<string, unknown>
  return {
    qr_enabled: Boolean(row.qr_enabled),
    qr_image: String(row.qr_image ?? ''),
    qr_notes: String(row.qr_notes ?? ''),
    binance_enabled: Boolean(row.binance_enabled),
    binance_image: String(row.binance_image ?? ''),
    binance_pay_id: String(row.binance_pay_id ?? ''),
    binance_notes: String(row.binance_notes ?? ''),
    deposit_enabled: Boolean(row.deposit_enabled),
    deposit_notes: String(row.deposit_notes ?? ''),
    transfer_enabled: Boolean(row.transfer_enabled),
    transfer_notes: String(row.transfer_notes ?? ''),
    bank_name: String(row.bank_name ?? ''),
    bank_account_holder: String(row.bank_account_holder ?? ''),
    bank_account_number: String(row.bank_account_number ?? ''),
    bank_account_type: String(row.bank_account_type ?? 'ahorros') || 'ahorros',
    bank_document: String(row.bank_document ?? ''),
  }
}

export function paymentMethodAvailable(payments: ShopPayments, method: ShopPaymentMethod): boolean {
  if (method === 'qr') {
    return payments.qr_enabled && Boolean(payments.qr_image.trim())
  }
  if (method === 'qr_binance') {
    return payments.binance_enabled && Boolean(payments.binance_image.trim() || payments.binance_pay_id.trim())
  }
  if (method === 'deposit') {
    return payments.deposit_enabled && Boolean(payments.bank_account_number.trim())
  }
  return payments.transfer_enabled && Boolean(payments.bank_account_number.trim())
}

export function availablePaymentMethods(payments: ShopPayments): ShopPaymentMethod[] {
  return PAYMENT_METHODS.map((item) => item.id).filter((id) => paymentMethodAvailable(payments, id))
}

export function paymentMethodLabel(method: string | null | undefined): string {
  return PAYMENT_METHODS.find((item) => item.id === method)?.label ?? 'Pago'
}
