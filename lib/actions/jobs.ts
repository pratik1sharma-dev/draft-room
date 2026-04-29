'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { jobSchema } from '@/lib/validations/jobs'

export async function createJob(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = jobSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    skills_required: formData.getAll('skills_required'),
    budget_type: formData.get('budget_type'),
    budget_amount: Number(formData.get('budget_amount')),
    deadline: formData.get('deadline') || undefined,
  })

  if (!result.success) return { error: result.error.issues[0].message }

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      client_id: user.id,
      ...result.data,
      deadline: result.data.deadline || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  redirect(`/jobs/${job.id}?posted=true`)
}

export async function updateJobStatus(
  jobId: string,
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .eq('client_id', user.id)

  if (error) return { error: error.message }
  return null
}
