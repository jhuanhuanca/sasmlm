export type RoleName = 'admin' | 'leader' | 'partner'

export type CompanyPalette = {
  primary?: string
  secondary?: string
  accent?: string
}

export type LandingPalette = {
  principal?: string[]
  complementarios?: string[]
  primary?: string
  secondary?: string
  accent?: string
}

export type LandingPhotoFrame = 'phone' | 'circle' | 'emerge' | 'arch' | 'blob'

export type CompanyBrand = {
  id?: number | null
  name?: string | null
  logo?: string | null
  color_palette?: CompanyPalette | null
  rank_name?: string | null
  country?: string | null
}

export type CompanyMembership = {
  catalog_company_id: number
  catalog_company_name?: string | null
  catalog_rank_id?: number | null
  catalog_rank_name?: string | null
  is_primary: boolean
}

export interface AuthUser {
  id: number
  name: string
  email: string
  status: string
  roles: RoleName[]
  current_network_id: number | null
  two_factor_enabled: boolean
  country?: string | null
  catalog_company_id?: number | null
  catalog_company_name?: string | null
  catalog_rank_id?: number | null
  catalog_rank_name?: string | null
  organization_id?: number | null
  active_catalog_company_id?: number | null
  companies?: CompanyMembership[]
  secondary_company_price?: number
  secondary_company_currency?: string
  organization?: { id: number; name: string; slug: string } | null
  company?: CompanyBrand | null
  store?: StoreSummary | null
  landing_page?: LandingSummary | null
  network?: NetworkSummary | null
  sponsor?: SponsorSummary | null
}

export interface SponsorSummary {
  id: number
  name: string
  store?: {
    slug: string
    name: string
    is_active: boolean
  } | null
  landing_page?: {
    slug: string
    title: string
    is_published: boolean
  } | null
}

export interface StoreSummary {
  id: number
  name: string
  slug: string
  theme: string
  settings?: Record<string, unknown> | null
  is_active: boolean
}

export interface LandingSummary {
  id: number
  slug: string
  title: string
  template: string
  content: LandingContent
  is_published: boolean
  owner_name?: string
  store_slug?: string
  whatsapp?: string | null
  company?: CompanyBrand | null
}

export interface NetworkSummary {
  id: number
  name: string
  slug: string
  status: string
}

export interface LandingContent {
  hero?: {
    title?: string
    subtitle?: string
    cta_label?: string
    cta_href?: string
    photo?: string
    background?: string
    kicker?: string
    frame?: LandingPhotoFrame
  }
  reasons?: {
    photo?: string
    kicker?: string
    title?: string
    body?: string
    benefits?: string[]
  }
  logo?: string
  whatsapp?: string
  palette?: LandingPalette
  blocks?: LandingBlock[]
}

export interface LandingBlock {
  type: 'text' | 'image' | 'store_cta'
  body?: string
  path?: string
}

export type LandingEditField =
  | 'logo'
  | 'title'
  | 'photo'
  | 'background'
  | 'kicker'
  | 'headline'
  | 'subtitle'
  | 'cta'
  | 'whatsapp'
  | 'reasons_photo'
  | 'reasons_kicker'
  | 'reasons_title'
  | 'reasons_body'
  | 'reasons_benefits'
  | 'look'
  | 'blocks'
  | `block:${number}`

export interface AuthPayload {
  user: AuthUser
  token: string
}

export interface LoginBody {
  email: string
  password: string
}

export interface RegisterBody {
  name: string
  email: string
  password: string
  password_confirmation: string
  invitation_token?: string
  country?: string
  catalog_company_id?: number
  catalog_rank_id?: number
}

export interface CatalogRankOption {
  id: number
  name: string
  plan_id?: number
  plan_name?: string
}

export interface CatalogCompanyOption {
  id: number
  name: string
  slug?: string
  ranks: CatalogRankOption[]
}

export interface CountryOption {
  code: string
  name: string
}

export interface GoogleAuthBody {
  id_token: string
  invitation_token?: string
  country?: string
  catalog_company_id?: number
  catalog_rank_id?: number
}

export interface RegistrationOptions {
  countries: CountryOption[]
  companies: CatalogCompanyOption[]
  google_client_id?: string | null
}
