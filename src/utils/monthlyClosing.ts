import type { MonthlyClosing } from '@/types/mlm'

export type ClosingNote = {
  expenses_logged: boolean
  finances_separated: boolean
  next_sales: string
  next_invites: string
  next_focus: string
}

export function emptyClosingNote(): ClosingNote {
  return {
    expenses_logged: false,
    finances_separated: false,
    next_sales: '',
    next_invites: '',
    next_focus: '',
  }
}

export function closingNotesKey(userId: number | string | undefined, period: string): string {
  return `rexmlm.closing.${userId ?? 'anon'}.${period}`
}

export function readClosingNotes(userId: number | string | undefined, period: string): ClosingNote {
  if (typeof localStorage === 'undefined' || !period) {
    return emptyClosingNote()
  }

  try {
    const raw = localStorage.getItem(closingNotesKey(userId, period))
    if (!raw) {
      return emptyClosingNote()
    }
    return { ...emptyClosingNote(), ...JSON.parse(raw) }
  } catch {
    return emptyClosingNote()
  }
}

export function writeClosingNotes(userId: number | string | undefined, period: string, notes: ClosingNote): void {
  if (typeof localStorage === 'undefined' || !period) {
    return
  }

  localStorage.setItem(closingNotesKey(userId, period), JSON.stringify(notes))
}

export function compassText(closing: MonthlyClosing): string {
  const sales = Number(closing.sales ?? 0)
  const leaders = Number(closing.new_leaders ?? 0)
  const members = Number(closing.new_team_members ?? 0)
  const overdue = Number(closing.team?.follow_ups_overdue ?? 0)
  const withoutSales = Number(closing.team?.partners_without_sales ?? 0)

  if (closing.is_current_month) {
    if (overdue > 0 || withoutSales > 0) {
      return 'El mes aún está abierto. Hay seguimiento pendiente: cierra conversaciones y apoya a quien no movió ventas antes de que se acabe el ciclo.'
    }
    if (members === 0 && sales === 0) {
      return 'Este mes todavía no hay movimiento registrado. El cierre no se improvisa en los últimos días: invita, da seguimiento y registra ventas con constancia.'
    }
    return 'Vas a tiempo. Usa lo que ya pasó en el mes para empujar invitaciones, seguimiento y un socio listo para independizarse.'
  }

  if (leaders > 0) {
    return 'Ciclo cerrado con el resultado que más mueve REXmlm: socios que se volvieron líderes. Celebra eso y replica el hábito el mes que entra.'
  }
  if (members > 0 && leaders === 0) {
    return 'Entró gente a la red, pero nadie se independizó. El siguiente mes no es vender más a ciegas: es acompañar a quien ya aceptó la invitación.'
  }
  if (sales > 0) {
    return 'Hubo ventas, pero el volante de referidos no giró. La tienda alimenta al líder; el negocio de plataforma crece cuando un socio abre su propia red.'
  }
  return 'Mes en silencio. Un cierre honesto también sirve: nombra qué faltó (prospección, seguimiento o constancia) y arranca el próximo ciclo con una sola meta clara.'
}

export function performanceReading(closing: MonthlyClosing): string {
  const salesChange = closing.change?.sales
  const members = Number(closing.new_team_members ?? 0)
  const invites = Number(closing.invitations?.sent ?? 0)
  const accepted = Number(closing.invitations?.accepted ?? 0)

  const parts: string[] = []

  if (salesChange === null || salesChange === undefined) {
    parts.push('No hay mes anterior para comparar ventas.')
  } else if (salesChange >= 5) {
    parts.push(`Las ventas pagadas subieron ${salesChange}% frente al mes previo.`)
  } else if (salesChange <= -5) {
    parts.push(`Las ventas pagadas cayeron ${Math.abs(salesChange)}% frente al mes previo.`)
  } else {
    parts.push('Las ventas quedaron casi planas respecto al mes anterior.')
  }

  if (invites === 0) {
    parts.push('No enviaste invitaciones en este periodo: sin prospección no hay red nueva.')
  } else if (accepted === 0) {
    parts.push(`Enviaste ${invites} invitación(es) y ninguna se aceptó: el seguimiento de esos correos es la conversación pendiente.`)
  } else {
    parts.push(`De ${invites} invitaciones, ${accepted} se aceptaron. Eso es tu “sí” de red, no solo la venta.`)
  }

  if (members === 0) {
    parts.push('No hubo altas nuevas en el equipo.')
  }

  return parts.join(' ')
}

export function nextActions(closing: MonthlyClosing): string[] {
  const actions: string[] = []
  const overdue = Number(closing.team?.follow_ups_overdue ?? 0)
  const support = Number(closing.team?.needs_support ?? 0)
  const withoutSales = Number(closing.team?.partners_without_sales ?? 0)
  const pendingInvites = Number(closing.invitations?.pending ?? 0)
  const newMembers = Number(closing.new_team_members ?? 0)
  const newLeaders = Number(closing.new_leaders ?? 0)

  if (overdue > 0) {
    actions.push(`Cierra ${overdue} seguimiento(s) vencido(s): un sí o un no, no dejes conversaciones abiertas.`)
  }
  if (support > 0) {
    actions.push(`Agenda entrenamiento o una llamada con ${support} socio(s) que necesitan apoyo.`)
  }
  if (withoutSales > 0) {
    actions.push(`Activa a ${withoutSales} socio(s) sin ventas pagadas en el mes: meta, producto y un cliente.`)
  }
  if (pendingInvites > 0) {
    actions.push(`Hay ${pendingInvites} invitación(es) sin aceptar. Reenvía o llama esta semana.`)
  }
  if (newMembers > 0 && newLeaders === 0) {
    actions.push('Elige 1–2 socios del mes y habla de volverse líder. Ahí está la comisión recurrente.')
  }
  if (actions.length === 0) {
    actions.push('Define volumen de ventas, número de invitaciones y un socio a independizar. Trabaja eso desde el día 1, no en la última semana.')
    actions.push('Mantén el seguimiento semanal del equipo: constancia gana al sprint de fin de mes.')
  }

  return actions.slice(0, 4)
}
