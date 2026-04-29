import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'verified' | 'founding' | 'available' | 'skill'
  className?: string
}

export function Badge({ children, variant = 'skill', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
        variant === 'verified' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        variant === 'founding' && 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        variant === 'available' && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        variant === 'skill' && 'bg-[var(--color-blueprint-overlay)] text-[var(--color-blueprint-text-secondary)] border border-[var(--color-blueprint-border-strong)]',
        className
      )}
    >
      {children}
    </span>
  )
}
