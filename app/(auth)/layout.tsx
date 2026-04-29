export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[calc(100vh-4rem)] grid-bg flex items-center justify-center px-6 py-12">
      <div className="blueprint-card w-full max-w-md p-8">
        {children}
      </div>
    </main>
  )
}
