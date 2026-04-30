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
    <Link href={`/projects/${job.id}`} className="blueprint-card p-5 block hover:border-[var(--color-blueprint-accent)]/40 transition-colors group">
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
