import { createClient } from '@/lib/supabase/server'

export async function getApplicationsForJob(jobId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      users!inner(id, name, city, state),
      profiles!inner(skills, hourly_rate, experience_years, is_verified, avatar_url)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getDraftsmanApplications(draftsmanId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs!inner(id, title, description, budget_type, budget_amount, status,
        users!inner(id, name, city)
      )
    `)
    .eq('draftsman_id', draftsmanId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getContracts(userId: string, role: 'client' | 'draftsman') {
  const supabase = await createClient()

  const field = role === 'client' ? 'client_id' : 'draftsman_id'

  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      jobs!inner(id, title, description),
      client:users!contracts_client_id_fkey(id, name),
      draftsman:users!contracts_draftsman_id_fkey(id, name)
    `)
    .eq(field, userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}
