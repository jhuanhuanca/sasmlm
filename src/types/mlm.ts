export interface DashboardSummary {
  direct_referrals: number
  total_team: number
  pending_commissions: number
  total_commissions_earned: number
  paid_store_sales: number
  independent_leaders?: number
  follow_ups_due?: number
  team_sales_month?: number
  closing?: DashboardClosingPulse
  series?: ClosingSeriesPoint[]
}

export interface DashboardClosingPulse {
  month: string
  label?: string
  is_current_month?: boolean
  days_in_month?: number
  day_of_month?: number
  timezone?: string
  timezone_label?: string
  organization?: MonthlyClosing['organization']
  sales: number
  commissions: number
  orders_count?: number
  company_volume?: MonthlyClosing['company_volume']
  store_proxy?: MonthlyClosing['store_proxy']
  qualification?: MonthlyClosing['qualification']
  rank_progress?: MonthlyClosing['rank_progress']
  goals?: PeriodGoalsBundle
}

export interface ClosingSeriesPoint {
  month: string
  label: string
  sales: number
  commissions: number
  personal: number | null
  group: number | null
  unit?: string | null
}

export type TeamCrmStage =
  | 'new'
  | 'contacted'
  | 'active'
  | 'follow_up'
  | 'needs_support'
  | 'independent'

export type TeamKind = 'partner' | 'leader' | 'company'

export interface ReferralRow {
  id: number
  kind?: TeamKind
  referral_id?: number | null
  organization_member_id?: number | null
  referrer_id: number | null
  referred_id: number | null
  network_id: number | null
  level: number | null
  status: string | null
  created_at: string
  crm_stage?: TeamCrmStage | string | null
  notes?: string | null
  follow_up_at?: string | null
  last_contacted_at?: string | null
  is_leader?: boolean
  role?: string
  downline_count?: number
  sales_month?: number
  sales_total?: number
  orders_count?: number
  name?: string | null
  email?: string | null
  phone?: string | null
  company_code?: string | null
  rank_name?: string | null
  invite_pending?: boolean
  can_convert?: boolean
  can_sell_inventory?: boolean
  referred?: {
    id: number | null
    name: string | null
    email: string | null
    created_at?: string
    status?: string | null
  }
}

export interface TeamRosterSummary {
  partners: number
  independent_leaders: number
  company_partners: number
  downline_total: number
  sales_month: number
  follow_ups_due: number
}

export interface TeamRoster {
  data: ReferralRow[]
  summary: TeamRosterSummary
}

export interface TeamActivity {
  id: number
  type: string
  body: string
  due_at: string | null
  completed_at: string | null
  created_at: string
}

export interface TeamMemberDetail extends ReferralRow {
  orders?: Array<{
    id: number
    customer_name: string
    customer_email: string
    total: number | string
    currency: string
    status: string
    paid_at: string | null
    created_at: string
  }>
  activities?: TeamActivity[]
  downline?: Array<{
    id: number
    status: string
    created_at: string
    referred?: {
      id: number
      name: string
      email: string
      created_at: string
    }
  }>
}

export interface CommissionRow {
  id: number
  amount: number | string
  percentage: number | string
  currency: string
  status: string
  paid_at: string | null
  created_at: string
  referred?: {
    id: number
    name: string
    email: string
  }
}

export type WithdrawalStatus = 'requested' | 'paid' | 'rejected' | 'cancelled'

export interface WithdrawalBalance {
  pending: number
  reserved: number
  available: number
  minimum: number
  currency: string
  can_request: boolean
  whatsapp?: string | null
  email?: string
}

export interface WithdrawalRequest {
  id: number
  user_id: number
  amount: number | string
  currency: string
  status: WithdrawalStatus | string
  collect_all: boolean
  whatsapp?: string | null
  contact_email?: string | null
  notes?: string | null
  paid_at?: string | null
  processed_at?: string | null
  created_at: string
  user?: {
    id: number
    name: string
    email: string
  } | null
  processed_by?: {
    id: number
    name: string
  } | null
}

export interface Invitation {
  id: number
  email: string
  status: string
  expires_at: string | null
  accepted_at: string | null
  leader?: {
    id: number
    name: string
  }
}

export interface InvitationCreated extends Invitation {
  token: string
  email_sent?: boolean
  resent?: boolean
}

export interface Plan {
  id: number
  name: string
  slug: string
  price: number | string
  intro_price?: number | string
  currency: string
  interval: string
  commission_percentage: number | string
  features: string[] | Record<string, unknown> | null
  entitlements?: Record<string, unknown>
  recommended?: boolean
  is_active: boolean
}

export interface MonthlyClosingChange {
  sales: number | null
  commissions: number | null
  new_team_members: number | null
  new_leaders: number | null
}

export interface MonthlyClosing {
  month: string
  label?: string
  is_current_month?: boolean
  days_in_month?: number
  day_of_month?: number
  timezone?: string
  timezone_label?: string
  country?: string | null
  scope?: 'own_network' | string
  organization?: {
    id: number
    name: string
    slug: string
  } | null
  sales: number
  commissions: number
  new_team_members: number
  sales_attributed?: number
  sales_direct?: number
  orders_count?: number
  new_leaders?: number
  follow_ups_due?: number
  commissions_breakdown?: {
    pending: number
    approved: number
    paid: number
    reversed: number
  }
  invitations?: {
    sent: number
    accepted: number
    pending: number
  }
  team?: {
    total: number
    by_stage: Record<string, number>
    needs_support: number
    follow_ups_overdue: number
    partners_without_sales: number
    attention: Array<{
      id: number
      name?: string | null
      email?: string | null
      crm_stage: string
      follow_up_at?: string | null
    }>
  }
  previous_month?: string
  previous?: {
    month: string
    sales: number
    commissions: number
    new_team_members: number
    new_leaders: number
    orders_count: number
  }
  change?: MonthlyClosingChange
  top_partners?: Array<{
    id: number
    name?: string | null
    email?: string | null
    orders_count: number
    sales: number
  }>
  company_volume?: {
    available: boolean
    source?: 'organization' | 'network' | 'mixed' | null
    unit?: string | null
    personal?: number | null
    group?: number | null
    sales_volume?: number | null
    commission_volume?: number | null
    personal_origin?: 'imported' | 'derived_items' | null
    group_origin?: 'imported' | 'derived_downline' | null
    members: number
    orders: number
    bonuses?: number | null
    rank?: { code?: string | null; name?: string | null } | null
    lines?: {
      first_level: number
      qualified: number
      known: number
      min_volume?: number | null
    }
  }
  store_proxy?: {
    available: boolean
    personal: number
    team: number
    label: string
  }
  qualification?: {
    status: 'unpublished' | 'insufficient_data' | 'qualified' | 'not_qualified' | string
    official: boolean
    message?: string
    checks?: Array<{
      key: string
      label: string
      required: number
      actual?: number | null
      met: boolean
      unknown: boolean
    }>
  }
  rank_progress?: {
    official: boolean
    current?: { code?: string | null; name: string } | null
    next?: { code?: string | null; name: string; min_personal?: number | null; min_group?: number | null } | null
    progress?: number | null
    message?: string
  }
  series?: ClosingSeriesPoint[]
  goals?: PeriodGoalsBundle
}

export interface PeriodGoalItem {
  metric: string
  label: string
  hint?: string
  plane: 'a' | 'b' | string
  unit: string
  target: number | null
  actual: number | null
  progress: number | null
  status: 'empty' | 'planned' | 'unavailable' | 'met' | 'open' | string
}

export interface PeriodGoalsBundle {
  period: string
  next_period: string
  items: PeriodGoalItem[]
  next_items: PeriodGoalItem[]
}

export interface Paginated<T> {
  data: T[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links?: {
    next: string | null
    prev: string | null
  }
}
