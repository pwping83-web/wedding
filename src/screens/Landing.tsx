import Btn from '../components/mobile/Btn'
import { LandingFloralCorner, LandingFloralTop, LandingRingsIcon } from '../components/LandingDecor'
import type { AppData, SetData } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
  onStart: () => void
}

const features = ['5단계 간편 입력', 'AI 멘트 자동 생성', '사회자 이메일 전달 · 인쇄']

export default function Landing({ onStart }: Props) {
  return (
    <div className="landing-bg min-h-[100dvh] flex flex-col px-5 pt-10 pb-10 text-center">
      <LandingFloralTop />
      <LandingFloralCorner />
      <LandingFloralCorner flip />

      <div className="landing-bokeh" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="landing-content flex-1 flex flex-col items-center justify-center">
        <LandingRingsIcon />

        <p className="text-[13px] font-medium text-rose-gold mb-4 tracking-[0.12em] uppercase">
          Wedding Cue Sheet
        </p>

        <h1 className="text-[28px] font-semibold text-charcoal leading-[1.3] tracking-tight mb-4 max-w-[300px]">
          AI 자동 식순 큐시트
        </h1>

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

      <div className="landing-content w-full">
        <Btn onClick={onStart}>시작하기</Btn>
      </div>
    </div>
  )
}
