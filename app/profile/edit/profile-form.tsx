'use client'

import { useActionState, useState, useRef } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const SKILLS = ['AutoCAD', 'Revit', 'SketchUp', '3D Rendering', 'Structural Drawings', 'BIM']
const PROJECT_TYPES = ['Residential', 'Commercial', 'Industrial', 'Interiors', 'Landscape', 'Urban Planning']
const STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'
]

interface ProfileFormProps {
  role: 'client' | 'draftsman'
  user: { name: string; phone: string | null; city: string | null; state: string | null; email: string }
  profile: {
    avatar_url: string | null
    bio: string | null
    skills: string[]
    hourly_rate: number | null
    experience_years: number | null
    linkedin_url: string | null
    availability: boolean
    portfolio_urls: string[]
    firm_name: string | null
    project_types: string[]
  }
}

export function ProfileForm({ role, user, profile }: ProfileFormProps) {
  const { email } = user
  const [state, formAction, isPending] = useActionState(updateProfile, null)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      const sigRes = await fetch('/api/cloudinary/signature')
      const { timestamp, signature, folder, cloudName, apiKey } = await sigRes.json()

      const body = new FormData()
      body.append('file', file)
      body.append('timestamp', String(timestamp))
      body.append('signature', signature)
      body.append('folder', folder)
      body.append('api_key', apiKey)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body,
      })
      const data = await uploadRes.json()
      if (data.secure_url) {
        setAvatarUrl(data.secure_url)
      } else {
        setUploadError('Upload failed — please try again.')
      }
    } catch {
      setUploadError('Upload failed — please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Basic info */}
      <div className="blueprint-card p-6 space-y-5">
        <p className="blueprint-label">// BASIC INFO</p>

        <div className="mb-5">
          <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Email</label>
          <Input value={email} readOnly className="opacity-60 cursor-default" />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Profile photo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border border-[var(--color-blueprint-border-strong)] overflow-hidden shrink-0 bg-[var(--color-blueprint-surface)] flex items-center justify-center">
                {avatarUrl
                  ? <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                  : <span className="text-2xl font-bold text-[var(--color-blueprint-text-muted)]">{user.name?.[0]?.toUpperCase() ?? '?'}</span>
                }
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : avatarUrl ? 'Change photo' : 'Upload photo'}
                </Button>
                <p className="text-[10px] text-[var(--color-blueprint-text-muted)] mt-1">JPG, PNG or WebP</p>
                {uploadError && <p className="text-[10px] text-red-400 mt-1">{uploadError}</p>}
              </div>
            </div>
            <input type="hidden" name="avatar_url" value={avatarUrl} />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Full name</label>
            <Input name="name" defaultValue={user.name} required />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Phone (optional)</label>
            <Input name="phone" type="tel" defaultValue={user.phone ?? ''} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">City</label>
            <Input name="city" defaultValue={user.city ?? ''} required />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">State</label>
            <select
              name="state"
              defaultValue={user.state ?? ''}
              className="w-full h-10 px-3 rounded-md text-sm bg-[var(--color-blueprint-surface)] border border-[var(--color-blueprint-border-strong)] text-[var(--color-blueprint-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-blueprint-accent)]"
            >
              <option value="">Select state</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Draftsman-specific */}
      {role === 'draftsman' && (
        <>
          <div className="blueprint-card p-6 space-y-5">
            <p className="blueprint-label">// PROFESSIONAL DETAILS</p>

            <div>
              <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Bio <span className="text-[var(--color-blueprint-accent)]">*</span></label>
              <Textarea
                name="bio"
                defaultValue={profile.bio ?? ''}
                placeholder="Tell clients about your background, specialisations, and how you work..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Hourly rate (₹)</label>
                <Input name="hourly_rate" type="number" min="1" defaultValue={profile.hourly_rate ?? ''} required />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Years of experience</label>
                <Input name="experience_years" type="number" min="0" defaultValue={profile.experience_years ?? ''} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">LinkedIn URL (optional)</label>
              <Input name="linkedin_url" type="url" defaultValue={profile.linkedin_url ?? ''} placeholder="https://linkedin.com/in/yourname" />
            </div>

            <div>
              <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-2">Availability</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="availability" value="true" defaultChecked={profile.availability} className="accent-[var(--color-blueprint-accent)]" />
                  <span className="text-sm text-[var(--color-blueprint-text-secondary)]">Available for work</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="availability" value="false" defaultChecked={!profile.availability} className="accent-[var(--color-blueprint-accent)]" />
                  <span className="text-sm text-[var(--color-blueprint-text-secondary)]">Not available</span>
                </label>
              </div>
            </div>
          </div>

          <div className="blueprint-card p-6 space-y-5">
            <p className="blueprint-label">// SKILLS</p>
            <div className="flex flex-wrap gap-3">
              {SKILLS.map(skill => (
                <label key={skill} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="skills"
                    value={skill}
                    defaultChecked={profile.skills.includes(skill)}
                    className="accent-[var(--color-blueprint-accent)]"
                  />
                  <span className="text-sm text-[var(--color-blueprint-text-secondary)]">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="blueprint-card p-6 space-y-4">
            <p className="blueprint-label">// PORTFOLIO</p>
            <p className="text-xs text-[var(--color-blueprint-text-muted)]">One URL per line — image or Cloudinary links</p>
            <Textarea
              name="portfolio_urls"
              defaultValue={profile.portfolio_urls.join('\n')}
              placeholder={'https://res.cloudinary.com/...\nhttps://res.cloudinary.com/...'}
              className="min-h-[100px] font-mono text-xs"
            />
          </div>
        </>
      )}

      {/* Client-specific */}
      {role === 'client' && (
        <div className="blueprint-card p-6 space-y-5">
          <p className="blueprint-label">// FIRM DETAILS</p>

          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Firm name (optional)</label>
            <Input name="firm_name" defaultValue={profile.firm_name ?? ''} placeholder="e.g. Sharma Architects" />
          </div>

          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-2">Project types</label>
            <div className="flex flex-wrap gap-3">
              {PROJECT_TYPES.map(type => (
                <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="project_types"
                    value={type}
                    defaultChecked={profile.project_types.includes(type)}
                    className="accent-[var(--color-blueprint-accent)]"
                  />
                  <span className="text-sm text-[var(--color-blueprint-text-secondary)]">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save changes'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
