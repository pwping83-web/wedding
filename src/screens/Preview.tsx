import { useEffect, useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import Field from '../components/mobile/Field'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, OrderItem, SetData } from '../data'
import { isMarriageDeclarationTitle, marriageDeclarationReaderLabels, normalizeMarriageDeclarationReader, roleLabels } from '../data'
import { flowStep } from '../config/features'
import {
  getEntranceCueMeta,
  entranceTypeForTitle,
  getItemScriptForCueSheet,
} from '../lib/cueSheetUtils'
import {
  getEntranceMarker,
  getEntranceTrackTitle,
  hasEntranceTiming,
  hasEntranceTimingConfig,
  isEntranceTimingEnabled,
  parseEntranceSeconds,
  setEntranceTimingEnabled,
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

function updateItemScript(setData: SetData, item: OrderItem, text: string) {
  const entranceType = entranceTypeForTitle(item.title)
  const customScript = text.trim() ? text : undefined

  setData((prev) => {
    const orderItems = prev.orderItems.map((i) =>
      i.id === item.id ? { ...i, customScript } : i,
    )

    const marriageCustom =
      isMarriageDeclarationTitle(item.title) && prev.marriageDeclarationReader !== 'custom'

    if (!entranceType) {
      return marriageCustom
        ? { ...prev, orderItems, marriageDeclarationReader: 'custom' as const }
        : { ...prev, orderItems }
    }

    const markerKey = entranceType === 'groom' ? 'groomMarkers' : 'brideMarkers'
    const markers = prev[markerKey].map((marker) => ({ ...marker, customScript }))

    return marriageCustom
      ? { ...prev, orderItems, [markerKey]: markers, marriageDeclarationReader: 'custom' as const }
      : { ...prev, orderItems, [markerKey]: markers }
  })
}

function ScriptEditor({
  item,
  data,
  setData,
  disabled,
}: {
  item: OrderItem
  data: AppData
  setData: SetData
  disabled?: boolean
}) {
  const script = getItemScriptForCueSheet(item, data)
  const isCustom = isMarriageDeclarationTitle(item.title)
    ? data.marriageDeclarationReader === 'custom' && Boolean(item.customScript?.trim())
    : Boolean(item.customScript?.trim())

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label className="text-[12px] font-medium text-charcoal">사회자 멘트</label>
        {isCustom && (
          <button
            type="button"
            onClick={() => updateItemScript(setData, item, '')}
            className="text-[11px] text-muted-text underline-offset-2 hover:underline"
          >
            기본 멘트로 되돌리기
          </button>
        )}
      </div>
      <textarea
        value={script}
        disabled={disabled}
        onChange={(e) => updateItemScript(setData, item, e.target.value)}
        rows={Math.max(4, Math.min(12, script.split('\n').length + 1))}
        className={`w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-[13px] text-charcoal leading-relaxed resize-y min-h-[96px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 ${
          disabled ? 'opacity-40' : ''
        }`}
        placeholder="멘트를 직접 입력하세요"
      />
      <p className="text-[11px] text-muted-text mt-1.5">
        직접 수정한 내용은 인쇄·사회자 전송 큐시트에 그대로 반영됩니다
      </p>
    </div>
  )
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
    <div className="mb-3 space-y-3 pt-1">
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
            placeholder=""
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

function EntranceTimingToggle({
  type,
  data,
  setData,
}: {
  type: 'groom' | 'bride'
  data: AppData
  setData: SetData
}) {
  const enabled = isEntranceTimingEnabled(data, type)

  return (
    <div className="mb-3 pb-3 border-b border-border/80">
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEntranceTimingEnabled(setData, type, e.target.checked)}
          className="accent-accent w-4 h-4 shrink-0"
        />
        <span className="text-[13px] font-medium text-charcoal">🎵 입장 음원·타이밍 사용</span>
      </label>
      {enabled && <EntranceTimingFields type={type} data={data} setData={setData} />}
    </div>
  )
}

export default function Preview({ data, setData, onBack, onGoOutput }: Props) {
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState('')

  const items = data.orderItems
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
      subtitle={`${data.orderItems.length}단계`}
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
          const entranceMeta =
            entranceType && hasEntranceTimingConfig(data, entranceType)
              ? getEntranceCueMeta(data, entranceType)
              : null
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
                  <p className="text-[12px] text-muted-text tabular-nums">{index + 1}</p>
                  <p className="text-[15px] font-semibold text-charcoal">{item.title}</p>
                </div>
              </div>

              {entranceType && (
                <EntranceTimingToggle type={entranceType} data={data} setData={setData} />
              )}

              {entranceMeta && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {entranceMeta.audioTitle && (
                    <span className="text-[11px] bg-accent-soft text-accent px-2 py-0.5 rounded-full truncate max-w-full">
                      🎵 {entranceMeta.audioTitle}
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
                  {marriageDeclarationReaderLabels[normalizeMarriageDeclarationReader(data.marriageDeclarationReader)]}
                </p>
              )}

              <ScriptEditor
                item={item}
                data={data}
                setData={setData}
                disabled={isGenerating}
              />

              <div className="flex gap-2 pt-2 border-t border-border">
                {speechOk && (
                  <button
                    type="button"
                    onClick={() => handleSpeak(item.id, getItemScriptForCueSheet(item, data))}
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
