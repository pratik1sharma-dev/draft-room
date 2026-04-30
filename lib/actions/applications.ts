'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function applyToJob(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const jobId = formData.get('job_id') as string
  const coverNote = formData.get('cover_note') as string
  const proposedRate = Number(formData.get('proposed_rate'))

  if (!proposedRate || proposedRate < 1) return { error: 'Proposed rate is required' }
  if (!coverNote?.trim()) return { error: 'Cover note is required' }

  const { error } = await supabase.from('applications').insert({
    job_id: jobId,
    draftsman_id: user.id,
    cover_note: coverNote,
    proposed_rate: proposedRate,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You have already applied to this job' }
    return { error: error.message }
  }

  revalidatePath(`/jobs/${jobId}`)
  redirect('/applications')
}

export async function acceptApplication(applicationId: string, jobId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (appError || !application) return { error: 'Application not found' }

  const { error: acceptError } = await supabase
    .from('applications')
    .update({ status: 'accepted' })
    .eq('id', applicationId)

  if (acceptError) return { error: acceptError.message }

  await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('job_id', jobId)
    .neq('id', applicationId)

  const { error: contractError } = await supabase.from('contracts').insert({
    job_id: jobId,
    client_id: user.id,
    draftsman_id: application.draftsman_id,
    agreed_rate: application.proposed_rate,
  })

  if (contractError) return { error: contractError.message }

  await supabase
    .from('jobs')
    .update({ status: 'in_progress' })
    .eq('id', jobId)

  revalidatePath('/applications')
  revalidatePath('/contracts')
  redirect('/contracts')
}

export async function rejectApplication(applicationId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  revalidatePath('/applications')
  return null
}

export async function sendDirectOffer(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const draftsmanId = formData.get('draftsman_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const budgetAmount = Number(formData.get('budget_amount'))
  const budgetType = formData.get('budget_type') as 'fixed' | 'hourly'

  if (!title || title.length < 5) return { error: 'Title must be at least 5 characters' }
  if (!description || description.length < 20) return { error: 'Description must be at least 20 characters' }
  if (!budgetAmount || budgetAmount < 1) return { error: 'Budget is required' }

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      client_id: user.id,
      title,
      description,
      skills_required: [],
      budget_type: budgetType,
      budget_amount: budgetAmount,
      status: 'in_progress',
    })
    .select()
    .single()

  if (jobError) return { error: jobError.message }

  const { error: appError } = await supabase
    .from('applications')
    .insert({
      job_id: job.id,
      draftsman_id: draftsmanId,
      cover_note: 'Direct hire offer',
      proposed_rate: budgetAmount,
      status: 'accepted',
    })

  if (appError) return { error: appError.message }

  const { error: contractError } = await supabase.from('contracts').insert({
    job_id: job.id,
    client_id: user.id,
    draftsman_id: draftsmanId,
    agreed_rate: budgetAmount,
    status: 'offer_sent',
  })

  if (contractError) return { error: contractError.message }

  redirect('/contracts')
}

export async function acceptContract(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: 'active' })
    .eq('id', contractId)
    .eq('draftsman_id', user.id)
    .eq('status', 'pending_draftsman')

  if (error) return { error: error.message }

  revalidatePath('/contracts')
  return null
}

export async function declineContract(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: 'declined' })
    .eq('id', contractId)
    .eq('draftsman_id', user.id)
    .eq('status', 'pending_draftsman')

  if (error) return { error: error.message }

  revalidatePath('/contracts')
  return null
}

export async function markContractComplete(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: contract, error: fetchError } = await supabase
    .from('contracts')
    .select('job_id')
    .eq('id', contractId)
    .eq('client_id', user.id)
    .single()

  if (fetchError || !contract) return { error: 'Contract not found' }

  await supabase.from('contracts').update({ status: 'completed' }).eq('id', contractId)
  await supabase.from('jobs').update({ status: 'completed' }).eq('id', contract.job_id)

  revalidatePath('/contracts')
  return null
}
