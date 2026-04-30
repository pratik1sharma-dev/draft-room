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

  // Support both old form (single budget_amount) and new AI form (budget_min/budget_max)
  const budgetAmount = formData.get('budget_amount')
    ? Number(formData.get('budget_amount'))
    : Math.round((Number(formData.get('budget_min')) + Number(formData.get('budget_max'))) / 2)

  // Deliverables from AI form (newline-separated textarea) or empty
  const deliverablesText = formData.get('deliverables_text') as string | null
  const deliverables = deliverablesText
    ? deliverablesText.split('\n').map(s => s.trim()).filter(Boolean)
    : []

  const result = jobSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    skills_required: formData.getAll('skills') as string[] || formData.getAll('skills_required') as string[],
    budget_type: formData.get('budget_type') ?? 'fixed',
    budget_amount: budgetAmount,
    deadline: formData.get('deadline') || undefined,
  })

  if (!result.success) return { error: result.error.issues[0].message }

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      client_id: user.id,
      ...result.data,
      deadline: result.data.deadline || null,
      attachments: deliverables,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  const hireAfter = formData.get('hire_after') as string | null
  if (hireAfter) redirect(`/draftsmen/${hireAfter}/hire?job_id=${job.id}`)

  redirect(`/projects/${job.id}?posted=true`)
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
