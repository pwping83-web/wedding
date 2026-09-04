import Btn from '../components/mobile/Btn'
import type { AppData, SetData } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
  onStart: () => void
}

export default function Landing({ onStart }: Props) {
  return (
    <div className="min-h-[100dvh] flex flex-col px-5 pt-14 pb-10">
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-[13px] font-medium text-accent mb-4">Wedding Cue Sheet</p>
        <h1 className="text-[28px] font-semibold text-charcoal leading-[1.25] tracking-tight mb-4">
          입력만 하면
          <br />
          큐시트가 완성됩니다
        </h1>
        <p className="text-[15px] text-muted-text leading-relaxed mb-10">
          예식 정보 · 식순 · 멘트 · 입장 음원까지
          <br />
          사회자에게 바로 전달하세요.
        </p>

        <ul className="space-y-3 mb-12">
          {['6단계 간편 입력', 'AI 멘트 자동 생성', '사회자 이메일 전달 · 인쇄'].map((text) => (
            <li key={text} className="flex items-center gap-3 text-[14px] text-charcoal">
              <span className="w-5 h-5 rounded-full bg-accent-soft text-accent text-[11px] font-bold flex items-center justify-center shrink-0">
                ✓
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <Btn onClick={onStart}>시작하기</Btn>
      <p className="text-center text-[12px] text-muted-text mt-3">가입 없이 무료</p>
    </div>
  )
}
