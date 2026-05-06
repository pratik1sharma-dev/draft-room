'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const SKILLS = ['AutoCAD', 'Revit', 'SketchUp', '3D Rendering', 'Structural Drawings', 'BIM']

interface SkillFilterProps {
  type: 'drafters' | 'jobs'
}

export function SkillFilter({ type }: SkillFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/${type}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select
        className="w-44"
        value={searchParams.get('skill') ?? ''}
        onChange={e => handleChange('skill', e.target.value)}
      >
        <option value="">All skills</option>
        {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
      </Select>

      {type === 'drafters' && (
        <>
          <input
            type="text"
            placeholder="City..."
            defaultValue={searchParams.get('city') ?? ''}
            onBlur={e => handleChange('city', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChange('city', (e.target as HTMLInputElement).value)}
            className="h-10 w-32 px-3 rounded-md text-sm bg-[var(--color-blueprint-surface)] border border-[var(--color-blueprint-border-strong)] text-[var(--color-blueprint-text-primary)] placeholder:text-[var(--color-blueprint-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blueprint-accent)]"
          />
          <Select
            className="w-36"
            value={searchParams.get('max_rate') ?? ''}
            onChange={e => handleChange('max_rate', e.target.value)}
          >
            <option value="">Any rate</option>
            <option value="500">Up to ₹500/hr</option>
            <option value="1000">Up to ₹1000/hr</option>
            <option value="2000">Up to ₹2000/hr</option>
            <option value="5000">Up to ₹5000/hr</option>
          </Select>
        </>
      )}

      {type === 'jobs' && (
        <Select
          className="w-36"
          value={searchParams.get('budget_type') ?? ''}
          onChange={e => handleChange('budget_type', e.target.value)}
        >
          <option value="">Any type</option>
          <option value="fixed">Fixed price</option>
          <option value="hourly">Hourly</option>
        </Select>
      )}

      {(searchParams.get('skill') || searchParams.get('max_rate') || searchParams.get('budget_type') || searchParams.get('city')) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/${type}`)}
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}
