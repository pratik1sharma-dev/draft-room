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
