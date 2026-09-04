import { useState } from 'react'
import StepIndicator from '../components/StepIndicator'
import type { AppData, Mood, SetData } from '../data'
import { moodLabels, moodDescriptions, moodEmojis, getOrderItemScript } from '../data'
import { buildOrderGeneratePayload, requestGeneratedScript } from '../lib/generateScript'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

const MOODS: Mood[] = ['bright', 'solemn', 'formal', 'warm']

const MOOD_BORDER: Record<Mood, string> = {
  bright: 'border-[#F4A261]',
  solemn: 'border-sage',
  formal: 'border-[#6B7280]',
  warm: 'border-rose',
}

const MOOD_BG: Record<Mood, string> = {
  bright: 'bg-[#FEF3E8]',
  solemn: 'bg-sage-pale',
  formal: 'bg-muted-bg',
  warm: 'bg-rose-pale',
}

const MOOD_TEXT: Record<Mood, string> = {
  bright: 'text-[#D97706]',
  solemn: 'text-sage',
  formal: 'text-[#6B7280]',
  warm: 'text-rose',
}

export default function AtmosphereSelect({ data, setData, onNext, onBack }: Props) {
  const [regenerating, setRegenerating] = useState<string | null>(null)

  const setMood = (mood: Mood) => {
    setData((prev) => ({
      ...prev,
      mood,
      orderItems: prev.orderItems.map((i) => ({ ...i, scriptVariant: 0, customScript: undefined })),
    }))
  }

  const generateScript = async (itemId: string) => {
    const item = data.orderItems.find((i) => i.id === itemId)
    if (!item) return

    setRegenerating(itemId)
    try {
      const script = await requestGeneratedScript(
        buildOrderGeneratePayload(
          data,
          item.title,
          getOrderItemScript(item, data.mood, data),
        ),
      )
      setData((prev) => ({
        ...prev,
        orderItems: prev.orderItems.map((i) =>
          i.id === itemId ? { ...i, customScript: script } : i,
        ),
      }))
    } catch {
      setData((prev) => ({
        ...prev,
        orderItems: prev.orderItems.map((i) =>
          i.id === itemId
            ? { ...i, scriptVariant: i.scriptVariant + 1, customScript: undefined }
            : i,
        ),
      }))
    } finally {
      setRegenerating(null)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <StepIndicator currentStep={5} onBack={onBack} />

      <div className="max-w-lg mx-auto px-4 py-8 pb-20">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">분위기 선택</h1>
          <p className="text-muted-text text-sm">
            선택한 분위기에 따라 모든 멘트가 즉시 바뀝니다
          </p>
        </div>

        {/* Mood selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {MOODS.map((mood) => {
            const selected = data.mood === mood
            return (
              <button
                key={mood}
                onClick={() => setMood(mood)}
                className={`p-4 rounded-[13px] border-2 text-left transition-all hover:-translate-y-0.5 ${
                  selected
                    ? `${MOOD_BORDER[mood]} ${MOOD_BG[mood]} shadow-sm`
                    : 'border-border bg-surface hover:border-lavender/30'
                }`}
              >
                <div className="text-2xl mb-2">{moodEmojis[mood]}</div>
                <div
                  className={`font-bold text-sm mb-1 ${
                    selected ? MOOD_TEXT[mood] : 'text-charcoal'
                  }`}
                >
                  {moodLabels[mood]}
                </div>
                <div className="text-xs text-muted-text leading-relaxed">
                  {moodDescriptions[mood]}
                </div>
                {selected && (
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${MOOD_TEXT[mood].replace('text-', 'bg-')}`} />
                    <span className={`text-[10px] font-bold ${MOOD_TEXT[mood]}`}>선택됨</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Live script preview */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-charcoal text-sm">멘트 미리보기</h3>
            <span className="px-2.5 py-0.5 bg-lavender-pale text-lavender text-xs rounded-full font-semibold border border-lavender/20">
              {moodLabels[data.mood]}
            </span>
          </div>

          <div className="space-y-3">
            {data.orderItems.map((item) => {
              const script = getOrderItemScript(item, data.mood, data)
              const isRegen = regenerating === item.id
              return (
                <div
                  key={item.id}
                  className="bg-surface rounded-[13px] border border-border p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-charcoal text-sm">{item.title}</span>
                    <button
                      onClick={() => generateScript(item.id)}
                      disabled={isRegen}
                      className="flex items-center gap-1 text-xs text-muted-text hover:text-lavender transition-colors disabled:opacity-50 px-2 py-1 rounded-[6px] hover:bg-lavender-pale group"
                      title="AI로 다른 멘트 생성하기"
                    >
                      <span
                        className={`text-sm transition-transform duration-400 ${
                          isRegen ? 'animate-spin' : 'group-hover:rotate-180'
                        }`}
                      >
                        ↻
                      </span>
                      <span>{isRegen ? 'AI 생성 중' : 'AI 멘트'}</span>
                    </button>
                  </div>
                  <p
                    className={`text-sm leading-relaxed transition-opacity duration-300 ${
                      isRegen ? 'text-muted-text/40' : 'text-muted-text'
                    }`}
                  >
                    {script}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={onNext}
            className="w-full py-4 bg-lavender text-white rounded-[13px] font-bold text-base hover:bg-lavender-light transition-all hover:shadow-md"
          >
            미리보기 확인 →
          </button>
        </div>
      </div>
    </div>
  )
}
