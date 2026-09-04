import Btn from '../components/mobile/Btn'
import type { AppData, SetData } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
  onStart: () => void
}

const features = ['6단계 간편 입력', 'AI 멘트 자동 생성', '사회자 이메일 전달 · 인쇄']

export default function Landing({ onStart }: Props) {
  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-10 text-center">
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-[13px] font-medium text-accent mb-5 tracking-wide">Wedding Cue Sheet</p>

        <h1 className="text-[26px] font-semibold text-charcoal leading-[1.35] tracking-tight mb-5 max-w-[280px]">
          박건 사회자가 만든
          <br />
          AI 자동 식순 큐시트
        </h1>

        <p className="text-[15px] text-muted-text leading-relaxed mb-10 max-w-[300px]">
          예식 정보 · 식순 · 멘트 · 입장 음원까지
          <br />
          사회자에게 바로 전달하세요.
        </p>

        <ul className="space-y-3 mb-12 w-full max-w-[260px]">
          {features.map((text) => (
            <li key={text} className="flex items-center justify-center gap-3 text-[14px] text-charcoal">
              <span className="w-5 h-5 rounded-full bg-accent-soft text-accent text-[11px] font-bold flex items-center justify-center shrink-0">
                ✓
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full">
        <Btn onClick={onStart}>시작하기</Btn>
        <p className="text-[12px] text-muted-text mt-3">가입 없이 무료</p>
      </div>
    </div>
  )
}
