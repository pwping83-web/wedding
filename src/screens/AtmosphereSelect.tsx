import { useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, Mood, SetData } from '../data'
import { moodLabels, moodDescriptions } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

const MOODS: Mood[] = ['bright', 'solemn', 'formal', 'warm']

export default function AtmosphereSelect({ data, setData, onNext, onBack }: Props) {
  const setMood = (mood: Mood) => {
    setData((prev) => ({
      ...prev,
      mood,
      orderItems: prev.orderItems.map((i) => ({ ...i, scriptVariant: 0, customScript: undefined })),
    }))
  }

  return (
    <ScreenLayout
      step={5}
      stepLabel="분위기"
      title="멘트 분위기"
      subtitle="선택하면 모든 사회자 멘트 톤이 바뀝니다"
      onBack={onBack}
      footer={<Btn onClick={onNext}>미리보기</Btn>}
    >
      <div className="space-y-2">
        {MOODS.map((mood) => {
          const selected = data.mood === mood
          return (
            <button
              key={mood}
              type="button"
              onClick={() => setMood(mood)}
              className={`w-full text-left p-4 rounded-2xl border transition-colors ${
                selected
                  ? 'bg-charcoal text-white border-charcoal'
                  : 'bg-surface text-charcoal border-border'
              }`}
            >
              <p className="text-[15px] font-semibold">{moodLabels[mood]}</p>
              <p className={`text-[13px] mt-1 ${selected ? 'text-white/70' : 'text-muted-text'}`}>
                {moodDescriptions[mood]}
              </p>
            </button>
          )
        })}
      </div>

      <Card className="p-4 mt-6">
        <p className="text-[13px] text-muted-text leading-relaxed">
          AI 멘트 생성과 세부 조정은 미리보기 · 최종 큐시트에서 할 수 있습니다.
        </p>
      </Card>
    </ScreenLayout>
  )
}
