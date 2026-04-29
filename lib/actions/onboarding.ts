'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export const clientOnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  firm_name: z.string().optional(),
  project_types: z.array(z.string()).default([]),
})

export const draftmanOnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  hourly_rate: z.number().min(1, 'Hourly rate must be greater than 0'),
  experience_years: z.number().min(0),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
})

export async function completeClientOnboarding(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = clientOnboardingSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone') || undefined,
    city: formData.get('city'),
    state: formData.get('state'),
    firm_name: formData.get('firm_name') || undefined,
    project_types: formData.getAll('project_types'),
  })

  if (!result.success) return { error: result.error.issues[0].message }

  const { name, phone, city, state, firm_name, project_types } = result.data

  const { error: userError } = await supabase.from('users').upsert({
    id: user.id, email: user.email!, role: 'client',
    name, phone: phone ?? null, city, state,
  })
  if (userError) return { error: userError.message }

  const { error: profileError } = await supabase.from('profiles').upsert({
    user_id: user.id, firm_name: firm_name ?? null, project_types,
  })
  if (profileError) return { error: profileError.message }

  redirect('/dashboard')
}

export async function completeDraftmanOnboarding(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = draftmanOnboardingSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone') || undefined,
    city: formData.get('city'),
    state: formData.get('state'),
    skills: formData.getAll('skills'),
    hourly_rate: Number(formData.get('hourly_rate')),
    experience_years: Number(formData.get('experience_years')),
    linkedin_url: formData.get('linkedin_url') || undefined,
  })

  if (!result.success) return { error: result.error.issues[0].message }

  const { name, phone, city, state, skills, hourly_rate, experience_years, linkedin_url } = result.data

  const { error: userError } = await supabase.from('users').upsert({
    id: user.id, email: user.email!, role: 'draftsman',
    name, phone: phone ?? null, city, state,
  })
  if (userError) return { error: userError.message }

  const { error: profileError } = await supabase.from('profiles').upsert({
    user_id: user.id, skills, hourly_rate, experience_years,
    linkedin_url: linkedin_url || null, availability: true,
  })
  if (profileError) return { error: profileError.message }

  redirect('/dashboard')
}
