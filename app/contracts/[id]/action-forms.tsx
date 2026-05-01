'use client'

import { useActionState, useState, useTransition } from 'react'
import { submitWork, requestRevision } from '@/lib/actions/contracts'
import { verifyDelivery, type DeliveryCheckResult } from '@/lib/actions/ai'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

export function SubmitWorkForm({
  contractId,
  agreedDeliverables,
}: {
  contractId: string
  agreedDeliverables: string | null
}) {
  const [state, formAction, isPending] = useActionState(submitWork, null)
  const [checkResult, setCheckResult] = useState<DeliveryCheckResult | null>(null)
  const [isVerifying, startVerifying] = useTransition()
  const [note, setNote] = useState('')
  const [verified, setVerified] = useState(false)

  // Parse deliverables into a checklist (assumes comma or semicolon separated)
  const deliverableItems = agreedDeliverables 
    ? agreedDeliverables.split(/[;,]|\n/).map(s => s.trim()).filter(s => s.length > 0)
    : []

  function handleVerify() {
    if (!note.trim() || !agreedDeliverables) return
    startVerifying(async () => {
      const { result } = await verifyDelivery({
        agreedDeliverables,
        submissionNote: note,
      })
      if (result) {
        setCheckResult(result)
        setVerified(result.verified)
      }
    })
  }

  return (
    <div className="space-y-4">
      {deliverableItems.length > 0 && (
        <div className="p-4 rounded-lg border border-[var(--color-blueprint-border)] bg-[var(--color-blueprint-overlay)]/50">
          <p className="text-xs font-semibold text-[var(--color-blueprint-text-muted)] uppercase mb-3">// DELIVERABLES CHECKLIST</p>
          <div className="space-y-2">
            {deliverableItems.map((item, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="completed_deliverables" 
                  value={item}
                  form="submit-work-form"
                  className="mt-1 accent-[var(--color-blueprint-accent)]"
                />
                <span className="text-sm text-[var(--color-blueprint-text-secondary)] group-hover:text-[var(--color-blueprint-text-primary)] transition-colors">
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-[var(--color-blueprint-text-muted)] mb-1">
          Submission Note & Links
        </label>
        <Textarea
          value={note}
          onChange={e => { setNote(e.target.value); setCheckResult(null); setVerified(false) }}
          placeholder="Describe your work and paste links (e.g. Google Drive) here..."
          className="min-h-[100px] text-sm"
        />
      </div>

      {/* AI Verification */}
      {agreedDeliverables && note.trim() && !checkResult && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? 'Checking against deliverables...' : 'Check against agreed deliverables →'}
        </Button>
      )}

      {checkResult && (
        <div className={`p-4 rounded-lg border ${checkResult.verified ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
          <p className={`text-sm font-medium mb-3 ${checkResult.verified ? 'text-emerald-400' : 'text-amber-400'}`}>
            {checkResult.verified ? '✓ All deliverables covered' : '⚠ Some deliverables missing'}
          </p>
          <div className="space-y-1.5 mb-3">
            {checkResult.checklist.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className={item.found ? 'text-emerald-400' : 'text-red-400'}>{item.found ? '✓' : '✗'}</span>
                <span className={item.found ? 'text-[var(--color-blueprint-text-secondary)]' : 'text-[var(--color-blueprint-text-primary)]'}>
                  {item.item}
                  {item.note && <span className="text-[var(--color-blueprint-text-muted)] ml-1">— {item.note}</span>}
                </span>
              </div>
            ))}
          </div>
          {!checkResult.verified && (
            <p className="text-xs text-amber-400">
              Missing: {checkResult.missing.join(', ')}
            </p>
          )}
        </div>
      )}

      {state?.error && <p className="text-red-400 text-xs">{state.error}</p>}

      <form action={formAction} id="submit-work-form">
        <input type="hidden" name="contract_id" value={contractId} />
        <input type="hidden" name="note" value={note} />
        <Button type="submit" disabled={isPending || !note.trim()}>
          {isPending ? 'Submitting...' : 'Submit deliverables →'}
        </Button>
        {checkResult && !checkResult.verified && (
          <p className="text-xs text-[var(--color-blueprint-text-muted)] mt-2">
            You can still submit — the client will see the AI check result.
          </p>
        )}
      </form>
    </div>
  )
}

export function RevisionForm({ contractId }: { contractId: string }) {
  const [state, formAction, isPending] = useActionState(requestRevision, null)

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="contract_id" value={contractId} />
      <div>
        <label className="block text-xs text-[var(--color-blueprint-text-muted)] mb-1">
          What needs to be changed?
        </label>
        <Textarea
          name="note"
          placeholder="e.g. North elevation dimensions are incorrect, needs to match the structural drawings..."
          className="min-h-[80px] text-sm"
          required
        />
      </div>
      {state?.error && <p className="text-red-400 text-xs">{state.error}</p>}
      <Button variant="outline" type="submit" disabled={isPending}>
        {isPending ? 'Requesting...' : 'Request revision'}
      </Button>
    </form>
  )
}

export function ReferenceFilesForm({ contractId }: { contractId: string }) {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleShare() {
    if (!url.trim()) return
    const { sendMessage } = await import('@/lib/actions/contracts')
    const fd = new FormData()
    fd.set('contract_id', contractId)
    fd.set('content', `[Reference files] ${label || 'Project reference'}: ${url}`)
    startTransition(async () => {
      await sendMessage(null, fd)
      setSaved(true)
      setUrl('')
      setLabel('')
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
        Share reference files →
      </Button>
    )
  }

  return (
    <div className="space-y-3 p-4 rounded-lg border border-[var(--color-blueprint-border-strong)] bg-[var(--color-blueprint-overlay)] w-full">
      <p className="text-sm font-medium text-[var(--color-blueprint-text-primary)]">Share reference files</p>
      <p className="text-xs text-[var(--color-blueprint-text-muted)]">
        Share links to drawings, site photos, or reference material.
      </p>
      <Input
        value={label}
        onChange={e => setLabel(e.target.value)}
        placeholder="Label (e.g. GF Floor Plan)"
        className="text-sm"
      />
      <Input
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://drive.google.com/..."
        type="url"
        className="text-sm"
      />
      {saved && <p className="text-xs text-emerald-400">Shared in thread ✓</p>}
      <div className="flex gap-2">
        <Button size="sm" type="button" onClick={handleShare} disabled={isPending || !url.trim()}>
          {isPending ? 'Sharing...' : 'Share files'}
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
