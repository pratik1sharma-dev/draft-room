import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-md text-sm appearance-none',
          'bg-[var(--color-blueprint-surface)] border border-white/10',
          'text-[var(--color-blueprint-text-primary)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-blueprint-accent)] focus:border-transparent',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'

export { Select }
