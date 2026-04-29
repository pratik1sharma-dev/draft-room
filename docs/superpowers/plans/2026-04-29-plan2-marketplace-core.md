# Drafting Platform — Plan 2: Marketplace Core

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full marketplace loop — post a job, browse draftsmen, apply, accept, create a contract — so the platform is usable end-to-end.

**Architecture:** Server Components fetch data directly via Supabase server client. Server Actions handle all mutations (post job, apply, accept, reject). Client Components only for interactive UI (filters, modals). Pages are dynamic (`force-dynamic`) since all data is user-specific or real-time.

**Tech Stack:** Next.js 15 App Router, Supabase (PostgreSQL + RLS), Tailwind CSS v4, existing `Button`, `Input`, `Badge` components, `cn()` utility.

**This is Plan 2 of 3:**
- **Plan 1 (done):** Foundation — auth, onboarding, design system, landing page
- **Plan 2 (this):** Marketplace Core — profiles, jobs, browse, applications, contracts, dashboards
- **Plan 3:** Engagement & Trust — realtime chat, payments + invoices, reviews, badges, resources

---

## File Structure

Files created or modified in this plan:

```
app/
├── draftsmen/
│   ├── page.tsx                          # Browse draftsmen — public, filterable grid
│   └── [id]/
│       ├── page.tsx                      # Public draftsman profile
│       └── hire/page.tsx                 # Direct hire form (client, auth)
├── jobs/
│   ├── page.tsx                          # Browse open jobs — public, filterable list
│   └── [id]/
│       └── page.tsx                      # Job detail + apply form (draftsman, auth)
├── post-job/
│   └── page.tsx                          # Post a job (client, auth)
├── applications/
│   └── page.tsx                          # Applications inbox — client sees received, draftsman sees sent
├── contracts/
│   └── page.tsx                          # Active contracts list (both roles)
└── dashboard/
    └── page.tsx                          # Updated: real stats + quick links

components/
├── marketplace/
│   ├── draftsman-card.tsx               # Card for browse draftsmen grid
│   ├── job-card.tsx                     # Card for jobs list
│   ├── skill-filter.tsx                 # Skill/city/rate filter bar (client component)
│   ├── apply-form.tsx                   # Apply to job form (client component)
│   └── suggested-draftsmen.tsx          # Post-job matching suggestions
└── ui/
    ├── textarea.tsx                     # Blueprint-styled textarea
    └── select.tsx                      # Blueprint-styled select

lib/
├── data/
│   ├── draftsmen.ts                     # getDraftsmen, getDraftsman, getSuggestedDraftsmen
│   ├── jobs.ts                          # getJobs, getJob, getClientJobs
│   └── applications.ts                  # getApplicationsForJob, getDraftsmanApplications, getContractApplications
├── actions/
│   ├── jobs.ts                          # createJob, updateJobStatus
│   ├── applications.ts                  # applyToJob, acceptApplication, rejectApplication, sendDirectOffer
│   └── contracts.ts                     # getContracts (read), markContractComplete
└── validations/
    └── jobs.ts                          # jobSchema (Zod)
```

---

## Task 1: Textarea + Select UI Components

**Files:**
- Create: `components/ui/textarea.tsx`
- Create: `components/ui/select.tsx`

- [ ] **Step 1: Create components/ui/textarea.tsx**

```typescript
import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full min-h-[100px] px-3 py-2 rounded-md text-sm resize-y',
          'bg-[var(--color-blueprint-surface)] border border-white/10',
          'text-[var(--color-blueprint-text-primary)] placeholder:text-[var(--color-blueprint-text-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-blueprint-accent)] focus:border-transparent',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
```

- [ ] **Step 2: Create components/ui/select.tsx**

```typescript
import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-md text-sm appearance-none',
          'bg-[var(--color-blueprint-surface)] border border-white/10',
          'text-[var(--color-blueprint-text-primary)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-blueprint-accent)] focus:border-transparent',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'

export { Select }
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/textarea.tsx components/ui/select.tsx
git commit -m "feat: add Textarea and Select UI components"
```

---

## Task 2: Job Validation Schema

**Files:**
- Create: `lib/validations/jobs.ts`

- [ ] **Step 1: Create lib/validations/jobs.ts**

```typescript
import { z } from 'zod'

export const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  skills_required: z.array(z.string()).min(1, 'Select at least one skill'),
  budget_type: z.enum(['fixed', 'hourly']),
  budget_amount: z.number().min(1, 'Budget must be greater than 0'),
  deadline: z.string().optional(),
})
```

- [ ] **Step 2: Commit**

```bash
git add lib/validations/jobs.ts
git commit -m "feat: add job validation schema"
```

---

## Task 3: Data Fetching Utilities

**Files:**
- Create: `lib/data/draftsmen.ts`
- Create: `lib/data/jobs.ts`
- Create: `lib/data/applications.ts`

- [ ] **Step 1: Create lib/data/draftsmen.ts**

```typescript
import { createClient } from '@/lib/supabase/server'

export async function getDraftsmen(filters?: {
  skill?: string
  city?: string
  max_rate?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select(`
      *,
      users!inner(id, name, city, state, role)
    `)
    .eq('users.role', 'draftsman')
    .eq('availability', true)
    .order('is_verified', { ascending: false })

  if (filters?.skill) {
    query = query.contains('skills', [filters.skill])
  }
  if (filters?.city) {
    query = query.ilike('users.city', `%${filters.city}%`)
  }
  if (filters?.max_rate) {
    query = query.lte('hourly_rate', filters.max_rate)
  }

  const { data, error } = await query
  if (error) return []
  return data
}

export async function getDraftsman(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      users!inner(id, name, email, city, state, role, created_at)
    `)
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data
}

export async function getSuggestedDraftsmen(skills: string[]) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      users!inner(id, name, city, state, role)
    `)
    .eq('users.role', 'draftsman')
    .eq('availability', true)
    .overlaps('skills', skills)
    .limit(5)

  if (error) return []
  return data
}
```

- [ ] **Step 2: Create lib/data/jobs.ts**

```typescript
import { createClient } from '@/lib/supabase/server'

export async function getJobs(filters?: {
  skill?: string
  budget_type?: 'fixed' | 'hourly'
  min_budget?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('jobs')
    .select(`
      *,
      users!inner(id, name, city, state)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (filters?.skill) {
    query = query.contains('skills_required', [filters.skill])
  }
  if (filters?.budget_type) {
    query = query.eq('budget_type', filters.budget_type)
  }
  if (filters?.min_budget) {
    query = query.gte('budget_amount', filters.min_budget)
  }

  const { data, error } = await query
  if (error) return []
  return data
}

export async function getJob(jobId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      users!inner(id, name, city, state)
    `)
    .eq('id', jobId)
    .single()

  if (error) return null
  return data
}

export async function getClientJobs(clientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}
```

- [ ] **Step 3: Create lib/data/applications.ts**

```typescript
import { createClient } from '@/lib/supabase/server'

export async function getApplicationsForJob(jobId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      users!inner(id, name, city, state),
      profiles!inner(skills, hourly_rate, experience_years, is_verified, avatar_url)
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getDraftsmanApplications(draftsmanId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs!inner(id, title, description, budget_type, budget_amount, status,
        users!inner(id, name, city)
      )
    `)
    .eq('draftsman_id', draftsmanId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getContracts(userId: string, role: 'client' | 'draftsman') {
  const supabase = await createClient()

  const field = role === 'client' ? 'client_id' : 'draftsman_id'

  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      jobs!inner(id, title, description),
      client:users!contracts_client_id_fkey(id, name),
      draftsman:users!contracts_draftsman_id_fkey(id, name)
    `)
    .eq(field, userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/data/
git commit -m "feat: add data fetching utilities for draftsmen, jobs, applications"
```

---

## Task 4: Server Actions — Jobs

**Files:**
- Create: `lib/actions/jobs.ts`

- [ ] **Step 1: Create lib/actions/jobs.ts**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { jobSchema } from '@/lib/validations/jobs'

export async function createJob(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = jobSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    skills_required: formData.getAll('skills_required'),
    budget_type: formData.get('budget_type'),
    budget_amount: Number(formData.get('budget_amount')),
    deadline: formData.get('deadline') || undefined,
  })

  if (!result.success) return { error: result.error.issues[0].message }

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      client_id: user.id,
      ...result.data,
      deadline: result.data.deadline || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  redirect(`/jobs/${job.id}?posted=true`)
}

export async function updateJobStatus(
  jobId: string,
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .eq('client_id', user.id)

  if (error) return { error: error.message }
  return null
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/actions/jobs.ts
git commit -m "feat: add job server actions (createJob, updateJobStatus)"
```

---

## Task 5: Server Actions — Applications + Contracts

**Files:**
- Create: `lib/actions/applications.ts`

- [ ] **Step 1: Create lib/actions/applications.ts**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function applyToJob(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const jobId = formData.get('job_id') as string
  const coverNote = formData.get('cover_note') as string
  const proposedRate = Number(formData.get('proposed_rate'))

  if (!proposedRate || proposedRate < 1) return { error: 'Proposed rate is required' }
  if (!coverNote?.trim()) return { error: 'Cover note is required' }

  const { error } = await supabase.from('applications').insert({
    job_id: jobId,
    draftsman_id: user.id,
    cover_note: coverNote,
    proposed_rate: proposedRate,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You have already applied to this job' }
    return { error: error.message }
  }

  revalidatePath(`/jobs/${jobId}`)
  redirect('/applications')
}

export async function acceptApplication(applicationId: string, jobId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get the application
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (appError || !application) return { error: 'Application not found' }

  // Accept this application
  const { error: acceptError } = await supabase
    .from('applications')
    .update({ status: 'accepted' })
    .eq('id', applicationId)

  if (acceptError) return { error: acceptError.message }

  // Reject all other applications for this job
  await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('job_id', jobId)
    .neq('id', applicationId)

  // Create contract
  const { error: contractError } = await supabase.from('contracts').insert({
    job_id: jobId,
    client_id: user.id,
    draftsman_id: application.draftsman_id,
    agreed_rate: application.proposed_rate,
  })

  if (contractError) return { error: contractError.message }

  // Update job status
  await supabase
    .from('jobs')
    .update({ status: 'in_progress' })
    .eq('id', jobId)

  revalidatePath('/applications')
  revalidatePath('/contracts')
  redirect('/contracts')
}

export async function rejectApplication(applicationId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  revalidatePath('/applications')
  return null
}

export async function sendDirectOffer(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const draftsmanId = formData.get('draftsman_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const budgetAmount = Number(formData.get('budget_amount'))
  const budgetType = formData.get('budget_type') as 'fixed' | 'hourly'

  if (!title || title.length < 5) return { error: 'Title must be at least 5 characters' }
  if (!description || description.length < 20) return { error: 'Description must be at least 20 characters' }
  if (!budgetAmount || budgetAmount < 1) return { error: 'Budget is required' }

  // Create a job and immediately create an accepted application + contract
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      client_id: user.id,
      title,
      description,
      skills_required: [],
      budget_type: budgetType,
      budget_amount: budgetAmount,
      status: 'in_progress',
    })
    .select()
    .single()

  if (jobError) return { error: jobError.message }

  const { data: application, error: appError } = await supabase
    .from('applications')
    .insert({
      job_id: job.id,
      draftsman_id: draftsmanId,
      cover_note: 'Direct hire offer',
      proposed_rate: budgetAmount,
      status: 'accepted',
    })
    .select()
    .single()

  if (appError) return { error: appError.message }

  const { error: contractError } = await supabase.from('contracts').insert({
    job_id: job.id,
    client_id: user.id,
    draftsman_id: draftsmanId,
    agreed_rate: budgetAmount,
  })

  if (contractError) return { error: contractError.message }

  redirect('/contracts')
}

export async function markContractComplete(contractId: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: contract, error: fetchError } = await supabase
    .from('contracts')
    .select('job_id')
    .eq('id', contractId)
    .eq('client_id', user.id)
    .single()

  if (fetchError || !contract) return { error: 'Contract not found' }

  await supabase.from('contracts').update({ status: 'completed' }).eq('id', contractId)
  await supabase.from('jobs').update({ status: 'completed' }).eq('id', contract.job_id)

  revalidatePath('/contracts')
  return null
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/actions/applications.ts
git commit -m "feat: add application and contract server actions"
```

---

## Task 6: Marketplace UI Components

**Files:**
- Create: `components/marketplace/draftsman-card.tsx`
- Create: `components/marketplace/job-card.tsx`
- Create: `components/marketplace/skill-filter.tsx`
- Create: `components/marketplace/apply-form.tsx`
- Create: `components/marketplace/suggested-draftsmen.tsx`

- [ ] **Step 1: Create components/marketplace/draftsman-card.tsx**

```typescript
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface DraftsmanCardProps {
  profile: {
    user_id: string
    skills: string[]
    hourly_rate: number | null
    experience_years: number | null
    is_verified: boolean
    is_founding_member: boolean
    availability: boolean
    avatar_url: string | null
    users: { id: string; name: string; city: string | null; state: string | null }
  }
}

export function DraftsmanCard({ profile }: DraftsmanCardProps) {
  return (
    <Link href={`/draftsmen/${profile.user_id}`} className="blueprint-card p-5 block hover:border-[var(--color-blueprint-accent)]/40 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-[var(--color-blueprint-text-primary)] group-hover:text-[var(--color-blueprint-accent)] transition-colors">
              {profile.users.name}
            </h3>
            {profile.is_verified && <Badge variant="verified">Verified</Badge>}
            {profile.is_founding_member && <Badge variant="founding">Founder</Badge>}
          </div>
          <p className="text-sm text-[var(--color-blueprint-text-muted)]">
            {[profile.users.city, profile.users.state].filter(Boolean).join(', ')}
          </p>
        </div>
        {profile.availability && <Badge variant="available">Available</Badge>}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {profile.skills.slice(0, 4).map(skill => (
          <Badge key={skill} variant="skill">{skill}</Badge>
        ))}
        {profile.skills.length > 4 && (
          <Badge variant="skill">+{profile.skills.length - 4}</Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--color-blueprint-text-secondary)]">
          {profile.experience_years ? `${profile.experience_years} yrs exp` : 'Experience not listed'}
        </span>
        <span className="font-medium text-[var(--color-blueprint-accent)]">
          {profile.hourly_rate ? `₹${profile.hourly_rate}/hr` : 'Rate on request'}
        </span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create components/marketplace/job-card.tsx**

```typescript
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface JobCardProps {
  job: {
    id: string
    title: string
    description: string
    skills_required: string[]
    budget_type: string
    budget_amount: number
    deadline: string | null
    created_at: string
    users: { name: string; city: string | null }
  }
}

export function JobCard({ job }: JobCardProps) {
  const postedDaysAgo = Math.floor(
    (Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Link href={`/jobs/${job.id}`} className="blueprint-card p-5 block hover:border-[var(--color-blueprint-accent)]/40 transition-colors group">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-[var(--color-blueprint-text-primary)] group-hover:text-[var(--color-blueprint-accent)] transition-colors">
          {job.title}
        </h3>
        <span className="text-sm font-medium text-[var(--color-blueprint-accent)] shrink-0 ml-4">
          ₹{job.budget_amount.toLocaleString('en-IN')}
          {job.budget_type === 'hourly' ? '/hr' : ' fixed'}
        </span>
      </div>

      <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-3 line-clamp-2">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.skills_required.slice(0, 4).map(skill => (
          <Badge key={skill} variant="skill">{skill}</Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--color-blueprint-text-muted)]">
        <span>{job.users.name} · {job.users.city}</span>
        <span>{postedDaysAgo === 0 ? 'Today' : `${postedDaysAgo}d ago`}</span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: Create components/marketplace/skill-filter.tsx**

```typescript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const SKILLS = ['AutoCAD', 'Revit', 'SketchUp', '3D Rendering', 'Structural Drawings', 'BIM']

interface SkillFilterProps {
  type: 'draftsmen' | 'jobs'
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

      {type === 'draftsmen' && (
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

      {(searchParams.get('skill') || searchParams.get('max_rate') || searchParams.get('budget_type')) && (
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
```

- [ ] **Step 4: Create components/marketplace/apply-form.tsx**

```typescript
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
```

- [ ] **Step 5: Create components/marketplace/suggested-draftsmen.tsx**

```typescript
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface SuggestedDraftsmenProps {
  draftsmen: Array<{
    user_id: string
    skills: string[]
    hourly_rate: number | null
    is_verified: boolean
    users: { id: string; name: string; city: string | null }
  }>
}

export function SuggestedDraftsmen({ draftsmen }: SuggestedDraftsmenProps) {
  if (draftsmen.length === 0) return null

  return (
    <div className="mt-8">
      <p className="blueprint-label mb-3">// SUGGESTED MATCHES</p>
      <h2 className="text-lg font-semibold text-[var(--color-blueprint-text-primary)] mb-4">
        Draftsmen who match your job
      </h2>
      <div className="space-y-3">
        {draftsmen.map(d => (
          <Link
            key={d.user_id}
            href={`/draftsmen/${d.user_id}`}
            className="blueprint-card p-4 flex items-center justify-between hover:border-[var(--color-blueprint-accent)]/40 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-[var(--color-blueprint-text-primary)]">{d.users.name}</span>
                {d.is_verified && <Badge variant="verified">Verified</Badge>}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {d.skills.slice(0, 3).map(s => <Badge key={s} variant="skill">{s}</Badge>)}
              </div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-sm font-medium text-[var(--color-blueprint-accent)]">
                {d.hourly_rate ? `₹${d.hourly_rate}/hr` : 'Rate on request'}
              </p>
              <p className="text-xs text-[var(--color-blueprint-text-muted)]">{d.users.city}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add components/marketplace/
git commit -m "feat: add marketplace UI components (cards, filters, apply form)"
```

---

## Task 7: Browse Draftsmen Page

**Files:**
- Create: `app/draftsmen/page.tsx`

- [ ] **Step 1: Create app/draftsmen/page.tsx**

```typescript
import { Suspense } from 'react'
import { getDraftsmen } from '@/lib/data/draftsmen'
import { DraftsmanCard } from '@/components/marketplace/draftsman-card'
import { SkillFilter } from '@/components/marketplace/skill-filter'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ skill?: string; city?: string; max_rate?: string }>
}

async function DraftsmenGrid({ searchParams }: Props) {
  const params = await searchParams
  const draftsmen = await getDraftsmen({
    skill: params.skill,
    city: params.city,
    max_rate: params.max_rate ? Number(params.max_rate) : undefined,
  })

  return (
    <>
      {draftsmen.length === 0 ? (
        <div className="col-span-3 py-16 text-center text-[var(--color-blueprint-text-secondary)]">
          No draftsmen found matching your filters.
        </div>
      ) : (
        draftsmen.map((profile: any) => (
          <DraftsmanCard key={profile.user_id} profile={profile} />
        ))
      )}
    </>
  )
}

export default async function DraftsmenPage(props: Props) {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="blueprint-label mb-2">// FIND TALENT</p>
        <h1 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-4">
          Browse Draftsmen
        </h1>
        <Suspense fallback={null}>
          <SkillFilter type="draftsmen" />
        </Suspense>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Suspense
          fallback={
            <div className="col-span-3 py-16 text-center text-[var(--color-blueprint-text-secondary)]">
              Loading draftsmen...
            </div>
          }
        >
          <DraftsmenGrid searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/draftsmen/page.tsx
git commit -m "feat: add browse draftsmen page with skill/rate filters"
```

---

## Task 8: Draftsman Public Profile Page

**Files:**
- Create: `app/draftsmen/[id]/page.tsx`

- [ ] **Step 1: Create app/draftsmen/[id]/page.tsx**

```typescript
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDraftsman } from '@/lib/data/draftsmen'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DraftsmanProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getDraftsman(id)

  if (!profile) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: currentUserData } = user
    ? await supabase.from('users').select('role').eq('id', user.id).single()
    : { data: null }

  const isClient = currentUserData?.role === 'client'

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="blueprint-card p-8 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)]">
                {(profile as any).users.name}
              </h1>
              {profile.is_verified && <Badge variant="verified">Verified</Badge>}
              {profile.is_founding_member && <Badge variant="founding">Founding Member</Badge>}
              {profile.availability && <Badge variant="available">Available</Badge>}
            </div>
            <p className="text-[var(--color-blueprint-text-secondary)]">
              {[(profile as any).users.city, (profile as any).users.state].filter(Boolean).join(', ')}
            </p>
          </div>

          {isClient && (
            <Button asChild>
              <Link href={`/draftsmen/${id}/hire`}>Hire Directly →</Link>
            </Button>
          )}
        </div>

        {profile.bio && (
          <p className="mt-4 text-[var(--color-blueprint-text-secondary)] leading-relaxed">
            {profile.bio}
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/8">
          <div>
            <p className="blueprint-label mb-1">Hourly Rate</p>
            <p className="text-lg font-semibold text-[var(--color-blueprint-accent)]">
              {profile.hourly_rate ? `₹${profile.hourly_rate}/hr` : 'On request'}
            </p>
          </div>
          <div>
            <p className="blueprint-label mb-1">Experience</p>
            <p className="text-[var(--color-blueprint-text-primary)]">
              {profile.experience_years ? `${profile.experience_years} years` : 'Not listed'}
            </p>
          </div>
          {profile.linkedin_url && (
            <div>
              <p className="blueprint-label mb-1">LinkedIn</p>
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-blueprint-accent)] hover:underline text-sm"
              >
                View profile →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="blueprint-card p-6 mb-6">
        <p className="blueprint-label mb-3">// SKILLS</p>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill: string) => (
            <Badge key={skill} variant="skill" className="text-sm px-3 py-1">{skill}</Badge>
          ))}
        </div>
      </div>

      {/* Portfolio */}
      {profile.portfolio_urls.length > 0 && (
        <div className="blueprint-card p-6">
          <p className="blueprint-label mb-3">// PORTFOLIO</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {profile.portfolio_urls.map((url: string, i: number) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-video bg-[var(--color-blueprint-surface-2)] rounded-md overflow-hidden border border-white/8 hover:border-[var(--color-blueprint-accent)]/40 transition-colors flex items-center justify-center"
              >
                <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/draftsmen/
git commit -m "feat: add public draftsman profile page"
```

---

## Task 9: Post a Job Page

**Files:**
- Create: `app/post-job/page.tsx`

- [ ] **Step 1: Create app/post-job/page.tsx**

```typescript
'use client'

import { useActionState } from 'react'
import { createJob } from '@/lib/actions/jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const dynamic = 'force-dynamic'

const SKILLS = ['AutoCAD', 'Revit', 'SketchUp', '3D Rendering', 'Structural Drawings', 'BIM']

export default function PostJobPage() {
  const [state, formAction, isPending] = useActionState(createJob, null)

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// NEW PROJECT</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-8">
        Post a Job
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
```

Note: `Select` is used directly in this client component — add the import at top:
```typescript
import { Select } from '@/components/ui/select'
```

- [ ] **Step 2: Add Post Job link to header nav**

In `components/layout/header.tsx`, update the nav section to include post-job link for logged-in clients. Add after the existing nav links inside the `{user ? ...}` check:

Modify the authenticated section:
```typescript
{user ? (
  <div className="flex items-center gap-3">
    <Button variant="ghost" size="sm" asChild>
      <Link href="/post-job">Post a Job</Link>
    </Button>
    <Button variant="ghost" size="sm" asChild>
      <Link href="/dashboard">Dashboard</Link>
    </Button>
    <form action={signOut}>
      <Button variant="outline" size="sm" type="submit">Sign out</Button>
    </form>
  </div>
) : (
```

- [ ] **Step 3: Commit**

```bash
git add app/post-job/ components/layout/header.tsx
git commit -m "feat: add post job page and header link"
```

---

## Task 10: Browse Jobs + Job Detail Pages

**Files:**
- Create: `app/jobs/page.tsx`
- Create: `app/jobs/[id]/page.tsx`

- [ ] **Step 1: Create app/jobs/page.tsx**

```typescript
import { Suspense } from 'react'
import { getJobs } from '@/lib/data/jobs'
import { JobCard } from '@/components/marketplace/job-card'
import { SkillFilter } from '@/components/marketplace/skill-filter'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ skill?: string; budget_type?: string }>
}

async function JobsGrid({ searchParams }: Props) {
  const params = await searchParams
  const jobs = await getJobs({
    skill: params.skill,
    budget_type: params.budget_type as 'fixed' | 'hourly' | undefined,
  })

  return (
    <>
      {jobs.length === 0 ? (
        <div className="py-16 text-center text-[var(--color-blueprint-text-secondary)]">
          No jobs found matching your filters.
        </div>
      ) : (
        jobs.map((job: any) => <JobCard key={job.id} job={job} />)
      )}
    </>
  )
}

export default async function JobsPage(props: Props) {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="blueprint-label mb-2">// OPEN PROJECTS</p>
        <h1 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-4">
          Browse Jobs
        </h1>
        <Suspense fallback={null}>
          <SkillFilter type="jobs" />
        </Suspense>
      </div>

      <div className="space-y-4">
        <Suspense
          fallback={
            <div className="py-16 text-center text-[var(--color-blueprint-text-secondary)]">
              Loading jobs...
            </div>
          }
        >
          <JobsGrid searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create app/jobs/[id]/page.tsx**

```typescript
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getJob } from '@/lib/data/jobs'
import { Badge } from '@/components/ui/badge'
import { ApplyForm } from '@/components/marketplace/apply-form'
import { SuggestedDraftsmen } from '@/components/marketplace/suggested-draftsmen'
import { getSuggestedDraftsmen } from '@/lib/data/draftsmen'

export const dynamic = 'force-dynamic'

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ posted?: string }>
}) {
  const { id } = await params
  const { posted } = await searchParams
  const job = await getJob(id)

  if (!job) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: currentUserData } = user
    ? await supabase.from('users').select('role').eq('id', user.id).single()
    : { data: null }

  const isDraftsman = currentUserData?.role === 'draftsman'
  const isOwner = user?.id === (job as any).users.id

  // Check if draftsman already applied
  let hasApplied = false
  if (isDraftsman && user) {
    const { data } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', id)
      .eq('draftsman_id', user.id)
      .single()
    hasApplied = !!data
  }

  const suggestedDraftsmen = isOwner
    ? await getSuggestedDraftsmen((job as any).skills_required)
    : []

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {posted && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          Job posted successfully! Draftsmen can now apply.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Job details */}
        <div className="md:col-span-2 space-y-6">
          <div className="blueprint-card p-6">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <p className="blueprint-label mb-1">// PROJECT</p>
                <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)]">
                  {(job as any).title}
                </h1>
                <p className="text-sm text-[var(--color-blueprint-text-muted)] mt-1">
                  Posted by {(job as any).users.name} · {(job as any).users.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[var(--color-blueprint-accent)]">
                  ₹{(job as any).budget_amount.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-[var(--color-blueprint-text-muted)]">
                  {(job as any).budget_type === 'hourly' ? 'per hour' : 'fixed price'}
                </p>
              </div>
            </div>

            <p className="text-[var(--color-blueprint-text-secondary)] leading-relaxed mb-4">
              {(job as any).description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {(job as any).skills_required.map((skill: string) => (
                <Badge key={skill} variant="skill">{skill}</Badge>
              ))}
            </div>

            {(job as any).deadline && (
              <p className="mt-4 text-sm text-[var(--color-blueprint-text-muted)]">
                Deadline: {new Date((job as any).deadline).toLocaleDateString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {/* Apply sidebar */}
        <div>
          {isDraftsman && (job as any).status === 'open' && (
            <div className="blueprint-card p-5">
              <p className="blueprint-label mb-3">// APPLY</p>
              {hasApplied ? (
                <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
                  You have already applied to this job.
                </p>
              ) : (
                <ApplyForm jobId={id} />
              )}
            </div>
          )}

          {!user && (
            <div className="blueprint-card p-5 text-center">
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-3">
                Sign in as a draftsman to apply
              </p>
              <a href="/login" className="text-[var(--color-blueprint-accent)] text-sm hover:underline">
                Sign in →
              </a>
            </div>
          )}

          {(job as any).status !== 'open' && (
            <div className="blueprint-card p-5">
              <Badge variant="skill" className="text-sm">{(job as any).status.replace('_', ' ')}</Badge>
              <p className="text-sm text-[var(--color-blueprint-text-secondary)] mt-2">
                This job is no longer accepting applications.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Suggested draftsmen (shown to job owner after posting) */}
      {isOwner && <SuggestedDraftsmen draftsmen={suggestedDraftsmen as any} />}
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/jobs/
git commit -m "feat: add browse jobs and job detail pages with apply form"
```

---

## Task 11: Direct Hire Page

**Files:**
- Create: `app/draftsmen/[id]/hire/page.tsx`

- [ ] **Step 1: Create app/draftsmen/[id]/hire/page.tsx**

```typescript
'use client'

import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import { sendDirectOffer } from '@/lib/actions/applications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

export const dynamic = 'force-dynamic'

export default function DirectHirePage() {
  const params = useParams()
  const draftsmanId = params.id as string
  const [state, formAction, isPending] = useActionState(sendDirectOffer, null)

  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// DIRECT HIRE</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-8">
        Send a Direct Offer
      </h1>

      <form action={formAction} className="space-y-5 blueprint-card p-6">
        <input type="hidden" name="draftsman_id" value={draftsmanId} />

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

        {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Sending offer...' : 'Send offer →'}
        </Button>
      </form>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/draftsmen/
git commit -m "feat: add direct hire page"
```

---

## Task 12: Applications Inbox

**Files:**
- Create: `app/applications/page.tsx`

- [ ] **Step 1: Create app/applications/page.tsx**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getApplicationsForJob, getDraftsmanApplications } from '@/lib/data/applications'
import { getClientJobs } from '@/lib/data/jobs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { acceptApplication, rejectApplication } from '@/lib/actions/applications'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, 'verified' | 'founding' | 'available' | 'skill'> = {
  pending: 'skill',
  accepted: 'available',
  rejected: 'skill',
}

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData) redirect('/onboarding')

  const isClient = userData.role === 'client'

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// APPLICATIONS</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-8">
        {isClient ? 'Applications Received' : 'My Applications'}
      </h1>

      {isClient
        ? <ClientApplications userId={user.id} />
        : <DraftsmanApplications userId={user.id} />
      }
    </main>
  )
}

async function ClientApplications({ userId }: { userId: string }) {
  const jobs = await getClientJobs(userId)
  const openJobs = jobs.filter((j: any) => j.status === 'open' || j.status === 'in_progress')

  if (openJobs.length === 0) {
    return (
      <div className="blueprint-card p-8 text-center">
        <p className="text-[var(--color-blueprint-text-secondary)] mb-4">No active jobs yet.</p>
        <Button asChild><Link href="/post-job">Post your first job →</Link></Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {await Promise.all(openJobs.map(async (job: any) => {
        const applications = await getApplicationsForJob(job.id)
        return (
          <div key={job.id}>
            <div className="flex items-center justify-between mb-3">
              <Link href={`/jobs/${job.id}`} className="font-semibold text-[var(--color-blueprint-text-primary)] hover:text-[var(--color-blueprint-accent)] transition-colors">
                {job.title}
              </Link>
              <Badge variant={job.status === 'open' ? 'available' : 'skill'}>
                {applications.length} application{applications.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {applications.length === 0 ? (
              <p className="text-sm text-[var(--color-blueprint-text-muted)] pl-2">No applications yet.</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app: any) => (
                  <div key={app.id} className="blueprint-card p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/draftsmen/${app.draftsman_id}`} className="font-medium text-[var(--color-blueprint-text-primary)] hover:text-[var(--color-blueprint-accent)]">
                            {app.users.name}
                          </Link>
                          {app.profiles.is_verified && <Badge variant="verified">Verified</Badge>}
                          <Badge variant={statusColors[app.status] ?? 'skill'}>{app.status}</Badge>
                        </div>
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          {app.profiles.skills.slice(0, 3).map((s: string) => (
                            <Badge key={s} variant="skill">{s}</Badge>
                          ))}
                        </div>
                        {app.cover_note && (
                          <p className="text-sm text-[var(--color-blueprint-text-secondary)] line-clamp-2">
                            {app.cover_note}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium text-[var(--color-blueprint-accent)]">
                          ₹{app.proposed_rate}/hr
                        </p>
                        {app.status === 'pending' && job.status === 'open' && (
                          <div className="flex gap-2 mt-2">
                            <form action={async () => {
                              'use server'
                              await acceptApplication(app.id, job.id)
                            }}>
                              <Button size="sm" type="submit">Accept</Button>
                            </form>
                            <form action={async () => {
                              'use server'
                              await rejectApplication(app.id)
                            }}>
                              <Button size="sm" variant="outline" type="submit">Reject</Button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }))}
    </div>
  )
}

async function DraftsmanApplications({ userId }: { userId: string }) {
  const applications = await getDraftsmanApplications(userId)

  if (applications.length === 0) {
    return (
      <div className="blueprint-card p-8 text-center">
        <p className="text-[var(--color-blueprint-text-secondary)] mb-4">You haven't applied to any jobs yet.</p>
        <Button asChild><Link href="/jobs">Browse open jobs →</Link></Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((app: any) => (
        <div key={app.id} className="blueprint-card p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <Link href={`/jobs/${app.jobs.id}`} className="font-medium text-[var(--color-blueprint-text-primary)] hover:text-[var(--color-blueprint-accent)] transition-colors">
                {app.jobs.title}
              </Link>
              <p className="text-sm text-[var(--color-blueprint-text-muted)] mt-0.5">
                by {app.jobs.users.name} · {app.jobs.users.city}
              </p>
              {app.cover_note && (
                <p className="text-sm text-[var(--color-blueprint-text-secondary)] mt-2 line-clamp-2">
                  {app.cover_note}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <Badge variant={app.status === 'accepted' ? 'available' : app.status === 'rejected' ? 'skill' : 'founding'}>
                {app.status}
              </Badge>
              <p className="text-sm text-[var(--color-blueprint-accent)] mt-1">₹{app.proposed_rate}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/applications/
git commit -m "feat: add applications inbox for both client and draftsman roles"
```

---

## Task 13: Contracts Page

**Files:**
- Create: `app/contracts/page.tsx`

- [ ] **Step 1: Create app/contracts/page.tsx**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getContracts } from '@/lib/data/applications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { markContractComplete } from '@/lib/actions/applications'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ContractsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData) redirect('/onboarding')

  const contracts = await getContracts(user.id, userData.role as 'client' | 'draftsman')

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// ACTIVE WORK</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-8">
        Contracts
      </h1>

      {contracts.length === 0 ? (
        <div className="blueprint-card p-8 text-center">
          <p className="text-[var(--color-blueprint-text-secondary)] mb-4">No contracts yet.</p>
          {userData.role === 'client' ? (
            <Button asChild><Link href="/post-job">Post a job →</Link></Button>
          ) : (
            <Button asChild><Link href="/jobs">Browse jobs →</Link></Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract: any) => (
            <div key={contract.id} className="blueprint-card p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="blueprint-label mb-1">REF: {contract.id.slice(0, 8).toUpperCase()}</p>
                  <h3 className="font-semibold text-[var(--color-blueprint-text-primary)] mb-1">
                    {contract.jobs.title}
                  </h3>
                  <p className="text-sm text-[var(--color-blueprint-text-secondary)]">
                    {userData.role === 'client'
                      ? `Draftsman: ${contract.draftsman.name}`
                      : `Client: ${contract.client.name}`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--color-blueprint-accent)]">
                    ₹{contract.agreed_rate.toLocaleString('en-IN')}
                  </p>
                  <Badge
                    variant={contract.status === 'active' ? 'available' : contract.status === 'completed' ? 'verified' : 'founding'}
                    className="mt-1"
                  >
                    {contract.status}
                  </Badge>
                </div>
              </div>

              {contract.status === 'active' && userData.role === 'client' && (
                <div className="mt-4 pt-4 border-t border-white/8">
                  <form action={async () => {
                    'use server'
                    await markContractComplete(contract.id)
                  }}>
                    <Button variant="outline" size="sm" type="submit">
                      Mark as complete
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/contracts/
git commit -m "feat: add contracts page with mark-complete action"
```

---

## Task 14: Updated Dashboard

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Replace app/dashboard/page.tsx with real data**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getClientJobs } from '@/lib/data/jobs'
import { getDraftsmanApplications, getContracts } from '@/lib/data/applications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userData) redirect('/onboarding')

  const isClient = userData.role === 'client'

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// DASHBOARD</p>
      <h1 className="text-2xl font-bold text-[var(--color-blueprint-text-primary)] mb-8">
        Welcome back, {userData.name}
      </h1>

      {isClient
        ? <ClientDashboard userId={user.id} />
        : <DraftsmanDashboard userId={user.id} />
      }
    </main>
  )
}

async function ClientDashboard({ userId }: { userId: string }) {
  const jobs = await getClientJobs(userId)
  const activeJobs = jobs.filter((j: any) => j.status === 'open' || j.status === 'in_progress')
  const contracts = await getContracts(userId, 'client')

  return (
    <div className="space-y-8">
      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Button asChild><Link href="/post-job">Post a Job →</Link></Button>
        <Button variant="outline" asChild><Link href="/draftsmen">Browse Draftsmen</Link></Button>
        <Button variant="outline" asChild><Link href="/applications">View Applications</Link></Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Jobs', value: activeJobs.length },
          { label: 'Total Jobs', value: jobs.length },
          { label: 'Contracts', value: contracts.length },
        ].map(stat => (
          <div key={stat.label} className="blueprint-card p-5 text-center">
            <p className="text-3xl font-bold text-[var(--color-blueprint-accent)]">{stat.value}</p>
            <p className="text-sm text-[var(--color-blueprint-text-secondary)] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent jobs */}
      {activeJobs.length > 0 && (
        <div>
          <p className="blueprint-label mb-3">// ACTIVE JOBS</p>
          <div className="space-y-3">
            {activeJobs.slice(0, 3).map((job: any) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="blueprint-card p-4 flex items-center justify-between hover:border-[var(--color-blueprint-accent)]/40 transition-colors">
                <span className="font-medium text-[var(--color-blueprint-text-primary)]">{job.title}</span>
                <Badge variant={job.status === 'open' ? 'available' : 'founding'}>{job.status}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

async function DraftsmanDashboard({ userId }: { userId: string }) {
  const applications = await getDraftsmanApplications(userId)
  const contracts = await getContracts(userId, 'draftsman')
  const activeContracts = contracts.filter((c: any) => c.status === 'active')
  const pendingApps = applications.filter((a: any) => a.status === 'pending')

  return (
    <div className="space-y-8">
      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Button asChild><Link href="/jobs">Browse Jobs →</Link></Button>
        <Button variant="outline" asChild><Link href="/applications">My Applications</Link></Button>
        <Button variant="outline" asChild><Link href="/contracts">My Contracts</Link></Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Contracts', value: activeContracts.length },
          { label: 'Pending Applications', value: pendingApps.length },
          { label: 'Total Applications', value: applications.length },
        ].map(stat => (
          <div key={stat.label} className="blueprint-card p-5 text-center">
            <p className="text-3xl font-bold text-[var(--color-blueprint-accent)]">{stat.value}</p>
            <p className="text-sm text-[var(--color-blueprint-text-secondary)] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Active contracts */}
      {activeContracts.length > 0 && (
        <div>
          <p className="blueprint-label mb-3">// ACTIVE CONTRACTS</p>
          <div className="space-y-3">
            {activeContracts.slice(0, 3).map((contract: any) => (
              <Link key={contract.id} href="/contracts" className="blueprint-card p-4 flex items-center justify-between hover:border-[var(--color-blueprint-accent)]/40 transition-colors">
                <span className="font-medium text-[var(--color-blueprint-text-primary)]">{contract.jobs.title}</span>
                <span className="text-[var(--color-blueprint-accent)] font-medium">₹{contract.agreed_rate}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: update dashboard with real stats and quick actions"
```

---

## Task 15: Wire Up Navigation + Final Build Check

**Files:**
- Modify: `components/layout/header.tsx`
- Modify: `proxy.ts`

- [ ] **Step 1: Update proxy.ts to protect new routes**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/dashboard', '/post-job', '/contracts', '/onboarding', '/applications']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const authPaths = ['/login', '/signup']
  const isAuthPage = authPaths.some(p => request.nextUrl.pathname === p)
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: Run build to verify clean compilation**

```bash
npm run build
```

Expected: All routes compile, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add proxy.ts components/layout/header.tsx
git commit -m "feat: complete Plan 2 marketplace core"
```

---

## Plan 2 Complete

**What's working after this plan:**
- Browse draftsmen (filterable by skill, rate, city)
- Public draftsman profiles with portfolio, skills, rates
- Post a job (clients only)
- Browse jobs (filterable by skill, budget type)
- Job detail page with apply form for draftsmen
- Applications inbox — clients review + accept/reject, draftsmen track status
- Contract creation on acceptance
- Direct hire flow
- Contracts page with mark-complete
- Real dashboards with stats + quick actions

**Next: Plan 3 — Engagement & Trust**
Covers: realtime chat per contract, file sharing, Razorpay payment + PDF invoice, reviews after contract completion, Verified badge admin flow, Resources section.
