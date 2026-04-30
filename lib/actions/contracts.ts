'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptOffer(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: 'client_turn' })
    .eq('id', contractId)
    .eq('draftsman_id', user.id)
    .eq('status', 'offer_sent')

  if (error) return { error: error.message }
  revalidatePath(`/contracts/${contractId}`)
  return null
}

export async function declineOffer(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: 'declined' })
    .eq('id', contractId)
    .eq('draftsman_id', user.id)
    .eq('status', 'offer_sent')

  if (error) return { error: error.message }
  revalidatePath(`/contracts/${contractId}`)
  return null
}

export async function sendMessage(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const contractId = formData.get('contract_id') as string
  const content = formData.get('content') as string

  if (!content?.trim()) return { error: 'Message cannot be empty' }

  const { data: contract } = await supabase
    .from('contracts')
    .select('client_id, draftsman_id, status')
    .eq('id', contractId)
    .single()

  if (!contract) return { error: 'Contract not found' }

  const isClient = contract.client_id === user.id
  const isDraftsman = contract.draftsman_id === user.id
  if (!isClient && !isDraftsman) return { error: 'Not a party to this contract' }

  if (!['client_turn', 'draftsman_turn'].includes(contract.status)) {
    return { error: 'Cannot send messages at this stage' }
  }

  const { error: msgError } = await supabase
    .from('messages')
    .insert({ contract_id: contractId, sender_id: user.id, content: content.trim() })

  if (msgError) return { error: msgError.message }

  const nextStatus = isClient ? 'draftsman_turn' : 'client_turn'
  const updateData: Record<string, unknown> = { status: nextStatus }

  // Client responding clears any pending proposal (they're countering)
  if (isClient) {
    updateData.proposed_deliverables = null
    updateData.proposed_amount = null
  }

  await supabase.from('contracts').update(updateData).eq('id', contractId)

  revalidatePath(`/contracts/${contractId}`)
  return null
}

export async function proposeTerms(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const contractId = formData.get('contract_id') as string
  const deliverables = formData.get('deliverables') as string
  const amount = Number(formData.get('amount'))

  if (!deliverables?.trim()) return { error: 'Deliverables description is required' }
  if (!amount || amount < 1) return { error: 'Amount is required' }

  const { error } = await supabase
    .from('contracts')
    .update({
      proposed_deliverables: deliverables.trim(),
      proposed_amount: amount,
      status: 'client_turn',
    })
    .eq('id', contractId)
    .eq('draftsman_id', user.id)
    .in('status', ['draftsman_turn', 'client_turn'])

  if (error) return { error: error.message }
  revalidatePath(`/contracts/${contractId}`)
  return null
}

export async function agreeToTerms(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: contract } = await supabase
    .from('contracts')
    .select('proposed_deliverables, proposed_amount')
    .eq('id', contractId)
    .eq('client_id', user.id)
    .single()

  if (!contract?.proposed_deliverables || !contract?.proposed_amount) {
    return { error: 'No proposal to agree to' }
  }

  const { error } = await supabase
    .from('contracts')
    .update({
      status: 'terms_agreed',
      agreed_deliverables: contract.proposed_deliverables,
      agreed_amount: contract.proposed_amount,
      agreed_at: new Date().toISOString(),
      proposed_deliverables: null,
      proposed_amount: null,
    })
    .eq('id', contractId)
    .eq('client_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/contracts/${contractId}`)
  return null
}

export async function startWork(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: 'in_progress' })
    .eq('id', contractId)
    .eq('client_id', user.id)
    .eq('status', 'terms_agreed')

  if (error) return { error: error.message }
  revalidatePath(`/contracts/${contractId}`)
  return null
}

export async function submitWork(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const contractId = formData.get('contract_id') as string
  const note = formData.get('note') as string

  if (!note?.trim()) return { error: 'Please describe what you are submitting' }

  await supabase.from('messages').insert({
    contract_id: contractId,
    sender_id: user.id,
    content: `[Deliverables submitted] ${note.trim()}`,
  })

  const { error } = await supabase
    .from('contracts')
    .update({ status: 'in_review' })
    .eq('id', contractId)
    .eq('draftsman_id', user.id)
    .eq('status', 'in_progress')

  if (error) return { error: error.message }
  revalidatePath(`/contracts/${contractId}`)
  return null
}

export async function approveWork(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: contract } = await supabase
    .from('contracts')
    .select('job_id')
    .eq('id', contractId)
    .eq('client_id', user.id)
    .eq('status', 'in_review')
    .single()

  if (!contract) return { error: 'Contract not found' }

  await supabase.from('contracts').update({ status: 'completed' }).eq('id', contractId)
  await supabase.from('jobs').update({ status: 'completed' }).eq('id', contract.job_id)

  revalidatePath(`/contracts/${contractId}`)
  revalidatePath('/contracts')
  return null
}

export async function requestRevision(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const contractId = formData.get('contract_id') as string
  const note = formData.get('note') as string

  if (!note?.trim()) return { error: 'Please describe what needs to be revised' }

  await supabase.from('messages').insert({
    contract_id: contractId,
    sender_id: user.id,
    content: `[Revision requested] ${note.trim()}`,
  })

  const { error } = await supabase
    .from('contracts')
    .update({ status: 'revision_requested' })
    .eq('id', contractId)
    .eq('client_id', user.id)
    .eq('status', 'in_review')

  if (error) return { error: error.message }
  revalidatePath(`/contracts/${contractId}`)
  return null
}

export async function acknowledgeRevision(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: 'in_progress' })
    .eq('id', contractId)
    .eq('draftsman_id', user.id)
    .eq('status', 'revision_requested')

  if (error) return { error: error.message }
  revalidatePath(`/contracts/${contractId}`)
  return null
}

export async function cancelContract(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: 'cancelled' })
    .eq('id', contractId)
    .in('status', ['offer_sent', 'client_turn', 'draftsman_turn', 'terms_agreed'])

  if (error) return { error: error.message }
  revalidatePath(`/contracts/${contractId}`)
  revalidatePath('/contracts')
  return null
}
