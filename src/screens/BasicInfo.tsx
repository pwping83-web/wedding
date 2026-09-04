import { useState } from 'react'
import StepIndicator from '../components/StepIndicator'
import type { AppData, SetData, Style } from '../data'
import { styleLabels } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

const STYLE_DESCRIPTIONS: Record<Style, string> = {
  classic: '전통적이고 우아한 예식',
  casual: '편안하고 자연스러운 예식',
  modern: '세련되고 트렌디한 예식',
  fun: '즐겁고 유머 넘치는 예식',
}

export default function BasicInfo({ data, setData, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = <K extends keyof AppData>(key: K, value: AppData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!data.groomName.trim()) e.groomName = '신랑 이름을 입력해주세요'
    if (!data.brideName.trim()) e.brideName = '신부 이름을 입력해주세요'
    if (!data.date) e.date = '예식 날짜를 선택해주세요'
    if (!data.time) e.time = '예식 시간을 선택해주세요'
    if (!data.venue.trim()) e.venue = '예식 장소를 입력해주세요'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validate()) onNext()
  }

  const inputCls = (key: string) =>
    `w-full px-4 py-3 bg-surface border rounded-[10px] text-charcoal text-sm outline-none
    focus:ring-2 focus:ring-lavender/25 focus:border-lavender transition-all placeholder:text-muted-text/60
    ${errors[key] ? 'border-rose' : 'border-border'}`

  return (
    <div className="min-h-screen bg-bg">
      <StepIndicator currentStep={1} onBack={onBack} />

      <div className="max-w-lg mx-auto px-4 py-8 pb-20">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">예식 기본 정보</h1>
          <p className="text-muted-text text-sm">두 분의 예식 기본 정보를 입력해 주세요</p>
        </div>

        <div className="space-y-5">
          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                신랑 이름 <span className="text-rose">*</span>
              </label>
              <input
                type="text"
                placeholder="홍길동"
                value={data.groomName}
                onChange={(e) => update('groomName', e.target.value)}
                className={inputCls('groomName')}
              />
              {errors.groomName && (
                <p className="text-rose text-xs mt-1">{errors.groomName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                신부 이름 <span className="text-rose">*</span>
              </label>
              <input
                type="text"
                placeholder="김미영"
                value={data.brideName}
                onChange={(e) => update('brideName', e.target.value)}
                className={inputCls('brideName')}
              />
              {errors.brideName && (
                <p className="text-rose text-xs mt-1">{errors.brideName}</p>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                예식 날짜 <span className="text-rose">*</span>
              </label>
              <input
                type="date"
                value={data.date}
                onChange={(e) => update('date', e.target.value)}
                className={inputCls('date')}
              />
              {errors.date && (
                <p className="text-rose text-xs mt-1">{errors.date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                예식 시간 <span className="text-rose">*</span>
              </label>
              <input
                type="time"
                value={data.time}
                onChange={(e) => update('time', e.target.value)}
                className={inputCls('time')}
              />
              {errors.time && (
                <p className="text-rose text-xs mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">
              예식 장소 <span className="text-rose">*</span>
            </label>
            <input
              type="text"
              placeholder="예: 그랜드 호텔 크리스탈 홀"
              value={data.venue}
              onChange={(e) => update('venue', e.target.value)}
              className={inputCls('venue')}
            />
            {errors.venue && (
              <p className="text-rose text-xs mt-1">{errors.venue}</p>
            )}
          </div>

          {/* Style chips */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-3">
              예식 분위기
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(styleLabels) as Style[]).map((style) => (
                <button
                  key={style}
                  onClick={() => update('style', style)}
                  className={`px-4 py-3 rounded-[12px] border-2 text-left transition-all ${
                    data.style === style
                      ? 'border-lavender bg-lavender-pale'
                      : 'border-border bg-surface hover:border-lavender/40'
                  }`}
                >
                  <span
                    className={`block text-sm font-bold mb-0.5 ${
                      data.style === style ? 'text-lavender' : 'text-charcoal'
                    }`}
                  >
                    {styleLabels[style]}
                  </span>
                  <span className="block text-xs text-muted-text">
                    {STYLE_DESCRIPTIONS[style]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview card */}
        {data.groomName && data.brideName && (
          <div className="mt-6 p-4 bg-lavender-pale rounded-[12px] border border-lavender/20 text-center">
            <p className="font-display text-charcoal font-medium">
              {data.groomName} ♡ {data.brideName}
            </p>
            {data.date && data.time && (
              <p className="text-muted-text text-xs mt-1">
                {new Date(data.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}{' '}
                {data.time}
              </p>
            )}
            {data.venue && (
              <p className="text-muted-text text-xs">{data.venue}</p>
            )}
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleNext}
            className="w-full py-4 bg-lavender text-white rounded-[13px] font-bold text-base hover:bg-lavender-light transition-all hover:shadow-md"
          >
            다음 단계 →
          </button>
        </div>
      </div>
    </div>
  )
}
