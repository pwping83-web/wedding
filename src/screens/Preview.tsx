import { useEffect, useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import Field from '../components/mobile/Field'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, OrderItem, SetData } from '../data'
import { isMarriageDeclarationTitle, marriageDeclarationReaderLabels, roleLabels } from '../data'
import { flowStep } from '../config/features'
import {
  getEntranceCueMeta,
  entranceTypeForTitle,
  getItemScriptForCueSheet,
  addMinutesLabel,
  buildOrderItemsWithTime,
} from '../lib/cueSheetUtils'
import {
  clearAllEntranceTiming,
  enableEntranceTiming,
  getEntranceMarker,
  getEntranceTrackTitle,
  hasEntranceTiming,
  hasEntranceTimingConfig,
  parseEntranceSeconds,
  setEntranceTimingSeconds,
  setEntranceTrackTitle,
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

function EntranceTimingFields({
  type,
  data,
  setData,
}: {
  type: 'groom' | 'bride'
  data: AppData
  setData: SetData
}) {
  const marker = getEntranceMarker(data, type)
  const trackTitle = getEntranceTrackTitle(data, type)
  const roleLabel = type === 'groom' ? '신랑' : '신부'

  return (
    <div className="mb-3 space-y-3 p-3 bg-muted-bg/60 rounded-xl border border-border/80">
      <Field
        label="음원 제목"
        placeholder="예: Canon in D"
        value={trackTitle}
        onChange={(e) => setEntranceTrackTitle(setData, type, e.target.value)}
        className="h-10 text-[14px]"
      />
      <div>
        <label className="block text-[13px] font-medium text-charcoal mb-1.5">
          {roleLabel} 입장 시간
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="14"
            value={marker?.time ? String(marker.time) : ''}
            onChange={(e) => {
              const raw = e.target.value
              if (!raw.trim()) {
                setEntranceTimingSeconds(setData, type, null)
                return
              }
              const seconds = parseEntranceSeconds(raw)
              if (seconds != null) setEntranceTimingSeconds(setData, type, seconds)
            }}
            className="w-20 h-10 px-3 bg-surface border border-border rounded-xl text-[15px] text-charcoal text-center tabular-nums outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
          <span className="text-[14px] text-charcoal">초 후 입장</span>
        </div>
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
  const hasEntranceSteps = data.orderItems.some(
    (item) => item.title === '신랑 입장' || item.title === '신부 입장',
  )
  const entranceTimingOn = data.entranceTimingEnabled ?? false

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

      {hasEntranceSteps && (
        <label className="flex items-start gap-3 p-3.5 mb-3 bg-surface rounded-xl border border-border cursor-pointer">
          <input
            type="checkbox"
            checked={entranceTimingOn}
            onChange={(e) => {
              if (e.target.checked) {
                enableEntranceTiming(setData)
              } else {
                clearAllEntranceTiming(setData)
              }
            }}
            className="mt-0.5 accent-accent w-4 h-4 shrink-0"
          />
          <span className="text-[13px] text-charcoal leading-snug">
            <span className="font-semibold">입장 타이밍 사용</span>
            <span className="block text-[12px] text-muted-text mt-0.5">
              체크하면 신랑·신부 입장에 음원 제목과 입장 시간(초)을 입력할 수 있습니다
            </span>
          </span>
        </label>
      )}

      <div className="space-y-3">
        {items.map((item, index) => {
          const entranceType = entranceTypeForTitle(item.title)
          const entranceMeta =
            entranceType && entranceTimingOn && hasEntranceTimingConfig(data, entranceType)
              ? getEntranceCueMeta(data, entranceType)
              : null
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

              {entranceType && entranceTimingOn && (
                <EntranceTimingFields type={entranceType} data={data} setData={setData} />
              )}

              {entranceMeta && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {entranceMeta.audioTitle && (
                    <span className="text-[11px] bg-accent-soft text-accent px-2 py-0.5 rounded-full truncate max-w-full">
                      {entranceMeta.audioTitle}
                    </span>
                  )}
                  {entranceMeta.timingLabel && (
                    <span className="text-[11px] bg-success-soft text-success px-2 py-0.5 rounded-full font-medium">
                      {entranceMeta.timingLabel}
                    </span>
                  )}
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
