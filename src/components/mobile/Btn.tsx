import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  full?: boolean
}

const styles: Record<Variant, string> = {
  primary: 'bg-charcoal text-white active:opacity-90',
  secondary: 'bg-surface text-charcoal border border-border active:bg-muted-bg',
  ghost: 'bg-transparent text-muted-text active:text-charcoal',
  danger: 'bg-danger-soft text-danger border border-danger/20',
}

export default function Btn({
  variant = 'primary',
  full = true,
  className = '',
  children,
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={`h-12 px-5 rounded-xl text-[15px] font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${full ? 'w-full' : ''} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
