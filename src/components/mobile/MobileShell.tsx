import type { ReactNode } from 'react'

export default function MobileShell({ children }: { children: ReactNode }) {
  return <div className="mobile-shell">{children}</div>
}
