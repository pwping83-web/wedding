import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

/** 신랑·신부용 짧은 부가 안내 — 괄호 표기 */
export default function GuidanceNote({ children, className = '' }: Props) {
  return (
    <p className={`text-[11px] text-muted-text leading-relaxed ${className}`.trim()}>
      ({children})
    </p>
  )
}
