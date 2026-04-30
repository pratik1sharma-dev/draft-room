'use client'

import { useActionState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { sendDirectOffer } from '@/lib/actions/applications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

export const dynamic = 'force-dynamic'

export default function DirectHirePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const draftsmanId = params.id as string
  const jobId = searchParams.get('job_id')
  const [state, formAction, isPending] = useActionState(sendDirectOffer, null)

  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// DIRECT HIRE</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-8">
        Send a Direct Offer
      </h1>

      <form action={formAction} className="space-y-5 blueprint-card p-6">
        <input type="hidden" name="draftsman_id" value={draftsmanId} />
        {jobId && <input type="hidden" name="job_id" value={jobId} />}

        {jobId ? (
          <div className="p-4 rounded-lg bg-[var(--color-blueprint-overlay)] border border-[var(--color-blueprint-border-strong)]">
            <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
              You're hiring this draftsman for your existing job. The project title, description, and budget from that job will be used automatically.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">
                Project title
              </label>
              <Input name="title" placeholder="e.g. Site plan drafting for commercial building" required />
            </div>

            <div>
              <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">
                Project description
              </label>
              <Textarea
                name="description"
                placeholder="Describe the work, deliverables, and timeline..."
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">
                  Budget type
                </label>
                <Select name="budget_type" defaultValue="fixed">
                  <option value="fixed">Fixed price</option>
                  <option value="hourly">Hourly</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">
                  Amount (₹)
                </label>
                <Input name="budget_amount" type="number" min="1" placeholder="e.g. 8000" required />
              </div>
            </div>
          </>
        )}

        {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Sending offer...' : 'Send offer →'}
        </Button>
      </form>
    </main>
  )
}
