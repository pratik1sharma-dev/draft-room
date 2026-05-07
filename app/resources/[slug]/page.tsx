import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, getAllPosts } from '@/lib/posts'
import { Badge } from '@/components/ui/badge'

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://www.thedraftroom.in/resources/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.thedraftroom.in/resources/${slug}`,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/resources" className="text-sm text-[var(--color-blueprint-text-muted)] hover:text-[var(--color-blueprint-accent)] transition-colors mb-8 inline-block">
        ← Back to Resources
      </Link>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => <Badge key={tag} variant="skill">{tag}</Badge>)}
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-3 leading-snug">
          {post.title}
        </h1>
        <p className="text-sm text-[var(--color-blueprint-text-muted)]">
          {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <article
        className="prose prose-sm max-w-none text-[var(--color-blueprint-text-secondary)] prose-headings:text-[var(--color-blueprint-text-primary)] prose-headings:font-semibold prose-a:text-[var(--color-blueprint-accent)] prose-strong:text-[var(--color-blueprint-text-primary)] prose-code:text-[var(--color-blueprint-accent)]"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="mt-12 pt-8 border-t border-[var(--color-blueprint-border)]">
        <p className="text-sm text-[var(--color-blueprint-text-secondary)] mb-4">
          Looking to hire a verified CAD drafter for your next project?
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/drafters" className="text-sm font-medium text-[var(--color-blueprint-accent)] hover:underline">
            Browse Drafters →
          </Link>
          <Link href="/signup?role=client" className="text-sm font-medium text-[var(--color-blueprint-accent)] hover:underline">
            Post a Project →
          </Link>
        </div>
      </div>
    </main>
  )
}
