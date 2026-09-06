import type { ReactNode } from 'react'
import { FLOW_STEP_COUNT } from '../../config/features'
import StepBar from './StepBar'
import PageHeader from './PageHeader'
import BottomBar from './BottomBar'

interface Props {
  step?: number
  stepLabel?: string
  title: string
  subtitle?: string
  onBack?: () => void
  footer?: ReactNode
  children: ReactNode
  contentClassName?: string
}

export default function ScreenLayout({
  step,
  stepLabel,
  title,
  subtitle,
  onBack,
  footer,
  children,
  contentClassName = '',
}: Props) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="no-print">
        <StepBar step={step} total={FLOW_STEP_COUNT} label={stepLabel} onBack={onBack} />
      </div>
      <main className={`flex-1 px-5 pt-6 pb-28 ${contentClassName}`}>
        <div className="no-print">
          <PageHeader title={title} subtitle={subtitle} />
        </div>
        {children}
      </main>
      {footer && <BottomBar>{footer}</BottomBar>}
    </div>
  )
}
