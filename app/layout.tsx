import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ACTIVE_THEME } from '@/lib/config/theme'
import { Analytics } from '@vercel/analytics/next'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { PostHogPageView } from '@/components/providers/posthog-pageview'
import { Suspense } from 'react'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.thedraftroom.in'),
  title: {
    default: 'DraftRoom — Hire CAD Drafters for Architecture Projects in India',
    template: '%s | DraftRoom',
  },
  description: 'Find AutoCAD, Revit, SketchUp, structural, and interiors drafters across India. Verified portfolios, structured delivery.',
  openGraph: {
    siteName: 'DraftRoom',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: '/og/default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@thedraftroom_in',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme={ACTIVE_THEME}>
      <body className="min-h-screen flex flex-col">
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <Header />
          <div className="pt-16 flex-1">
            {children}
          </div>
          <Footer />
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  )
}
