import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

/** 신랑·신부용 부가 안내 — 취소선으로 눈에 띄게 표시 */
export default function GuidanceStrike({ children, className = '' }: Props) {
  return (
    <p className={`text-[11px] text-muted-text leading-relaxed ${className}`.trim()}>
      <span className="line-through decoration-charcoal/35">{children}</span>
    </p>
  )
}
