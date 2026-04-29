import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: "DraftRoom — India's Drafting Room for Architects",
  description: 'Connect with skilled draftsmen. Get your drawings done.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <div className="pt-16 flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
