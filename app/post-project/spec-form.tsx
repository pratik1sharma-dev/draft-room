'use client'

import { useState, useTransition } from 'react'
import { useActionState } from 'react'
import { generateProjectSpec, type ProjectSpec } from '@/lib/actions/ai'
import { createJob } from '@/lib/actions/jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const PROJECT_TYPES = [
  'Residential bungalow / villa',
  'Apartment complex',
  'Commercial office',
  'Retail / shop fit-out',
  'Interior design',
  'Industrial / warehouse',
  'Institutional (school, hospital)',
  'Landscape / site development',
  'Structural drawings only',
  'Other',
]

const SKILLS = ['AutoCAD', 'Revit', 'SketchUp', '3D Rendering', 'Structural Drawings', 'BIM']

export function SpecForm() {
  const [step, setStep] = useState<'intake' | 'review'>('intake')
  const [spec, setSpec] = useState<ProjectSpec | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isGenerating, startGenerating] = useTransition()

  // Editable spec state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deliverables, setDeliverables] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')

  const [postState, postAction, isPosting] = useActionState(createJob, null)

  function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setAiError(null)

    startGenerating(async () => {
      const result = await generateProjectSpec({
        projectType: fd.get('project_type') as string,
        city: fd.get('city') as string,
        description: fd.get('brief') as string,
      })

      if (result.error) {
        setAiError(result.error)
        return
      }

      const s = result.spec!
      setSpec(s)
      setTitle(s.title)
      setDescription(s.description)
      setDeliverables(s.deliverables)
      setSkills(s.skills_required)
      setBudgetMin(String(s.budget_min))
      setBudgetMax(String(s.budget_max))
      setStep('review')
    })
  }

  if (step === 'intake') {
    return (
      <form onSubmit={handleGenerate} className="space-y-5 blueprint-card p-6">
        <div>
          <p className="text-sm font-medium text-[var(--color-blueprint-text-primary)] mb-1">
            Tell us about your project in plain language.
          </p>
          <p className="text-xs text-[var(--color-blueprint-text-muted)]">
            AI will generate a detailed spec, deliverables list, and budget estimate.
          </p>
        </div>

        <div>
          <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Project type</label>
          <select
            name="project_type"
            required
            className="w-full h-10 px-3 rounded-md text-sm bg-[var(--color-blueprint-surface)] border border-[var(--color-blueprint-border-strong)] text-[var(--color-blueprint-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blueprint-accent)]"
          >
            <option value="">Select project type</option>
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">City</label>
          <Input name="city" placeholder="e.g. Mumbai, Ahmedabad, Bengaluru" required />
        </div>

        <div>
          <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">
            Describe your project briefly
          </label>
          <Textarea
            name="brief"
            placeholder="e.g. G+1 residential bungalow, 2400 sqft plot, need permit drawings for AUDA submission. Vastu compliant layout already decided."
            className="min-h-[100px]"
            required
          />
        </div>

        {aiError && <p className="text-red-400 text-sm">{aiError}</p>}

        <Button type="submit" className="w-full" disabled={isGenerating}>
          {isGenerating ? 'Generating spec...' : 'Generate project spec with AI →'}
        </Button>
      </form>
    )
  }

  // Review step
  const deliverablesText = deliverables.join('\n')

  return (
    <form action={postAction} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-px bg-[var(--color-blueprint-accent)]" />
        <span className="text-xs text-[var(--color-blueprint-accent)] font-medium">AI GENERATED — REVIEW AND EDIT</span>
        <div className="flex-1 h-px bg-[var(--color-blueprint-accent)]" />
      </div>

      <div className="blueprint-card p-6 space-y-5">
        <p className="blueprint-label">// PROJECT DETAILS</p>

        <div>
          <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Title</label>
          <Input name="title" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Description</label>
          <Textarea
            name="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="min-h-[140px]"
            required
          />
        </div>
      </div>

      <div className="blueprint-card p-6 space-y-4">
        <p className="blueprint-label">// DELIVERABLES</p>
        <p className="text-xs text-[var(--color-blueprint-text-muted)]">One per line. Edit as needed — this becomes the agreed checklist.</p>
        <Textarea
          name="deliverables_text"
          value={deliverablesText}
          onChange={e => setDeliverables(e.target.value.split('\n').filter(Boolean))}
          className="min-h-[140px] font-mono text-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {deliverables.map(d => (
            <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-blueprint-overlay)] border border-[var(--color-blueprint-border)] text-[var(--color-blueprint-text-muted)]">
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="blueprint-card p-6 space-y-4">
        <p className="blueprint-label">// SKILLS & BUDGET</p>

        <div>
          <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-2">Skills required</label>
          <div className="flex flex-wrap gap-3">
            {SKILLS.map(skill => (
              <label key={skill} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="skills"
                  value={skill}
                  checked={skills.includes(skill)}
                  onChange={e => setSkills(prev => e.target.checked ? [...prev, skill] : prev.filter(s => s !== skill))}
                  className="accent-[var(--color-blueprint-accent)]"
                />
                <span className="text-sm text-[var(--color-blueprint-text-secondary)]">{skill}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Budget min (₹)</label>
            <Input name="budget_min" type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Budget max (₹)</label>
            <Input name="budget_max" type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Deadline (optional)</label>
          <Input name="deadline" type="date" />
        </div>
      </div>

      {postState?.error && <p className="text-red-400 text-sm">{postState.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPosting}>
          {isPosting ? 'Posting...' : 'Post project →'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setStep('intake')}>
          Regenerate
        </Button>
      </div>
    </form>
  )
}
