import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full min-h-[100px] px-3 py-2 rounded-md text-sm resize-y',
          'bg-[var(--color-blueprint-surface)] border border-[var(--color-blueprint-border-strong)]',
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
Textarea.displayName = 'Textarea'

export { Textarea }
