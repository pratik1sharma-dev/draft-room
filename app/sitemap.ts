import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE = 'https://www.thedraftroom.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/projects`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/drafters`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  try {
    const supabase = await createClient()
    const [{ data: jobs }, { data: profiles }] = await Promise.all([
      supabase.from('jobs').select('id, updated_at').eq('status', 'open'),
      supabase.from('profiles').select('user_id, updated_at'),
    ])

    const projectEntries: MetadataRoute.Sitemap = (jobs ?? []).map(job => ({
      url: `${BASE}/projects/${job.id}`,
      lastModified: new Date(job.updated_at),
      changeFrequency: 'daily',
      priority: 0.7,
    }))

    const draftsmanEntries: MetadataRoute.Sitemap = (profiles ?? []).map(p => ({
      url: `${BASE}/drafters/${p.user_id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    return [...staticRoutes, ...projectEntries, ...draftsmanEntries]
  } catch {
    return staticRoutes
  }
}
