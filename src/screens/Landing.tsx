import { useEffect } from 'react'
import Btn from '../components/mobile/Btn'
import { notifySiteVisitLanding } from '../lib/notifySiteVisit'
import LandingMarketingSections from '../components/LandingMarketingSections'
import { LandingFloralCorner, LandingFloralTop, LandingMcLogo } from '../components/LandingDecor'
import type { AppData, SetData } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
  onStart: () => void
  onAdmin: () => void
}

const features = ['5단계 간편 입력', 'AI 멘트 자동 생성', '사회자 이메일 전달 · 인쇄']

function scrollToMarketingSections() {
  document.getElementById('landing-marketing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Landing({ onStart, onAdmin }: Props) {
  useEffect(() => {
    notifySiteVisitLanding()
  }, [])

  return (
    <div className="landing-bg min-h-[100dvh] text-center relative">
      <section className="min-h-[calc(100dvh-3.25rem)] flex flex-col px-5 pt-10 pb-6 relative">
      <button
        type="button"
        onClick={onAdmin}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute top-3 right-3 z-50 h-2.5 w-2.5 rounded-full border-0 p-0 opacity-[0.07] bg-charcoal"
      />
      <LandingFloralTop />
      <LandingFloralCorner />
      <LandingFloralCorner flip />

      <div className="landing-bokeh" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="landing-content flex-1 flex flex-col items-center justify-center">
        <LandingMcLogo />

        <p className="text-[13px] font-medium text-rose-gold mb-4 tracking-[0.08em]">
          예식 큐시트
        </p>

        <h1 className="text-[28px] font-semibold text-charcoal leading-[1.3] tracking-tight mb-4 max-w-[300px]">
          AI 자동 식순 큐시트
        </h1>

        <p className="text-[14px] font-semibold text-charcoal/80 mb-4">
          (ENX 웨딩 · MC)
        </p>

        <p className="text-[15px] text-muted-text leading-relaxed mb-8 max-w-[300px]">
          예식 정보 · 식순 · 멘트까지
          <br />
          사회자에게 바로 전달하세요.
        </p>

        <div className="landing-card w-full max-w-[300px] mb-10">
          <ul className="space-y-3">
            {features.map((text) => (
              <li key={text} className="flex items-center justify-center gap-3 text-[14px] text-charcoal">
                <span className="landing-check">✓</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="landing-content w-full max-w-[300px] mx-auto">
        <Btn onClick={onStart}>시작하기</Btn>
        <button
          type="button"
          onClick={scrollToMarketingSections}
          className="mt-3 w-full text-[12px] text-muted-text leading-relaxed [word-break:keep-all] underline-offset-2 hover:text-charcoal hover:underline"
        >
          ↓ MC 진행 영상 · 식전영상 무료 제작
        </button>
      </div>
      </section>

      <LandingMarketingSections />
    </div>
  )
}
