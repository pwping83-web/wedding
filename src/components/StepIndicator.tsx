interface Props {
  currentStep: number
  onBack?: () => void
}

const STEPS = ['기본 정보', '입장 연출', '식순 편집', '인물 등록', '분위기 선택', '미리보기']

export default function StepIndicator({ currentStep, onBack }: Props) {
  return (
    <div className="sticky top-0 z-20 bg-bg/95 backdrop-blur-sm border-b border-border no-print">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center mb-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="text-muted-text hover:text-charcoal transition-colors text-sm mr-3"
            >
              ← 이전
            </button>
          )}
          <span className="text-[11px] text-muted-text font-medium ml-auto">
            {currentStep} / {STEPS.length}
          </span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                i + 1 <= currentStep ? 'bg-lavender' : 'bg-border'
              }`}
            />
          ))}
        </div>
        <p className="text-[11px] text-lavender font-semibold mt-1.5">
          {STEPS[currentStep - 1]}
        </p>
      </div>
    </div>
  )
}
