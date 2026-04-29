import { createClient } from '@/lib/supabase/server'

export async function getDraftsmen(filters?: {
  skill?: string
  city?: string
  max_rate?: number
}) {
  const supabase = await createClient()

  // Get draftsman user IDs first, then fetch their profiles
  let userQuery = supabase
    .from('users')
    .select('id, name, city, state')
    .eq('role', 'draftsman')

  if (filters?.city) {
    userQuery = userQuery.ilike('city', `%${filters.city}%`)
  }

  const { data: users, error: usersError } = await userQuery
  if (usersError || !users?.length) return []

  const userIds = users.map(u => u.id)

  let profileQuery = supabase
    .from('profiles')
    .select('*')
    .in('user_id', userIds)
    .eq('availability', true)
    .order('is_verified', { ascending: false })

  if (filters?.skill) {
    profileQuery = profileQuery.contains('skills', [filters.skill])
  }
  if (filters?.max_rate) {
    profileQuery = profileQuery.lte('hourly_rate', filters.max_rate)
  }

  const { data: profiles, error: profilesError } = await profileQuery
  if (profilesError) return []

  const userMap = Object.fromEntries(users.map(u => [u.id, u]))
  return profiles.map(p => ({ ...p, users: userMap[p.user_id] }))
}

export async function getDraftsman(userId: string) {
  const supabase = await createClient()

  const [{ data: profile }, { data: user }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase.from('users').select('id, name, email, city, state, role, created_at').eq('id', userId).single(),
  ])

  if (!profile || !user) return null
  return { ...profile, users: user }
}

export async function getSuggestedDraftsmen(skills: string[]) {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, name, city, state')
    .eq('role', 'draftsman')

  if (!users?.length) return []

  const userIds = users.map(u => u.id)
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .in('user_id', userIds)
    .eq('availability', true)
    .overlaps('skills', skills)
    .limit(5)

  if (error) return []
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))
  return profiles.map(p => ({ ...p, users: userMap[p.user_id] }))
}
