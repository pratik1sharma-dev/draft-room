import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getContract, getContractMessages } from '@/lib/data/contracts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageForm } from './message-form'
import { TermsForm } from './terms-form'
import { SubmitWorkForm, RevisionForm, ReferenceFilesForm } from './action-forms'
import {
  acceptOffer, declineOffer, agreeToTerms,
  startWork, approveWork, acknowledgeRevision, cancelContract
} from '@/lib/actions/contracts'

export const dynamic = 'force-dynamic'

import { ContractStatus, STATUS_LABELS, STATUS_VARIANTS, DISCUSSION_STATUSES, WORK_STATUSES, CANCELLABLE_STATUSES } from '@/lib/contracts/states'

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const contract = await getContract(id)
  if (!contract) notFound()

  const isClient = contract.client_id === user.id
  const isDraftsman = contract.draftsman_id === user.id
  if (!isClient && !isDraftsman) notFound()

  const messages = await getContractMessages(id)
  const c = contract as any
  const status = c.status as ContractStatus
  const isMyTurn = (isClient && status === ContractStatus.CLIENT_TURN) || (isDraftsman && status === ContractStatus.DRAFTSMAN_TURN)
  const hasPendingProposal = !!(c.proposed_deliverables && c.proposed_amount)
  const isProposalSender = hasPendingProposal && user.id === c.proposal_sender_id
  const isProposalRecipient = hasPendingProposal && user.id !== c.proposal_sender_id
  const inDiscussion = (DISCUSSION_STATUSES as string[]).includes(status)
  const inWorkPhase = (WORK_STATUSES as string[]).includes(status)
  const termsAgreed = status === ContractStatus.TERMS_AGREED

  const otherParty = isClient ? c.draftsman?.name : c.client?.name
  const proposalKey = hasPendingProposal ? `${c.proposed_amount}-${c.proposed_deliverables}` : 'new'

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="blueprint-card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="blueprint-label mb-1">// CONTRACT</p>
            <h1 className="text-xl font-bold text-[var(--color-blueprint-text-primary)]">
              {c.jobs?.title}
            </h1>
            <p className="text-sm text-[var(--color-blueprint-text-muted)] mt-1">
              {isClient ? `Drafter: ${otherParty}` : `Client: ${otherParty}`}
            </p>
          </div>
          <div className="text-right">
            <Badge variant={STATUS_VARIANTS[status] ?? 'skill'}>
              {status === ContractStatus.CLIENT_TURN && isClient ? 'Action Required' :
               status === ContractStatus.DRAFTSMAN_TURN && isDraftsman ? 'Action Required' :
               STATUS_LABELS[status] ?? status}
            </Badge>
            <p className="text-lg font-bold text-[var(--color-blueprint-accent)] mt-2">
              ₹{(c.agreed_amount ?? c.agreed_rate)?.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {c.agreed_deliverables && (
          <div className="mt-4 pt-4 border-t border-[var(--color-blueprint-border)] grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <p className="text-xs text-[var(--color-blueprint-text-muted)] mb-1">Agreed deliverables</p>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)]">{c.agreed_deliverables}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-blueprint-text-muted)] mb-1">Delivery date</p>
              <p className="text-sm font-medium text-[var(--color-blueprint-text-primary)]">
                {c.agreed_delivery_date ? new Date(c.agreed_delivery_date).toLocaleDateString('en-IN') : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-blueprint-text-muted)] mb-1">Revisions included</p>
              <p className="text-sm font-medium text-[var(--color-blueprint-text-primary)]">{c.agreed_revisions ?? 'None'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action panel */}
      {status === ContractStatus.OFFER_SENT && (
        <div className="blueprint-card p-6 mb-6">
          {isDraftsman && (
            <>
              <p className="blueprint-label mb-2">// NEW OFFER</p>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-1">
                {c.client?.name} wants to work with you on this project.
              </p>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-4">
                Budget: <span className="text-[var(--color-blueprint-accent)] font-semibold">₹{c.agreed_rate?.toLocaleString('en-IN')}</span>
              </p>
              <p className="text-xs text-[var(--color-blueprint-text-muted)] mb-4">
                Accepting opens a discussion thread where you can ask questions, finalise deliverables, and agree on a final price before work begins.
              </p>
              <div className="flex gap-3">
                <form action={async () => { 'use server'; await acceptOffer(id) }}>
                  <Button type="submit">Accept offer</Button>
                </form>
                <form action={async () => { 'use server'; await declineOffer(id) }}>
                  <Button variant="outline" type="submit">Decline</Button>
                </form>
              </div>
            </>
          )}
          {isClient && (
            <>
              <p className="blueprint-label mb-2">// WAITING</p>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
                Waiting for {c.draftsman?.name} to review your offer.
              </p>
            </>
          )}
        </div>
      )}

      {inDiscussion && (
        <div className="space-y-6 mb-6">
          {/* Proposal / Terms Area - Only show during negotiation phase */}
          {!inWorkPhase && !termsAgreed && (hasPendingProposal || isDraftsman || isClient) && (
            <div className={`blueprint-card p-6 ${hasPendingProposal ? 'border-[var(--color-blueprint-accent)]/30' : ''}`}>
              <p className="blueprint-label mb-4">
                {!hasPendingProposal 
                  ? '// PROPOSE TERMS' 
                  : (isProposalRecipient ? '// ACTION REQUIRED: REVIEW TERMS' : '// YOUR PROPOSAL (PENDING)')}
              </p>
              
              {hasPendingProposal ? (
                <div className="space-y-4">
                  <div className="mb-4 p-4 rounded-lg bg-[var(--color-blueprint-overlay)] border border-[var(--color-blueprint-border-strong)] space-y-3">
                    <div>
                      <p className="text-xs text-[var(--color-blueprint-text-muted)] mb-1">Deliverables</p>
                      <p className="text-sm text-[var(--color-blueprint-text-primary)]">{c.proposed_deliverables}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[var(--color-blueprint-text-muted)] mb-1">Final price</p>
                        <p className="text-xl font-bold text-[var(--color-blueprint-accent)]">
                          ₹{c.proposed_amount?.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-blueprint-text-muted)] mb-1">Delivery date</p>
                        <p className="text-sm font-medium text-[var(--color-blueprint-text-primary)]">
                          {c.proposed_delivery_date ? new Date(c.proposed_delivery_date).toLocaleDateString('en-IN') : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {isProposalRecipient ? (
                      <>
                        <form action={async () => { 'use server'; await agreeToTerms(id) }}>
                          <Button type="submit" className="w-full">Agree to terms →</Button>
                        </form>
                        <TermsForm 
                          key={`counter-${proposalKey}`}
                          contractId={id} 
                          defaultAmount={c.agreed_rate} 
                          initialData={{
                            deliverables: c.proposed_deliverables,
                            amount: c.proposed_amount,
                            timeline: c.proposed_timeline,
                            delivery_date: c.proposed_delivery_date,
                            revisions: c.proposed_revisions
                          }}
                        />
                      </>
                    ) : (
                      <div className="sm:col-span-2">
                        <TermsForm 
                          key={`edit-${proposalKey}`}
                          contractId={id} 
                          defaultAmount={c.agreed_rate} 
                          initialData={{
                            deliverables: c.proposed_deliverables,
                            amount: c.proposed_amount,
                            timeline: c.proposed_timeline,
                            delivery_date: c.proposed_delivery_date,
                            revisions: c.proposed_revisions
                          }}
                        />
                        <p className="text-[10px] text-[var(--color-blueprint-text-muted)] mt-2 text-center italic">
                          {isMyTurn ? `It's your turn to chat, but you can also edit your proposal above.` : `Wait for ${otherParty} to respond or edit your proposal above.`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-2">
                    {isDraftsman 
                      ? 'Propose the final scope, price, and timeline to get started.'
                      : 'Specify your requirements and budget to receive a proposal, or propose terms yourself.'}
                  </p>
                  <TermsForm contractId={id} defaultAmount={c.agreed_rate} />
                </div>
              )}
            </div>
          )}

          {/* Discussion / Messaging Area */}
          <div className="blueprint-card p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="blueprint-label">// DISCUSSION</p>
              {!inWorkPhase && !isMyTurn && (
                <Badge variant="skill" className="text-[10px] animate-pulse">Waiting for {otherParty}...</Badge>
              )}
            </div>
            
            <div className="space-y-6">
              <MessageForm contractId={id} />
              
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--color-blueprint-border)]">
                {isClient && (inWorkPhase || termsAgreed || isMyTurn) && <ReferenceFilesForm contractId={id} />}
                {isDraftsman && !inWorkPhase && !termsAgreed && isMyTurn && !hasPendingProposal && (
                  <TermsForm 
                    key={`bottom-${proposalKey}`}
                    contractId={id} 
                    defaultAmount={c.agreed_rate} 
                  />
                )}
              </div>
              
              {!inWorkPhase && !termsAgreed && !isMyTurn && (
                <p className="text-[10px] text-[var(--color-blueprint-text-muted)] italic text-center">
                  It is currently {otherParty}'s turn to respond to the latest proposal or message.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {status === ContractStatus.TERMS_AGREED && (
        <div className="blueprint-card p-6 mb-6">
          <p className="blueprint-label mb-2">// TERMS LOCKED</p>
          <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-4">
            Both parties have agreed. The final amount is{' '}
            <span className="text-[var(--color-blueprint-accent)] font-semibold">
              ₹{c.agreed_amount?.toLocaleString('en-IN')}
            </span>.
          </p>
          {isClient && (
            <form action={async () => { 'use server'; await startWork(id) }}>
              <Button type="submit">Confirm and start work →</Button>
            </form>
          )}
          {isDraftsman && (
            <p className="text-sm text-[var(--color-blueprint-text-muted)]">
              Waiting for {c.client?.name} to confirm and start work.
            </p>
          )}
        </div>
      )}

      {status === ContractStatus.IN_PROGRESS && (
        <div className="blueprint-card p-6 mb-6">
          <p className="blueprint-label mb-2">// IN PROGRESS</p>
          {isDraftsman && (
            <>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-4">
                Work is underway. Submit when your deliverables are ready.
              </p>
              <SubmitWorkForm contractId={id} agreedDeliverables={c.agreed_deliverables ?? null} />
            </>
          )}
          {isClient && (
            <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
              {c.draftsman?.name} is working on your project.
            </p>
          )}
        </div>
      )}

      {status === ContractStatus.IN_REVIEW && (
        <div className="blueprint-card p-6 mb-6">
          <p className="blueprint-label mb-2">// REVIEW DELIVERABLES</p>
          {isClient && (
            <>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-4">
                {c.draftsman?.name} has submitted deliverables. Review and approve or request changes.
              </p>
              <div className="flex gap-3 flex-wrap">
                <form action={async () => { 'use server'; await approveWork(id) }}>
                  <Button type="submit">Approve and complete →</Button>
                </form>
                <RevisionForm contractId={id} />
              </div>
            </>
          )}
          {isDraftsman && (
            <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
              Submitted. Waiting for {c.client?.name} to review and approve.
            </p>
          )}
        </div>
      )}

      {status === ContractStatus.REVISION_REQUESTED && (
        <div className="blueprint-card p-6 mb-6">
          <p className="blueprint-label mb-2">// REVISION REQUESTED</p>
          {isDraftsman && (
            <>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-4">
                {c.client?.name} has requested changes. See their notes in the thread below.
              </p>
              <form action={async () => { 'use server'; await acknowledgeRevision(id) }}>
                <Button type="submit">Start revisions →</Button>
              </form>
            </>
          )}
          {isClient && (
            <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
              Revisions requested. Waiting for {c.draftsman?.name} to start.
            </p>
          )}
        </div>
      )}

      {status === ContractStatus.COMPLETED && (
        <div className="blueprint-card p-6 mb-6 border-[var(--color-blueprint-accent)]/30">
          <p className="blueprint-label mb-2">// COMPLETED</p>
          <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
            Project complete. Reviews coming soon.
          </p>
        </div>
      )}

      {([ContractStatus.DECLINED, ContractStatus.CANCELLED] as string[]).includes(status) && (
        <div className="blueprint-card p-6 mb-6 opacity-60">
          <p className="blueprint-label mb-2">// {status.toUpperCase()}</p>
          <p className="text-sm text-[var(--color-blueprint-text-muted)]">This contract is no longer active.</p>
        </div>
      )}

      {/* Cancel option during discussion */}
      {(CANCELLABLE_STATUSES as string[]).includes(status) && (
        <div className="text-right mb-6">
          <form action={async () => { 'use server'; await cancelContract(id) }}>
            <button type="submit" className="text-xs text-[var(--color-blueprint-text-muted)] hover:text-red-400 transition-colors">
              Cancel contract
            </button>
          </form>
        </div>
      )}

      {/* Message thread */}
      <div className="blueprint-card p-6">
        <p className="blueprint-label mb-4">// THREAD</p>
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg: any) => {
              const isMe = msg.sender_id === user.id
              const isSystem = msg.content.startsWith('[')
              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className="shrink-0 w-7 h-7 rounded-full bg-[var(--color-blueprint-overlay)] border border-[var(--color-blueprint-border)] flex items-center justify-center text-xs font-bold text-[var(--color-blueprint-text-muted)]">
                    {msg.sender?.name?.[0] ?? '?'}
                  </div>
                  <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <span className="text-xs text-[var(--color-blueprint-text-muted)]">
                      {isMe ? 'You' : msg.sender?.name}
                    </span>
                    <div className={`px-3 py-2 rounded-lg text-sm ${
                      isSystem
                        ? 'bg-[var(--color-blueprint-overlay)] text-[var(--color-blueprint-text-muted)] italic w-full text-center'
                        : isMe
                        ? 'bg-[var(--color-blueprint-accent)] text-white'
                        : 'bg-[var(--color-blueprint-surface-2)] text-[var(--color-blueprint-text-secondary)]'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-blueprint-text-muted)] italic text-center py-4">
            No messages yet. Use the discussion to finalise requirements.
          </p>
        )}
      </div>
    </main>
  )
}
