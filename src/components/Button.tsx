import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
}

export function Button({ children, variant = 'primary', className = '' }: ButtonProps) {
  const variantClass = variant === 'primary' ? 'button-primary' : 'button-secondary'

  return (
    <button
      type="button"
      className={`button-base ${variantClass} inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold ${className}`}
    >
      {children}
    </button>
  )
}
