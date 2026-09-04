import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
}

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <div className="mb-6">
      <h1 className="text-[22px] font-semibold text-charcoal leading-snug tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[14px] text-muted-text mt-1.5 leading-relaxed">{subtitle}</p>
      )}
    </div>
  )
}

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface rounded-2xl border border-border ${className}`}>{children}</div>
  )
}
