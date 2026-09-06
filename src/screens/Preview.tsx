import { useEffect, useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, OrderItem, SetData } from '../data'
import { isMarriageDeclarationTitle, marriageDeclarationReaderLabels, roleLabels } from '../data'
import { ENTRANCE_AUDIO_TIMING_ENABLED, flowStep } from '../config/features'
import {
  getEntranceCueMeta,
  entranceTypeForTitle,
  getItemScriptForCueSheet,
  addMinutesLabel,
  buildOrderItemsWithTime,
} from '../lib/cueSheetUtils'
import {
  ENTRANCE_TIMING_PRESETS,
  getEntranceMarker,
  hasEntranceTiming,
  setEntranceTimingSeconds,
} from '../lib/entranceTiming'
import {
  buildEntranceGeneratePayload,
  buildOrderGeneratePayload,
  requestGeneratedScript,
} from '../lib/generateScript'
import { isSpeechSupported, speakText, stopSpeaking } from '../lib/speechSynthesis'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
  onGoOutput: () => void
}

function EntranceTimingPicker({
  type,
  data,
  setData,
}: {
  type: 'groom' | 'bride'
  data: AppData
  setData: SetData
}) {
  const marker = getEntranceMarker(data, type)
  const selected = marker?.time ?? null

  return (
    <div className="mb-3">
      <p className="text-[12px] font-medium text-charcoal mb-2">입장 타이밍</p>
      <div className="flex flex-wrap gap-1.5">
        <label
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[12px] font-medium cursor-pointer ${
            selected == null
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-border bg-surface text-muted-text'
          }`}
        >
          <input
            type="radio"
            name={`entrance-timing-${type}`}
            checked={selected == null}
            onChange={() => setEntranceTimingSeconds(setData, type, null)}
            className="sr-only"
          />
          사용 안 함
        </label>
        {ENTRANCE_TIMING_PRESETS.map((seconds) => (
          <label
            key={seconds}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[12px] font-medium cursor-pointer tabular-nums ${
              selected === seconds
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-border bg-surface text-muted-text'
            }`}
          >
            <input
              type="radio"
              name={`entrance-timing-${type}`}
              checked={selected === seconds}
              onChange={() => setEntranceTimingSeconds(setData, type, seconds)}
              className="sr-only"
            />
            {seconds}초
          </label>
        ))}
      </div>
    </div>
  )
}

export default function Preview({ data, setData, onBack, onGoOutput }: Props) {
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState('')

  const items = buildOrderItemsWithTime(data)
  const total = data.orderItems.reduce((s, i) => s + i.duration, 0)
  const speechOk = isSpeechSupported()

  useEffect(() => () => stopSpeaking(), [])

  const handleSpeak = (itemId: string, script: string) => {
    if (!speechOk) return
    speakText(script, itemId, setSpeakingId)
  }

  const generateScript = async (item: OrderItem) => {
    const entranceType = entranceTypeForTitle(item.title)
    const useEntranceTiming = entranceType && hasEntranceTiming(data, entranceType)
    const currentScript = getItemScriptForCueSheet(item, data)

    setGeneratingId(item.id)
    setGenerateError('')
    try {
      if (useEntranceTiming) {
        const script = await requestGeneratedScript(
          buildEntranceGeneratePayload(data, entranceType, currentScript),
        )
        const key = entranceType === 'groom' ? 'groomMarkers' : 'brideMarkers'
        setData((prev) => ({
          ...prev,
          [key]: prev[key].map((m) => ({ ...m, customScript: script })),
          orderItems: prev.orderItems.map((i) =>
            i.id === item.id ? { ...i, customScript: script } : i,
          ),
        }))
      } else {
        const script = await requestGeneratedScript(
          buildOrderGeneratePayload(data, item.title, currentScript),
        )
        setData((prev) => ({
          ...prev,
          orderItems: prev.orderItems.map((i) =>
            i.id === item.id ? { ...i, customScript: script } : i,
          ),
        }))
      }
    } catch (error) {
      if (useEntranceTiming && entranceType) {
        setData((prev) => {
          const key = entranceType === 'groom' ? 'groomMarkers' : 'brideMarkers'
          return {
            ...prev,
            [key]: prev[key].map((m) => ({
              ...m,
              scriptVariant: m.scriptVariant + 1,
              customScript: undefined,
            })),
          }
        })
      } else {
        setData((prev) => ({
          ...prev,
          orderItems: prev.orderItems.map((i) =>
            i.id === item.id
              ? { ...i, scriptVariant: i.scriptVariant + 1, customScript: undefined }
              : i,
          ),
        }))
      }
      setGenerateError(
        error instanceof Error ? error.message : 'AI 멘트 생성에 실패했습니다.',
      )
    } finally {
      setGeneratingId(null)
    }
  }

  return (
    <ScreenLayout
      step={flowStep('preview')}
      stepLabel="미리보기"
      title="식순 미리보기"
      subtitle={`${data.orderItems.length}단계 · ${total}분`}
      onBack={onBack}
      footer={
        <div className="space-y-2">
          <p className="text-center text-[13px] font-semibold text-charcoal">최종 큐시트 완성</p>
          <Btn onClick={onGoOutput}>최종 큐시트 완성</Btn>
        </div>
      }
    >
      {generateError && (
        <p className="text-[12px] text-danger bg-danger-soft px-3 py-2 rounded-xl mb-3">
          {generateError}
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => {
          const entranceType = entranceTypeForTitle(item.title)
          const entranceMeta = entranceType ? getEntranceCueMeta(data, entranceType) : null
          const script = getItemScriptForCueSheet(item, data)
          const isSpeaking = speakingId === item.id
          const isGenerating = generatingId === item.id

          const person = data.persons.find((p) => {
            if (item.title === '축가') return p.role === 'vocalist'
            if (item.title === '축사') return p.role === 'speaker'
            return false
          })

          return (
            <Card key={item.id} className="p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-[12px] text-muted-text tabular-nums">
                    {index + 1} · {addMinutesLabel(data.time, item.startMin)}
                  </p>
                  <p className="text-[15px] font-semibold text-charcoal">{item.title}</p>
                </div>
                <span className="text-[12px] text-muted-text shrink-0">{item.duration}분</span>
              </div>

              {entranceType && (
                <EntranceTimingPicker type={entranceType} data={data} setData={setData} />
              )}

              {entranceMeta && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ENTRANCE_AUDIO_TIMING_ENABLED && entranceMeta.audioTitle && (
                    <span className="text-[11px] bg-accent-soft text-accent px-2 py-0.5 rounded-full truncate max-w-full">
                      {entranceMeta.audioTitle}
                    </span>
                  )}
                  <span className="text-[11px] bg-success-soft text-success px-2 py-0.5 rounded-full font-medium">
                    {entranceMeta.timingLabel}
                  </span>
                </div>
              )}

              {person && (
                <p className="text-[12px] text-muted-text mb-2">
                  {roleLabels[person.role]} {person.name}
                </p>
              )}

              {isMarriageDeclarationTitle(item.title) && (
                <p className="text-[11px] text-accent font-medium mb-2">
                  {marriageDeclarationReaderLabels[data.marriageDeclarationReader]}
                </p>
              )}

              <p
                className={`text-[13px] text-charcoal leading-relaxed mb-3 whitespace-pre-wrap ${
                  isGenerating ? 'opacity-40' : ''
                }`}
              >
                {script}
              </p>

              <div className="flex gap-2 pt-2 border-t border-border">
                {speechOk && (
                  <button
                    type="button"
                    onClick={() => handleSpeak(item.id, script)}
                    className={`flex-1 h-9 rounded-lg text-[13px] font-medium border ${
                      isSpeaking
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface text-charcoal border-border'
                    }`}
                  >
                    {isSpeaking ? '■ 중지' : '▶ 읽어주기'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => generateScript(item)}
                  disabled={isGenerating}
                  className="flex-1 h-9 rounded-lg text-[13px] font-medium bg-accent-soft text-accent border border-accent/20 disabled:opacity-50"
                >
                  {isGenerating ? 'AI 생성 중…' : 'AI 멘트 재생성'}
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {!speechOk && (
        <p className="text-[11px] text-muted-text text-center mt-4">
          이 브라우저에서는 읽어주기를 사용할 수 없습니다
        </p>
      )}
    </ScreenLayout>
  )
}
