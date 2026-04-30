'use client'

import { useActionState, useState } from 'react'
import { sendDirectOffer } from '@/lib/actions/applications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

interface Job {
  id: string
  title: string
  budget_amount: number
  budget_type: string
}

interface HireFormProps {
  draftsmanId: string
  draftsmanName: string
  existingJobs: Job[]
  preselectedJobId?: string | null
}

export function HireForm({ draftsmanId, draftsmanName, existingJobs, preselectedJobId }: HireFormProps) {
  const [state, formAction, isPending] = useActionState(sendDirectOffer, null)
  const [selectedJobId, setSelectedJobId] = useState<string>(preselectedJobId ?? '')
  const isNew = selectedJobId === '__new__'

  return (
    <form action={formAction} className="space-y-5 blueprint-card p-6">
      <input type="hidden" name="draftsman_id" value={draftsmanId} />
      {!isNew && selectedJobId && (
        <input type="hidden" name="job_id" value={selectedJobId} />
      )}

      <div>
        <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-3">
          Which project are you hiring {draftsmanName} for?
        </p>

        <div className="space-y-2">
          {existingJobs.map(job => (
            <label
              key={job.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedJobId === job.id
                  ? 'border-[var(--color-blueprint-accent)] bg-[var(--color-blueprint-accent)]/5'
                  : 'border-[var(--color-blueprint-border)] hover:border-[var(--color-blueprint-border-strong)]'
              }`}
            >
              <input
                type="radio"
                name="_job_select"
                value={job.id}
                checked={selectedJobId === job.id}
                onChange={() => setSelectedJobId(job.id)}
                className="mt-0.5 accent-[var(--color-blueprint-accent)]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-blueprint-text-primary)] truncate">{job.title}</p>
                <p className="text-xs text-[var(--color-blueprint-text-muted)]">
                  ₹{job.budget_amount.toLocaleString('en-IN')} · {job.budget_type === 'hourly' ? 'hourly' : 'fixed'}
                </p>
              </div>
            </label>
          ))}

          <label
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              isNew
                ? 'border-[var(--color-blueprint-accent)] bg-[var(--color-blueprint-accent)]/5'
                : 'border-[var(--color-blueprint-border)] hover:border-[var(--color-blueprint-border-strong)]'
            }`}
          >
            <input
              type="radio"
              name="_job_select"
              value="__new__"
              checked={isNew}
              onChange={() => setSelectedJobId('__new__')}
              className="accent-[var(--color-blueprint-accent)]"
            />
            <p className="text-sm text-[var(--color-blueprint-text-secondary)]">+ Create a new project</p>
          </label>
        </div>
      </div>

      {isNew && (
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Project title</label>
            <Input name="title" placeholder="e.g. Site plan drafting for commercial building" required />
          </div>

          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Project description</label>
            <Textarea
              name="description"
              placeholder="Describe the work, deliverables, and timeline..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Budget type</label>
              <Select name="budget_type" defaultValue="fixed">
                <option value="fixed">Fixed price</option>
                <option value="hourly">Hourly</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Amount (₹)</label>
              <Input name="budget_amount" type="number" min="1" placeholder="e.g. 8000" required />
            </div>
          </div>
        </div>
      )}

      {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={isPending || !selectedJobId}>
        {isPending ? 'Sending offer...' : 'Send offer →'}
      </Button>
    </form>
  )
}
