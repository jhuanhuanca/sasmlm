export type ImcGoal = 'lose_weight' | 'gain_weight'

export type ToolProduct = {
  name: string
  usage: string
  product_id?: number | null
  image?: string | null
}

export type CompanyToolPackage = {
  id: number | string | null
  goal?: string
  title: string
  focus: string
  image?: string | null
  products: ToolProduct[]
}

export type CompanyToolsPayload = {
  company: { id?: number | null; name?: string | null; logo?: string | null } | null
  data: CompanyToolPackage[]
}

export type CompanyMediaItem = {
  id: number | string | null
  title: string
  description?: string | null
  url: string
  file_type: string
  kind?: string
  player?: string | null
  embed_url?: string | null
  thumbnail?: string | null
  filename?: string | null
}

export type CompanyMediaPayload = {
  company: { id?: number | null; name?: string | null; logo?: string | null } | null
  data: CompanyMediaItem[]
}
