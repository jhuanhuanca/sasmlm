const KEY = 'rexmlm_pending_plan_id'

export function rememberPendingPlan(planId: number | string | null | undefined): void {
  const id = Number(planId)
  if (!Number.isInteger(id) || id <= 0) {
    return
  }
  sessionStorage.setItem(KEY, String(id))
}

export function peekPendingPlan(): number | null {
  const id = Number(sessionStorage.getItem(KEY) ?? 0)
  return Number.isInteger(id) && id > 0 ? id : null
}

export function takePendingPlan(): number | null {
  const id = peekPendingPlan()
  sessionStorage.removeItem(KEY)
  return id
}
