'use client'

import { useActionState, useState } from 'react'
import { proposeTerms } from '@/lib/actions/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface TermsFormProps {
  contractId: string
  defaultAmount: number
  initialData?: {
    deliverables: string
    amount: number
    timeline: string
    delivery_date: string
    revisions: number
  }
}

export function TermsForm({ contractId, defaultAmount, initialData }: TermsFormProps) {
  const [state, formAction, isPending] = useActionState(proposeTerms, null)
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        {initialData ? 'Counter-propose terms →' : 'Propose final terms →'}
      </Button>
    )
  }

  return (
    <form action={formAction} className="space-y-3 p-4 rounded-lg border border-[var(--color-blueprint-border-strong)] bg-[var(--color-blueprint-overlay)]">
      <p className="text-sm font-medium text-[var(--color-blueprint-text-primary)]">
        {initialData ? 'Counter-propose terms' : 'Propose final terms'}
      </p>
      <input type="hidden" name="contract_id" value={contractId} />

      <div>
        <label className="block text-xs text-[var(--color-blueprint-text-muted)] mb-1">
          Exact deliverables (be specific — this gets locked)
        </label>
        <Textarea
          name="deliverables"
          defaultValue={initialData?.deliverables ?? ''}
          placeholder="e.g. Site plan (1:100), 4 elevation sheets, section drawings — all in DWG + PDF"
          className="min-h-[80px] text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-[var(--color-blueprint-text-muted)] mb-1">Final amount (₹)</label>
        <Input name="amount" type="number" min="1" defaultValue={initialData?.amount ?? defaultAmount} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--color-blueprint-text-muted)] mb-1">Timeline (e.g. 10 days)</label>
          <Input name="timeline" defaultValue={initialData?.timeline ?? ''} placeholder="Duration..." required />
        </div>
        <div>
          <label className="block text-xs text-[var(--color-blueprint-text-muted)] mb-1">Delivery date</label>
          <Input name="delivery_date" type="date" defaultValue={initialData?.delivery_date ?? ''} required />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--color-blueprint-text-muted)] mb-1">Number of revisions</label>
        <Input name="revisions" type="number" min="0" defaultValue={initialData?.revisions ?? 2} required />
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
