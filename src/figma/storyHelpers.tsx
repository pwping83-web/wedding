import { useState, type ReactNode } from 'react'
import MobileShell from '../components/mobile/MobileShell'
import type { AppData, SetData } from '../data'
import { initialData } from '../data'

/** Figma Make kit / 디자인 리뷰용 샘플 데이터 */
export const sampleAppData: AppData = {
  ...initialData,
  groomName: '김민수',
  brideName: '이서연',
  date: '2026-05-24',
  time: '12:30',
  venue: '서울 ○○웨딩홀 3층 그랜드볼룸',
  style: 'classic',
  mood: 'warm',
  email: 'mc@example.com',
  coupleEmail: 'couple@example.com',
}

export function useStoryData(overrides?: Partial<AppData>) {
  const [data, setData] = useState<AppData>({ ...sampleAppData, ...overrides })
  return { data, setData }
}

export const noopFlow = {
  onNext: () => {},
  onBack: () => {},
}

export function StoryShell({
  children,
  landing = false,
}: {
  children: ReactNode
  landing?: boolean
}) {
  return (
    <MobileShell className={landing ? 'mobile-shell--landing' : ''}>{children}</MobileShell>
  )
}

export type FlowStoryProps = {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

export function useFlowStoryProps(overrides?: Partial<AppData>): FlowStoryProps {
  const { data, setData } = useStoryData(overrides)
  return { data, setData, ...noopFlow }
}
