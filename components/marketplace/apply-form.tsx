'use client'

import { useActionState } from 'react'
import { applyToJob } from '@/lib/actions/applications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function ApplyForm({ jobId }: { jobId: string }) {
  const [state, formAction, isPending] = useActionState(applyToJob, null)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="job_id" value={jobId} />

      <div>
        <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">
          Your proposed rate (₹)
        </label>
        <Input
          name="proposed_rate"
          type="number"
          min="1"
          placeholder="e.g. 500"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">
          Cover note
        </label>
        <Textarea
          name="cover_note"
          placeholder="Briefly describe your experience with this type of work and why you're a good fit..."
          required
          minLength={20}
        />
      </div>

      {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit application'}
      </Button>
    </form>
  )
}
