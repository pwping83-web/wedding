import { useEffect, useState } from 'react'
import Btn from '../components/mobile/Btn'
import Field from '../components/mobile/Field'
import { normalizeCueSavePhone } from '../lib/cueSavePhone'
// import { notifySiteVisitLanding } from '../lib/notifySiteVisit'
import { SEO_TITLE } from '../config/siteSeo'
import LandingMarketingSections from '../components/LandingMarketingSections'
import { LandingFloralCorner, LandingFloralTop, LandingMcLogo } from '../components/LandingDecor'
import type { AppData, SetData } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
  onStart: () => void
  onLoadQct: (phone: string) => Promise<void>
  onAdmin: () => void
}

const features = ['5단계 간편 입력', 'AI 멘트 자동 생성', '사회자 이메일 전달 · 인쇄']

function scrollToMarketingSections() {
  document.getElementById('landing-marketing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Landing({ onStart, onLoadQct, onAdmin }: Props) {
  const [qctOpen, setQctOpen] = useState(false)
  const [qctPhone, setQctPhone] = useState('')
  const [qctLoading, setQctLoading] = useState(false)
  const [qctError, setQctError] = useState('')

  useEffect(() => {
    const prev = document.title
    document.title = SEO_TITLE
    // notifySiteVisitLanding()
    return () => {
      document.title = prev
    }
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

      <div className="landing-content w-full max-w-[300px] mx-auto space-y-2">
        {qctOpen ? (
          <div className="landing-card text-left space-y-3 mb-1">
            <p className="text-[13px] font-semibold text-charcoal">식순 불러오기</p>
            <Field
              label="QCT 저장용 전화번호"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="010-1234-5678"
              value={qctPhone}
              onChange={(e) => {
                setQctPhone(normalizeCueSavePhone(e.target.value))
                setQctError('')
              }}
            />
            {qctError && <p className="text-[12px] text-danger">{qctError}</p>}
            <div className="flex gap-2">
              <Btn
                variant="secondary"
                full={false}
                className="flex-1 min-w-0"
                disabled={qctLoading}
                onClick={() => {
                  setQctOpen(false)
                  setQctError('')
                }}
              >
                취소
              </Btn>
              <Btn
                full={false}
                className="flex-1 min-w-0"
                disabled={qctLoading || !qctPhone.trim()}
                onClick={async () => {
                  setQctLoading(true)
                  setQctError('')
                  try {
                    await onLoadQct(qctPhone)
                  } catch (error) {
                    setQctError(
                      error instanceof Error ? error.message : '식순을 불러오지 못했습니다.',
                    )
                  } finally {
                    setQctLoading(false)
                  }
                }}
              >
                {qctLoading ? '불러오는 중…' : '불러오기'}
              </Btn>
            </div>
          </div>
        ) : (
          <Btn variant="secondary" onClick={() => setQctOpen(true)}>
            식순 불러오기
          </Btn>
        )}

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
