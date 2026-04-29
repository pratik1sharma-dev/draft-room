import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-md text-sm',
          'bg-[var(--color-blueprint-surface)] border border-white/10',
          'text-[var(--color-blueprint-text-primary)] placeholder:text-[var(--color-blueprint-text-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-blueprint-accent)] focus:border-transparent',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
