import type { ReactNode } from 'react'

export default function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 no-print">
      <div className="bg-bg/95 backdrop-blur-md border-t border-border px-5 pt-3 safe-bottom">
        {children}
      </div>
    </div>
  )
}
