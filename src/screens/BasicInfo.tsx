import { useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Field from '../components/mobile/Field'
import Btn from '../components/mobile/Btn'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, SetData, Style } from '../data'
import { styleLabels } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

const STYLE_HINT: Record<Style, string> = {
  classic: '우아하고 전통적',
  casual: '편안하고 자연스러운',
  modern: '세련된',
  fun: '유쾌하고 밝은',
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
    if (!data.date) e.date = '날짜를 선택해주세요'
    if (!data.time) e.time = '시간을 선택해주세요'
    if (!data.venue.trim()) e.venue = '장소를 입력해주세요'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <ScreenLayout
      step={1}
      stepLabel="기본 정보"
      title="예식 정보"
      subtitle="두 분의 기본 정보를 입력해 주세요"
      onBack={onBack}
      footer={<Btn onClick={() => validate() && onNext()}>다음</Btn>}
    >
      <div className="space-y-4">
        <Field
          label="신랑 이름"
          required
          placeholder="홍길동"
          value={data.groomName}
          onChange={(e) => update('groomName', e.target.value)}
          error={errors.groomName}
        />
        <Field
          label="신부 이름"
          required
          placeholder="김미영"
          value={data.brideName}
          onChange={(e) => update('brideName', e.target.value)}
          error={errors.brideName}
        />
        <Field
          label="예식 날짜"
          required
          type="date"
          value={data.date}
          onChange={(e) => update('date', e.target.value)}
          error={errors.date}
        />
        <Field
          label="예식 시간"
          required
          type="time"
          value={data.time}
          onChange={(e) => update('time', e.target.value)}
          error={errors.time}
        />
        <Field
          label="예식 장소"
          required
          placeholder="그랜드 호텔 크리스탈 홀"
          value={data.venue}
          onChange={(e) => update('venue', e.target.value)}
          error={errors.venue}
        />

        <div>
          <p className="text-[13px] font-medium text-charcoal mb-2">예식 스타일</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(styleLabels) as Style[]).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => update('style', style)}
                className={`px-3.5 py-2 rounded-full text-[13px] font-medium border transition-colors ${
                  data.style === style
                    ? 'bg-charcoal text-white border-charcoal'
                    : 'bg-surface text-muted-text border-border'
                }`}
              >
                {styleLabels[style]}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-muted-text mt-2">{STYLE_HINT[data.style]} 톤의 MC 멘트</p>
        </div>

        {data.groomName && data.brideName && (
          <Card className="p-4 text-center">
            <p className="text-[15px] font-semibold text-charcoal">
              {data.groomName} · {data.brideName}
            </p>
            {data.date && data.time && (
              <p className="text-[12px] text-muted-text mt-1">
                {data.date} {data.time}
              </p>
            )}
          </Card>
        )}
      </div>
    </ScreenLayout>
  )
}
