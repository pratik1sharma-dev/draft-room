'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ContractStatus, DISCUSSION_STATUSES, CANCELLABLE_STATUSES } from '@/lib/contracts/states'
import { logger } from '@/lib/logger'

function revalidateContract(contractId: string) {
  revalidatePath(`/contracts/${contractId}`)
}

export async function acceptOffer(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: ContractStatus.CLIENT_TURN })
    .eq('id', contractId)
    .eq('draftsman_id', user.id)
    .eq('status', ContractStatus.OFFER_SENT)

  if (error) { logger.error('acceptOffer failed', { contractId, userId: user.id, error: error.message }); return { error: error.message } }
  logger.info('offer accepted', { contractId, userId: user.id })
  revalidateContract(contractId)
  return null
}

export async function declineOffer(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: ContractStatus.DECLINED })
    .eq('id', contractId)
    .eq('draftsman_id', user.id)
    .eq('status', ContractStatus.OFFER_SENT)

  if (error) { logger.error('declineOffer failed', { contractId, userId: user.id, error: error.message }); return { error: error.message } }
  logger.info('offer declined', { contractId, userId: user.id })
  revalidateContract(contractId)
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

  if (!(DISCUSSION_STATUSES as string[]).includes(contract.status)) {
    return { error: 'Cannot send messages at this stage' }
  }

  const { error: msgError } = await supabase
    .from('messages')
    .insert({ contract_id: contractId, sender_id: user.id, content: content.trim() })

  if (msgError) { logger.error('sendMessage failed', { contractId, userId: user.id, error: msgError.message }); return { error: msgError.message } }

  const nextStatus = isClient ? ContractStatus.DRAFTSMAN_TURN : ContractStatus.CLIENT_TURN
  const updateData: Record<string, unknown> = { status: nextStatus }

  await supabase.from('contracts').update(updateData).eq('id', contractId)

  revalidateContract(contractId)
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
  const timeline = formData.get('timeline') as string
  const deliveryDate = formData.get('delivery_date') as string
  const revisions = Number(formData.get('revisions'))

  if (!deliverables?.trim()) return { error: 'Deliverables description is required' }
  if (!amount || amount < 1) return { error: 'Amount is required' }
  if (!timeline?.trim()) return { error: 'Timeline is required' }
  if (!deliveryDate) return { error: 'Delivery date is required' }

  const { data: contract, error: fetchError } = await supabase
    .from('contracts')
    .select('client_id, draftsman_id, status, proposed_amount')
    .eq('id', contractId)
    .single()

  if (fetchError || !contract) return { error: 'Contract not found' }

  const isClient = contract.client_id === user.id
  const isDraftsman = contract.draftsman_id === user.id
  if (!isClient && !isDraftsman) return { error: 'Not a party to this contract' }

  const nextStatus = isClient ? ContractStatus.DRAFTSMAN_TURN : ContractStatus.CLIENT_TURN

  // Generate AI payment plan
  let paymentPlan = null
  try {
    const { generatePaymentPlan } = await import('@/lib/actions/ai')
    const result = await generatePaymentPlan({ deliverables: deliverables.trim(), totalAmount: amount, timeline: timeline.trim() })
    if (result.plan) paymentPlan = result.plan
  } catch {
    // Non-fatal — proceed without payment plan
  }

  const { error, count } = await supabase
    .from('contracts')
    .update({
      proposed_deliverables: deliverables.trim(),
      proposed_amount: amount,
      proposed_timeline: timeline.trim(),
      proposed_delivery_date: deliveryDate,
      proposed_revisions: revisions || 2,
      payment_plan: paymentPlan,
      proposal_sender_id: user.id,
      status: nextStatus,
    }, { count: 'exact' })
    .eq('id', contractId)
    .in('status', DISCUSSION_STATUSES)

  if (error) { logger.error('proposeTerms failed', { contractId, userId: user.id, error: error.message }); return { error: error.message } }
  if (count === 0) { logger.warn('proposeTerms blocked — wrong status', { contractId, userId: user.id }); return { error: 'Unable to update terms at this stage' } }
  logger.info('terms proposed', { contractId, userId: user.id, amount })

  const isCounter = !!contract.proposed_amount
  const label = isCounter ? 'Counter-proposal' : 'Proposal'
  await supabase.from('messages').insert({
    contract_id: contractId,
    sender_id: user.id,
    content: `[${label} sent] ₹${amount.toLocaleString('en-IN')} · Delivery by ${new Date(deliveryDate).toLocaleDateString('en-IN')} · ${revisions} revisions included`,
  })

  revalidateContract(contractId)
  return null
}

export async function agreeToTerms(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: contract } = await supabase
    .from('contracts')
    .select('client_id, draftsman_id, status, proposed_deliverables, proposed_amount, proposed_timeline, proposed_delivery_date, proposed_revisions, payment_plan, proposal_sender_id')
    .eq('id', contractId)
    .single()

  if (!contract) return { error: 'Contract not found' }
  if (!contract.proposed_deliverables || !contract.proposed_amount) {
    return { error: 'No proposal to agree to' }
  }

  if (contract.proposal_sender_id === user.id) {
    return { error: 'You cannot agree to your own proposal. Wait for the other party to respond.' }
  }

  const isClient = contract.client_id === user.id
  const isDraftsman = contract.draftsman_id === user.id
  if (!isClient && !isDraftsman) return { error: 'Not a party to this contract' }

  const { error } = await supabase
    .from('contracts')
    .update({
      status: ContractStatus.TERMS_AGREED,
      agreed_deliverables: contract.proposed_deliverables,
      agreed_amount: contract.proposed_amount,
      agreed_delivery_date: contract.proposed_delivery_date,
      agreed_revisions: contract.proposed_revisions,
      agreed_at: new Date().toISOString(),
      proposed_deliverables: null,
      proposed_amount: null,
      proposed_timeline: null,
      proposed_delivery_date: null,
      proposed_revisions: null,
      proposal_sender_id: null,
      payment_plan: null,
    })
    .eq('id', contractId)

  if (error) { logger.error('agreeToTerms failed', { contractId, userId: user.id, error: error.message }); return { error: error.message } }
  logger.info('terms agreed', { contractId, userId: user.id })

  await supabase.from('messages').insert({
    contract_id: contractId,
    sender_id: user.id,
    content: `[Terms agreed] Final price: ₹${contract.proposed_amount.toLocaleString('en-IN')} · Deliverables locked`,
  })

  revalidateContract(contractId)
  return null
}

export async function startWork(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: ContractStatus.IN_PROGRESS })
    .eq('id', contractId)
    .eq('client_id', user.id)
    .eq('status', ContractStatus.TERMS_AGREED)

  if (error) return { error: error.message }
  revalidateContract(contractId)
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
  const completedDeliverables = formData.getAll('completed_deliverables') as string[]

  if (!note?.trim()) return { error: 'Please describe what you are submitting' }

  let content = `[Deliverables submitted] ${note.trim()}`
  if (completedDeliverables.length > 0) {
    content += `\n\nCompleted Scope:\n${completedDeliverables.map(d => `✓ ${d}`).join('\n')}`
  }

  await supabase.from('messages').insert({
    contract_id: contractId,
    sender_id: user.id,
    content,
  })

  const { error } = await supabase
    .from('contracts')
    .update({ status: ContractStatus.IN_REVIEW })
    .eq('id', contractId)
    .eq('draftsman_id', user.id)
    .eq('status', ContractStatus.IN_PROGRESS)

  if (error) return { error: error.message }
  revalidateContract(contractId)
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
    .eq('status', ContractStatus.IN_REVIEW)
    .single()

  if (!contract) return { error: 'Contract not found' }

  await supabase.from('contracts').update({ status: ContractStatus.COMPLETED }).eq('id', contractId)
  await supabase.from('jobs').update({ status: 'completed' }).eq('id', contract.job_id)

  revalidateContract(contractId)
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
    .update({ status: ContractStatus.REVISION_REQUESTED })
    .eq('id', contractId)
    .eq('client_id', user.id)
    .eq('status', ContractStatus.IN_REVIEW)

  if (error) return { error: error.message }
  revalidateContract(contractId)
  return null
}

export async function acknowledgeRevision(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: ContractStatus.IN_PROGRESS })
    .eq('id', contractId)
    .eq('draftsman_id', user.id)
    .eq('status', ContractStatus.REVISION_REQUESTED)

  if (error) return { error: error.message }
  revalidateContract(contractId)
  return null
}

export async function cancelContract(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contracts')
    .update({ status: ContractStatus.CANCELLED })
    .eq('id', contractId)
    .in('status', CANCELLABLE_STATUSES)

  if (error) return { error: error.message }
  revalidateContract(contractId)
  revalidatePath('/contracts')
  return null
}
