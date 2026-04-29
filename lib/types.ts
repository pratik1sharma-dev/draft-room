export type UserRole = 'client' | 'draftsman'
export type BudgetType = 'fixed' | 'hourly'
export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'
export type ContractStatus = 'active' | 'completed' | 'disputed'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  phone: string | null
  city: string | null
  state: string | null
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  bio: string | null
  avatar_url: string | null
  is_founding_member: boolean
  skills: string[]
  hourly_rate: number | null
  experience_years: number | null
  portfolio_urls: string[]
  availability: boolean
  is_verified: boolean
  linkedin_url: string | null
  firm_name: string | null
  project_types: string[]
}

export interface Job {
  id: string
  client_id: string
  title: string
  description: string
  skills_required: string[]
  budget_type: BudgetType
  budget_amount: number
  deadline: string | null
  status: JobStatus
  attachments: string[]
  created_at: string
}

export interface Application {
  id: string
  job_id: string
  draftsman_id: string
  cover_note: string | null
  proposed_rate: number
  status: ApplicationStatus
  created_at: string
}

export interface Contract {
  id: string
  job_id: string
  client_id: string
  draftsman_id: string
  agreed_rate: number
  status: ContractStatus
  created_at: string
}

export interface Message {
  id: string
  contract_id: string
  sender_id: string
  content: string | null
  file_url: string | null
  created_at: string
}

export interface Review {
  id: string
  contract_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: string
}
