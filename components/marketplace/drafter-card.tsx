import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface DrafterCardProps {
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

export function DrafterCard({ profile }: DrafterCardProps) {
  return (
    <Link href={`/drafters/${profile.user_id}`} className="blueprint-card p-5 block hover:border-[var(--color-blueprint-accent)]/40 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.users.name}
              width={40}
              height={40}
              className="rounded-full object-cover shrink-0 border border-[var(--color-blueprint-border)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--color-blueprint-accent)]/10 border border-[var(--color-blueprint-border)] flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-[var(--color-blueprint-accent)]">
                {profile.users.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
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
