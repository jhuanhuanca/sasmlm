export interface SupportTicketReply {
  id: number
  author_role: 'user' | 'admin'
  author_name: string
  message: string
  created_at: string
}

export interface SupportTicket {
  id: number
  source: 'landing' | 'platform'
  status: 'open' | 'in_progress' | 'closed'
  name: string
  email: string
  subject: string
  message: string
  user_id: number | null
  catalog_company_id: number | null
  replies?: SupportTicketReply[]
  created_at: string
  updated_at: string
}
