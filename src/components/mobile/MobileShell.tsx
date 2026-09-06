import type { ReactNode } from 'react'

export default function MobileShell({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className="mobile-shell-scaler">
      <div className={`mobile-shell ${className}`.trim()}>{children}</div>
    </div>
  )
}
