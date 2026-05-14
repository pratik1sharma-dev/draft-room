'use client'

import { Suspense } from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { completeClientOnboarding, completeDraftmanOnboarding } from '@/lib/actions/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const SKILLS = ['AutoCAD', 'Revit', 'SketchUp', '3D Rendering', 'Structural Drawings', 'BIM']
const PROJECT_TYPES = ['Residential', 'Commercial', 'Industrial', 'Interior Design', 'Landscape']
const INDIA_STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala',
  'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'West Bengal',
]

function OnboardingForm() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') === 'draftsman' ? 'draftsman' : 'client'
  const action = role === 'client' ? completeClientOnboarding : completeDraftmanOnboarding
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <p className="blueprint-label mb-2">
          {role === 'draftsman' ? 'Drafter Profile' : 'Client Profile'}
        </p>
        <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)]">
          Complete your profile
        </h1>
        <p className="text-[var(--color-blueprint-text-secondary)] text-sm mt-1">
          This is shown publicly on your profile.
        </p>
      </div>

      <Input name="name" placeholder="Full name" required />
      <Input name="phone" placeholder="Phone number (optional)" type="tel" />

      <div className="grid grid-cols-2 gap-3">
        <Input name="city" placeholder="City" required />
        <select
          name="state"
          required
          className="h-10 px-3 rounded-md text-sm bg-[var(--color-blueprint-surface)] border border-[var(--color-blueprint-border-strong)] text-[var(--color-blueprint-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blueprint-accent)]"
        >
          <option value="">State</option>
          {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {role === 'client' && (
        <>
          <Input name="firm_name" placeholder="Firm / company name (optional)" />
          <div>
            <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-2">Project types</p>
            <div className="flex flex-wrap gap-3">
              {PROJECT_TYPES.map(pt => (
                <label key={pt} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="project_types" value={pt} className="accent-[var(--color-blueprint-accent)]" />
                  <span className="text-sm text-[var(--color-blueprint-text-secondary)]">{pt}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {role === 'draftsman' && (
        <>
          <div>
            <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-2">Skills (select all that apply)</p>
            <div className="flex flex-wrap gap-3">
              {SKILLS.map(skill => (
                <label key={skill} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" name="skills" value={skill} className="accent-[var(--color-blueprint-accent)]" />
                  <span className="text-sm text-[var(--color-blueprint-text-secondary)]">{skill}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input name="hourly_rate" placeholder="Hourly rate (₹)" type="number" min="1" required />
            <Input name="experience_years" placeholder="Years of experience" type="number" min="0" required />
          </div>
          <Input name="linkedin_url" placeholder="LinkedIn URL (for verification)" type="url" />
        </>
      )}

      {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving...' : 'Complete profile →'}
      </Button>
    </form>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="text-[var(--color-blueprint-text-secondary)] text-sm">Loading...</div>}>
      <OnboardingForm />
    </Suspense>
  )
}
