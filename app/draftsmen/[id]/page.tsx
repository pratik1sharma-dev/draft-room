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
