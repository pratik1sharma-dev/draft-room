'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

export async function updateProfile(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData) redirect('/onboarding')

  const name = formData.get('name') as string
  const phone = (formData.get('phone') as string) || null
  const city = formData.get('city') as string
  const state = formData.get('state') as string

  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters' }
  if (!city) return { error: 'City is required' }
  if (!state) return { error: 'State is required' }

  const { error: userError } = await supabase
    .from('users')
    .update({ name, phone, city, state })
    .eq('id', user.id)

  if (userError) {
    logger.error('updateProfile failed', { step: 'users update', userId: user.id, error: userError.message })
    return { error: userError.message }
  }

  const avatarUrl = (formData.get('avatar_url') as string) || null

  if (userData.role === 'draftsman') {
    const bio = (formData.get('bio') as string) || null
    const skills = formData.getAll('skills') as string[]
    const hourlyRate = Number(formData.get('hourly_rate'))
    const experienceYears = Number(formData.get('experience_years'))
    const linkedinUrl = (formData.get('linkedin_url') as string) || null
    const availability = formData.get('availability') === 'true'
    const portfolioRaw = (formData.get('portfolio_urls') as string) || ''
    const portfolioUrls = portfolioRaw
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0)

    if (skills.length === 0) return { error: 'Select at least one skill' }
    if (!hourlyRate || hourlyRate < 1) return { error: 'Hourly rate must be greater than 0' }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        avatar_url: avatarUrl,
        bio,
        skills,
        hourly_rate: hourlyRate,
        experience_years: experienceYears || null,
        linkedin_url: linkedinUrl,
        availability,
        portfolio_urls: portfolioUrls,
      })
      .eq('user_id', user.id)

    if (profileError) {
      logger.error('updateProfile failed', { step: 'profiles update', userId: user.id, role: 'draftsman', error: profileError.message })
      return { error: profileError.message }
    }
  }

  if (userData.role === 'client') {
    const firmName = (formData.get('firm_name') as string) || null
    const projectTypes = formData.getAll('project_types') as string[]

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: avatarUrl,
        firm_name: firmName, 
        project_types: projectTypes 
      })
      .eq('user_id', user.id)

    if (profileError) {
      logger.error('updateProfile failed', { step: 'profiles update', userId: user.id, role: 'client', error: profileError.message })
      return { error: profileError.message }
    }
  }

  logger.info('profile updated', { userId: user.id, role: userData.role })
  revalidatePath('/dashboard')
  revalidatePath('/profile/edit')
  redirect('/dashboard')
}
