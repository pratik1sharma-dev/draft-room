import { ButtonHTMLAttributes, forwardRef, ReactElement, Children, cloneElement } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const buttonClasses = (variant: ButtonProps['variant'], size: ButtonProps['size'], className?: string) =>
  cn(
    'inline-flex items-center justify-center font-medium transition-colors rounded-md cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blueprint-accent)]',
    'disabled:pointer-events-none disabled:opacity-40',
    variant === 'primary' && 'bg-[var(--color-blueprint-accent)] text-white hover:bg-[var(--color-blueprint-accent-hover)]',
    variant === 'outline' && 'border border-white/10 text-[var(--color-blueprint-text-primary)] hover:border-[var(--color-blueprint-accent)] hover:text-[var(--color-blueprint-accent)]',
    variant === 'ghost' && 'text-[var(--color-blueprint-text-secondary)] hover:text-[var(--color-blueprint-text-primary)]',
    size === 'sm' && 'h-8 px-3 text-sm',
    size === 'md' && 'h-10 px-4 text-sm',
    size === 'lg' && 'h-12 px-6 text-base',
    className
  )

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, children, ...props }, ref) => {
    if (asChild) {
      const child = Children.only(children) as ReactElement<{ className?: string }>
      return cloneElement(child, {
        className: buttonClasses(variant, size, cn(child.props.className, className)),
      })
    }

    return (
      <button
        ref={ref}
        className={buttonClasses(variant, size, className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
