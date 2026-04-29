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
