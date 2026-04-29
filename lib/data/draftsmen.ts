import { createClient } from '@/lib/supabase/server'

export async function getDraftsmen(filters?: {
  skill?: string
  city?: string
  max_rate?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select(`
      *,
      users!inner(id, name, city, state, role)
    `)
    .eq('users.role', 'draftsman')
    .eq('availability', true)
    .order('is_verified', { ascending: false })

  if (filters?.skill) {
    query = query.contains('skills', [filters.skill])
  }
  if (filters?.city) {
    query = query.ilike('users.city', `%${filters.city}%`)
  }
  if (filters?.max_rate) {
    query = query.lte('hourly_rate', filters.max_rate)
  }

  const { data, error } = await query
  if (error) return []
  return data
}

export async function getDraftsman(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      users!inner(id, name, email, city, state, role, created_at)
    `)
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data
}

export async function getSuggestedDraftsmen(skills: string[]) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      users!inner(id, name, city, state, role)
    `)
    .eq('users.role', 'draftsman')
    .eq('availability', true)
    .overlaps('skills', skills)
    .limit(5)

  if (error) return []
  return data
}
