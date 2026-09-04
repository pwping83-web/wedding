import { useRef, useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, Marker, SetData, Style } from '../data'
import { WAVEFORM_HEIGHTS } from '../data'
import { getEntranceDisplayScript } from '../lib/cueSheetUtils'
import { buildEntranceGeneratePayload, requestGeneratedScript } from '../lib/generateScript'
import { analyzeAudioFile } from '../lib/audioAnalysis'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

const DEFAULT_DURATION = 120

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface TimelineProps {
  label: string
  entranceType: 'groom' | 'bride'
  personName: string
  style: Style
  audio: EntranceAudio | null
  marker: Marker | null
  script: string
  onUpload: (file: File) => Promise<void>
  onRemoveAudio: () => void
  onSetTime: (time: number) => void
  onGenerateScript: () => Promise<void>
  onClear: () => void
}

function Timeline({
  label,
  entranceType,
  personName,
  style,
  audio,
  marker,
  script,
  onUpload,
  onRemoveAudio,
  onSetTime,
  onGenerateScript,
  onClear,
}: TimelineProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const duration = audio?.duration ?? DEFAULT_DURATION
  const waveform = audio?.waveform ?? WAVEFORM_HEIGHTS

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = barRef.current!.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onSetTime(Math.round(pct * duration))
  }

  const handleMarkerDrag = (e: React.MouseEvent) => {
    if (!marker) return
    e.stopPropagation()
    e.preventDefault()
    const moveHandler = (me: MouseEvent) => {
      if (!barRef.current) return
      const rect = barRef.current.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width))
      onSetTime(Math.round(pct * duration))
    }
    const upHandler = () => {
      window.removeEventListener('mousemove', moveHandler)
      window.removeEventListener('mouseup', upHandler)
    }
    window.addEventListener('mousemove', moveHandler)
    window.addEventListener('mouseup', upHandler)
  }

  const handleGenerate = async () => {
    setRegenerating(true)
    try {
      await onGenerateScript()
    } finally {
      setRegenerating(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      setUploadError('오디오 파일만 업로드할 수 있습니다.')
      return
    }

    setUploadError('')
    setUploading(true)
    try {
      await onUpload(file)
    } catch {
      setUploadError('음원을 불러오지 못했습니다. 다른 파일로 다시 시도해 주세요.')
    } finally {
      setUploading(false)
    }
  }

  const scriptDisplay = script

  const tickMarks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="font-semibold text-charcoal text-[15px]">{label}</span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-[13px] font-medium text-accent disabled:opacity-50"
        >
          {uploading ? '업로드…' : audio ? '변경' : '음원 업로드'}
        </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
            className="hidden"
            onChange={handleFileChange}
          />
      </div>

      {audio && (
        <div className="mb-3">
          <p className="text-[12px] text-muted-text truncate mb-2">{audio.fileName}</p>
          <audio controls src={audio.url} className="w-full h-10" preload="metadata" />
          <button type="button" onClick={onRemoveAudio} className="text-[12px] text-muted-text mt-2">
            음원 제거
          </button>
        </div>
      )}

      {uploadError && <p className="text-[12px] text-danger mb-2">{uploadError}</p>}

      <div className="h-10 bg-muted-bg rounded-lg mb-3 overflow-hidden flex items-end gap-px px-0.5">
        {waveform.slice(0, 40).map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-sm ${audio ? 'bg-accent/50' : 'bg-accent/20'}`}
            style={{ height: `${Math.min(h, 36)}px` }}
          />
        ))}
      </div>

      <div className="mb-1">
        <div className="flex justify-between text-[10px] text-muted-text mb-1 tabular-nums">
          {tickMarks.map((pct) => (
            <span key={pct}>{fmt(Math.round(pct * duration))}</span>
          ))}
        </div>
        <div
          ref={barRef}
          onClick={handleBarClick}
          className="relative h-10 bg-accent-soft rounded-full cursor-pointer select-none border border-border"
        >
          {[0.25, 0.5, 0.75].map((pct) => (
            <div
              key={pct}
              className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-lavender/25"
              style={{ left: `${pct * 100}%` }}
            />
          ))}
          {marker && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group z-10"
              style={{ left: `${(marker.time / duration) * 100}%` }}
              onMouseDown={handleMarkerDrag}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-5 h-5 bg-accent rounded-full border-2 border-white shadow-sm" />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none tabular-nums">
                {fmt(marker.time)}
              </div>
            </div>
          )}
        </div>
        <p className="text-[11px] text-muted-text mt-1.5">
          {marker ? `${marker.time}초 후 입장 · 탭/드래그로 조정` : '타임라인을 탭해 입장 시점 선택'}
        </p>
      </div>

      {marker && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-accent">{marker.time}초 후 입장</span>
            <button type="button" onClick={onClear} className="text-[12px] text-muted-text">
              초기화
            </button>
          </div>
          <p className={`text-[14px] leading-relaxed mb-3 ${regenerating ? 'opacity-40' : ''}`}>
            {scriptDisplay}
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={regenerating}
            className="text-[13px] font-medium text-accent"
          >
            {regenerating ? 'AI 생성 중…' : 'AI 멘트 생성'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function EntranceSetup({ data, setData, onNext, onBack }: Props) {
  const groomMarker = data.groomMarkers[0] ?? null
  const brideMarker = data.brideMarkers[0] ?? null

  const setEntranceTime = (type: 'groom' | 'bride', time: number) => {
    const maxTime = (type === 'groom' ? data.groomAudio : data.brideAudio)?.duration ?? DEFAULT_DURATION
    const clampedTime = Math.max(0, Math.min(time, maxTime))

    setData((prev) => {
      const key = type === 'groom' ? 'groomMarkers' : 'brideMarkers'
      const existing = prev[key][0]
      if (existing) {
        return { ...prev, [key]: [{ ...existing, time: clampedTime }] }
      }
      const marker: Marker = { id: Date.now().toString(), time: clampedTime, scriptVariant: 0 }
      return { ...prev, [key]: [marker] }
    })
  }

  const uploadAudio = async (type: 'groom' | 'bride', file: File) => {
    const analyzed = await analyzeAudioFile(file)
    const audioKey = type === 'groom' ? 'groomAudio' : 'brideAudio'
    const markerKey = type === 'groom' ? 'groomMarkers' : 'brideMarkers'

    setData((prev) => {
      const previous = prev[audioKey]
      if (previous?.url) URL.revokeObjectURL(previous.url)

      const existingMarker = prev[markerKey][0]
      const nextMarker = existingMarker
        ? [{ ...existingMarker, time: Math.min(existingMarker.time, analyzed.duration) }]
        : prev[markerKey]

      return {
        ...prev,
        [audioKey]: analyzed,
        [markerKey]: nextMarker,
      }
    })
  }

  const removeAudio = (type: 'groom' | 'bride') => {
    const audioKey = type === 'groom' ? 'groomAudio' : 'brideAudio'
    setData((prev) => {
      const previous = prev[audioKey]
      if (previous?.url) URL.revokeObjectURL(previous.url)
      return { ...prev, [audioKey]: null }
    })
  }

  const generateEntranceScript = async (type: 'groom' | 'bride') => {
    const key = type === 'groom' ? 'groomMarkers' : 'brideMarkers'
    const marker = data[key][0]
    if (!marker) return

    const currentScript = getEntranceDisplayScript(type, data)

    try {
      const script = await requestGeneratedScript(
        buildEntranceGeneratePayload(data, type, currentScript),
      )
      const orderTitle = type === 'groom' ? '신랑 입장' : '신부 입장'
      setData((prev) => ({
        ...prev,
        [key]: prev[key].map((m) =>
          m.id === marker.id ? { ...m, customScript: script } : m,
        ),
        orderItems: prev.orderItems.map((item) =>
          item.title === orderTitle ? { ...item, customScript: script } : item,
        ),
      }))
    } catch {
      setData((prev) => ({
        ...prev,
        [key]: prev[key].map((m) =>
          m.id === marker.id
            ? { ...m, scriptVariant: m.scriptVariant + 1, customScript: undefined }
            : m,
        ),
      }))
    }
  }

  const clearEntrance = (type: 'groom' | 'bride') => {
    const key = type === 'groom' ? 'groomMarkers' : 'brideMarkers'
    setData((prev) => ({ ...prev, [key]: [] }))
  }

  return (
    <ScreenLayout
      step={2}
      stepLabel="입장"
      title="입장 연출"
      subtitle="음원 업로드 후 입장 타이밍 선택"
      onBack={onBack}
      footer={
        <div className="space-y-2">
          <Btn onClick={onNext}>다음</Btn>
          <Btn variant="ghost" onClick={onNext}>
            건너뛰기
          </Btn>
        </div>
      }
    >
      <div className="space-y-4">
          <Timeline
            label="💒 신랑 입장"
            entranceType="groom"
            personName={data.groomName}
            style={data.style}
            audio={data.groomAudio}
            marker={groomMarker}
            script={groomMarker ? getEntranceDisplayScript('groom', data) : ''}
            onUpload={(file) => uploadAudio('groom', file)}
            onRemoveAudio={() => removeAudio('groom')}
            onSetTime={(t) => setEntranceTime('groom', t)}
            onGenerateScript={() => generateEntranceScript('groom')}
            onClear={() => clearEntrance('groom')}
          />
          <Timeline
            label="👰 신부 입장"
            entranceType="bride"
            personName={data.brideName}
            style={data.style}
            audio={data.brideAudio}
            marker={brideMarker}
            script={brideMarker ? getEntranceDisplayScript('bride', data) : ''}
            onUpload={(file) => uploadAudio('bride', file)}
            onRemoveAudio={() => removeAudio('bride')}
            onSetTime={(t) => setEntranceTime('bride', t)}
            onGenerateScript={() => generateEntranceScript('bride')}
            onClear={() => clearEntrance('bride')}
          />
      </div>
    </ScreenLayout>
  )
}
