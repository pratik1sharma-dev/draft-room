'use client'

import { useActionState } from 'react'
import { createJob } from '@/lib/actions/jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

export const dynamic = 'force-dynamic'

const SKILLS = ['AutoCAD', 'Revit', 'SketchUp', '3D Rendering', 'Structural Drawings', 'BIM']

export default function PostJobPage() {
  const [state, formAction, isPending] = useActionState(createJob, null)

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// NEW PROJECT</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-8">
        Post a Project
      </h1>

      <form action={formAction} className="space-y-6">
        <div className="blueprint-card p-6 space-y-5">
          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">
              Job title
            </label>
            <Input name="title" placeholder="e.g. AutoCAD floor plan for 3BHK apartment" required />
          </div>

          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">
              Description
            </label>
            <Textarea
              name="description"
              placeholder="Describe the work in detail — dimensions, number of drawings, file format required, reference images, etc."
              className="min-h-[140px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-2">
              Skills required
            </label>
            <div className="flex flex-wrap gap-3">
              {SKILLS.map(skill => (
                <label key={skill} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="skills_required"
                    value={skill}
                    className="accent-[var(--color-blueprint-accent)]"
                  />
                  <span className="text-sm text-[var(--color-blueprint-text-secondary)]">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">
                Budget type
              </label>
              <Select name="budget_type" required defaultValue="fixed">
                <option value="fixed">Fixed price</option>
                <option value="hourly">Hourly rate</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">
                Budget amount (₹)
              </label>
              <Input name="budget_amount" type="number" min="1" placeholder="e.g. 5000" required />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">
              Deadline (optional)
            </label>
            <Input name="deadline" type="date" />
          </div>
        </div>

        {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? 'Posting...' : 'Post job →'}
        </Button>
      </form>
    </main>
  )
}
