'use client'

import { useActionState } from 'react'
import { submitWork, requestRevision } from '@/lib/actions/contracts'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function SubmitWorkForm({ contractId }: { contractId: string }) {
  const [state, formAction, isPending] = useActionState(submitWork, null)

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="contract_id" value={contractId} />
      <div>
        <label className="block text-xs text-[var(--color-blueprint-text-muted)] mb-1">
          Describe what you're submitting (links, file names, notes)
        </label>
        <Textarea
          name="note"
          placeholder="e.g. Shared DWG files via Google Drive link: drive.google.com/..."
          className="min-h-[80px] text-sm"
          required
        />
      </div>
      {state?.error && <p className="text-red-400 text-xs">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit deliverables →'}
      </Button>
    </form>
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
