import { useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Field from '../components/mobile/Field'
import Btn from '../components/mobile/Btn'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, SetData, Style } from '../data'
import { styleLabels } from '../data'
import { resolveSavedCueSheetDraft } from '../lib/cueSheetDraft'

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
  const [loadError, setLoadError] = useState('')
  const [loadMessage, setLoadMessage] = useState('')
  const [loadingDraft, setLoadingDraft] = useState(false)

  const update = <K extends keyof AppData>(key: K, value: AppData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
    if (key === 'groomName' || key === 'brideName') {
      setLoadError('')
      setLoadMessage('')
    }
  }

  const handleLoadDraft = async () => {
    const groomName = data.groomName.trim()
    const brideName = data.brideName.trim()
    if (!groomName || !brideName) {
      setLoadError('신랑·신부 이름을 먼저 입력해 주세요.')
      setLoadMessage('')
      return
    }

    setLoadingDraft(true)
    setLoadError('')
    setLoadMessage('')
    try {
      const saved = await resolveSavedCueSheetDraft(groomName, brideName)
      if (!saved) {
        setLoadError('저장된 식순을 찾지 못했습니다.')
        return
      }

      setData(saved.data)
      setLoadMessage('저장된 식순을 불러왔습니다. 이어서 수정해 주세요.')
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '저장된 식순을 불러오지 못했습니다.')
    } finally {
      setLoadingDraft(false)
    }
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

        <Card className="p-4 space-y-3">
          <div>
            <p className="text-[14px] font-semibold text-charcoal">저장된 식순 불러오기</p>
            <p className="text-[12px] text-muted-text mt-1 leading-relaxed">
              이전에 입력했던 신랑·신부 이름을 적고 불러오면, 저장된 식순과 멘트가 그대로 복원됩니다.
            </p>
          </div>
          <Btn
            variant="secondary"
            onClick={() => void handleLoadDraft()}
            disabled={loadingDraft || !data.groomName.trim() || !data.brideName.trim()}
          >
            {loadingDraft ? '불러오는 중…' : '저장된 식순 불러오기'}
          </Btn>
          {loadMessage && <p className="text-[12px] text-success text-center">{loadMessage}</p>}
          {loadError && <p className="text-[12px] text-danger text-center">{loadError}</p>}
        </Card>

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
