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

const STATUS_LABELS: Record<string, string> = {
  offer_sent: 'Offer Sent',
  client_turn: 'Your Turn',
  draftsman_turn: 'Your Turn',
  terms_agreed: 'Terms Agreed',
  in_progress: 'In Progress',
  in_review: 'In Review',
  revision_requested: 'Revision Requested',
  completed: 'Completed',
  declined: 'Declined',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
}

const STATUS_VARIANTS: Record<string, 'available' | 'verified' | 'founding' | 'skill'> = {
  offer_sent: 'founding',
  client_turn: 'founding',
  draftsman_turn: 'founding',
  terms_agreed: 'available',
  in_progress: 'available',
  in_review: 'founding',
  revision_requested: 'founding',
  completed: 'verified',
  declined: 'skill',
  cancelled: 'skill',
  disputed: 'skill',
}

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
  const status = c.status as string
  const isMyTurn = (isClient && status === 'client_turn') || (isDraftsman && status === 'draftsman_turn')
  const isWaiting = (isClient && status === 'draftsman_turn') || (isDraftsman && status === 'client_turn')
  const hasPendingProposal = !!(c.proposed_deliverables && c.proposed_amount)
  const inDiscussion = ['client_turn', 'draftsman_turn'].includes(status)

  const otherParty = isClient ? c.draftsman?.name : c.client?.name

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
              {isClient ? `Draftsman: ${otherParty}` : `Client: ${otherParty}`}
            </p>
          </div>
          <div className="text-right">
            <Badge variant={STATUS_VARIANTS[status] ?? 'skill'}>
              {status === 'client_turn' && isClient ? 'Action Required' :
               status === 'draftsman_turn' && isDraftsman ? 'Action Required' :
               STATUS_LABELS[status] ?? status}
            </Badge>
            <p className="text-lg font-bold text-[var(--color-blueprint-accent)] mt-2">
              ₹{(c.agreed_amount ?? c.agreed_rate)?.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {c.agreed_deliverables && (
          <div className="mt-4 pt-4 border-t border-[var(--color-blueprint-border)]">
            <p className="text-xs text-[var(--color-blueprint-text-muted)] mb-1">Agreed deliverables</p>
            <p className="text-sm text-[var(--color-blueprint-text-secondary)]">{c.agreed_deliverables}</p>
          </div>
        )}
      </div>

      {/* Action panel */}
      {status === 'offer_sent' && (
        <div className="blueprint-card p-6 mb-6">
          {isDraftsman && (
            <>
              <p className="blueprint-label mb-2">// NEW OFFER</p>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-1">
                {c.client?.name} wants to hire you directly.
              </p>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-4">
                Original offer: <span className="text-[var(--color-blueprint-accent)] font-semibold">₹{c.agreed_rate?.toLocaleString('en-IN')}</span>
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
        <div className="blueprint-card p-6 mb-6">
          {isMyTurn && !hasPendingProposal && (
            <>
              <p className="blueprint-label mb-2">// YOUR TURN</p>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-4">
                {isClient
                  ? 'Share your project brief, requirements, reference files, and any questions.'
                  : 'Ask questions, share your approach, or propose final terms when you\'re ready.'}
              </p>
              <div className="space-y-3">
                <MessageForm contractId={id} />
                {isClient && <ReferenceFilesForm contractId={id} />}
                {isDraftsman && (
                  <TermsForm contractId={id} defaultAmount={c.agreed_rate} />
                )}
              </div>
            </>
          )}

          {isMyTurn && hasPendingProposal && isClient && (
            <>
              <p className="blueprint-label mb-2">// PROPOSAL RECEIVED</p>
              <div className="mb-4 p-4 rounded-lg bg-[var(--color-blueprint-overlay)] border border-[var(--color-blueprint-border-strong)]">
                <p className="text-xs text-[var(--color-blueprint-text-muted)] mb-1">Deliverables</p>
                <p className="text-sm text-[var(--color-blueprint-text-primary)] mb-3">{c.proposed_deliverables}</p>
                <p className="text-xs text-[var(--color-blueprint-text-muted)] mb-1">Final price</p>
                <p className="text-xl font-bold text-[var(--color-blueprint-accent)]">
                  ₹{c.proposed_amount?.toLocaleString('en-IN')}
                </p>
              </div>
              <p className="text-xs text-[var(--color-blueprint-text-muted)] mb-4">
                Agreeing locks these terms. Send a message to counter or ask questions instead.
              </p>
              <div className="flex gap-3 flex-wrap">
                <form action={async () => { 'use server'; await agreeToTerms(id) }}>
                  <Button type="submit">Agree to terms →</Button>
                </form>
                <MessageForm contractId={id} />
              </div>
            </>
          )}

          {isWaiting && (
            <>
              <p className="blueprint-label mb-2">// WAITING</p>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
                {isClient
                  ? `Waiting for ${c.draftsman?.name} to respond.`
                  : `Waiting for ${c.client?.name} to respond.`}
              </p>
            </>
          )}
        </div>
      )}

      {status === 'terms_agreed' && (
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

      {status === 'in_progress' && (
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

      {status === 'in_review' && (
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

      {status === 'revision_requested' && (
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

      {status === 'completed' && (
        <div className="blueprint-card p-6 mb-6 border-[var(--color-blueprint-accent)]/30">
          <p className="blueprint-label mb-2">// COMPLETED</p>
          <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
            Project complete. Reviews coming soon.
          </p>
        </div>
      )}

      {['declined', 'cancelled'].includes(status) && (
        <div className="blueprint-card p-6 mb-6 opacity-60">
          <p className="blueprint-label mb-2">// {status.toUpperCase()}</p>
          <p className="text-sm text-[var(--color-blueprint-text-muted)]">This contract is no longer active.</p>
        </div>
      )}

      {/* Cancel option during discussion */}
      {['offer_sent', 'client_turn', 'draftsman_turn', 'terms_agreed'].includes(status) && (
        <div className="text-right mb-6">
          <form action={async () => { 'use server'; await cancelContract(id) }}>
            <button type="submit" className="text-xs text-[var(--color-blueprint-text-muted)] hover:text-red-400 transition-colors">
              Cancel contract
            </button>
          </form>
        </div>
      )}

      {/* Message thread */}
      {messages.length > 0 && (
        <div className="blueprint-card p-6">
          <p className="blueprint-label mb-4">// THREAD</p>
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
        </div>
      )}
    </main>
  )
}
