import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'Contact DraftRoom',
  description: 'Get in touch with the DraftRoom team for questions, feedback, or partnership enquiries. We read everything.',
  openGraph: {
    title: 'Contact DraftRoom',
    url: 'https://draftroom.in/contact',
  },
  alternates: { canonical: 'https://draftroom.in/contact' },
}

export default function ContactPage() {
  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <p className="blueprint-label mb-2">// CONTACT</p>
      <h1 className="text-3xl font-bold text-[var(--color-blueprint-text-primary)] mb-2">
        Get in touch
      </h1>
      <p className="text-[var(--color-blueprint-text-secondary)] mb-10">
        Questions, feedback, or partnership enquiries — we read everything.
      </p>

      <form
        action="mailto:hello@draftroom.in"
        method="GET"
        className="space-y-5 blueprint-card p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Name</label>
            <Input name="name" placeholder="Ravi Sharma" required />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Email</label>
            <Input name="email" type="email" placeholder="ravi@studio.in" required />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Subject</label>
          <Input name="subject" placeholder="e.g. Partnership enquiry" required />
        </div>

        <div>
          <label className="block text-sm text-[var(--color-blueprint-text-secondary)] mb-1.5">Message</label>
          <Textarea name="body" placeholder="Tell us what's on your mind..." className="min-h-[140px]" required />
        </div>

        <Button type="submit" className="w-full">Send message →</Button>
      </form>

      <div className="mt-8 space-y-2 text-sm text-[var(--color-blueprint-text-secondary)]">
        <p>Or reach us directly:</p>
        <a href="mailto:hello@draftroom.in" className="text-[var(--color-blueprint-accent)] hover:underline block">
          hello@draftroom.in
        </a>
        <a href="https://discord.gg/draftroom" target="_blank" rel="noopener noreferrer" className="text-[var(--color-blueprint-accent)] hover:underline block">
          Discord community →
        </a>
      </div>
    </main>
  )
}
