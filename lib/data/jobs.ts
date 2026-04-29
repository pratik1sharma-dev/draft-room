import { createClient } from '@/lib/supabase/server'

export async function getJobs(filters?: {
  skill?: string
  budget_type?: 'fixed' | 'hourly'
  min_budget?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('jobs')
    .select('*, client:client_id(id, name, city, state)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (filters?.skill) {
    query = query.contains('skills_required', [filters.skill])
  }
  if (filters?.budget_type) {
    query = query.eq('budget_type', filters.budget_type)
  }
  if (filters?.min_budget) {
    query = query.gte('budget_amount', filters.min_budget)
  }

  const { data, error } = await query
  if (error) return []
  // normalise to { ...job, users: { name, city } } shape used by JobCard
  return (data ?? []).map((j: any) => ({ ...j, users: j.client }))
}

export async function getJob(jobId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jobs')
    .select('*, client:client_id(id, name, city, state)')
    .eq('id', jobId)
    .single()

  if (error) return null
  return { ...data, users: (data as any).client }
}

export async function getClientJobs(clientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}
