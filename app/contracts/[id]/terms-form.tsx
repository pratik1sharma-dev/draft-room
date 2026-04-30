'use client'

import { useActionState, useState } from 'react'
import { proposeTerms } from '@/lib/actions/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function TermsForm({ contractId, defaultAmount }: { contractId: string; defaultAmount: number }) {
  const [state, formAction, isPending] = useActionState(proposeTerms, null)
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Propose final terms →
      </Button>
    )
  }

  return (
    <form action={formAction} className="space-y-3 p-4 rounded-lg border border-[var(--color-blueprint-border-strong)] bg-[var(--color-blueprint-overlay)]">
      <p className="text-sm font-medium text-[var(--color-blueprint-text-primary)]">Propose final terms</p>
      <input type="hidden" name="contract_id" value={contractId} />

      <div>
        <label className="block text-xs text-[var(--color-blueprint-text-muted)] mb-1">
          Exact deliverables (be specific — this gets locked)
        </label>
        <Textarea
          name="deliverables"
          placeholder="e.g. Site plan (1:100), 4 elevation sheets, section drawings — all in DWG + PDF"
          className="min-h-[80px] text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-[var(--color-blueprint-text-muted)] mb-1">Final amount (₹)</label>
        <Input name="amount" type="number" min="1" defaultValue={defaultAmount} required />
      </div>

      {state?.error && <p className="text-red-400 text-xs">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Sending...' : 'Send proposal'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
