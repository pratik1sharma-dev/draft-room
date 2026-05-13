import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './profile-form'

export const dynamic = 'force-dynamic'

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('name, phone, city, state, role')
    .eq('id', user.id)
    .single()

  if (!userData) redirect('/onboarding')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('avatar_url, bio, skills, hourly_rate, experience_years, linkedin_url, availability, portfolio_urls, firm_name, project_types')
    .eq('user_id', user.id)
    .single()

  const profile = {
    avatar_url: profileData?.avatar_url ?? null,
    bio: profileData?.bio ?? null,
    skills: profileData?.skills ?? [],
    hourly_rate: profileData?.hourly_rate ?? null,
    experience_years: profileData?.experience_years ?? null,
    linkedin_url: profileData?.linkedin_url ?? null,
    availability: profileData?.availability ?? true,
    portfolio_urls: profileData?.portfolio_urls ?? [],
    firm_name: profileData?.firm_name ?? null,
    project_types: profileData?.project_types ?? [],
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// SETTINGS</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-8">
        Edit Profile
      </h1>

      <ProfileForm
        role={userData.role as 'client' | 'draftsman'}
        user={{ name: userData.name, phone: userData.phone, city: userData.city, state: userData.state, email: user.email ?? '' }}
        profile={profile}
      />
    </main>
  )
}
