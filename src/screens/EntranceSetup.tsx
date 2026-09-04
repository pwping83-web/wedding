import { useRef, useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import Field from '../components/mobile/Field'
import type { AppData, EntranceAudio, Marker, SetData, Style } from '../data'
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
  onSetTrackTitle: (title: string) => void
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
  onSetTrackTitle,
  onSetTime,
  onGenerateScript,
  onClear,
}: TimelineProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragging, setDragging] = useState(false)

  const duration = audio?.duration ?? DEFAULT_DURATION
  const waveform = audio?.waveform ?? WAVEFORM_HEIGHTS
  const markerPct = marker ? (marker.time / duration) * 100 : 0

  const setTimeFromClientX = (clientX: number) => {
    if (!barRef.current) return
    const rect = barRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    onSetTime(Math.round(pct * duration))
  }

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setTimeFromClientX(e.clientX)
  }

  const startDrag = (clientX: number) => {
    if (!marker) {
      setTimeFromClientX(clientX)
    }
    setDragging(true)

    const moveHandler = (x: number) => setTimeFromClientX(x)
    const mouseMove = (me: MouseEvent) => moveHandler(me.clientX)
    const touchMove = (te: TouchEvent) => {
      if (te.touches[0]) moveHandler(te.touches[0].clientX)
    }
    const endHandler = () => {
      setDragging(false)
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('mouseup', endHandler)
      window.removeEventListener('touchmove', touchMove)
      window.removeEventListener('touchend', endHandler)
    }

    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mouseup', endHandler)
    window.addEventListener('touchmove', touchMove, { passive: true })
    window.addEventListener('touchend', endHandler)
  }

  const handleMarkerDrag = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    startDrag(e.clientX)
  }

  const handleMarkerTouch = (e: React.TouchEvent) => {
    e.stopPropagation()
    startDrag(e.touches[0]?.clientX ?? 0)
  }

  const handleTrackTouch = (e: React.TouchEvent) => {
    if (e.touches[0]) setTimeFromClientX(e.touches[0].clientX)
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
        <div className="mb-3 space-y-3">
          <p className="text-[12px] text-muted-text truncate">파일: {audio.fileName}</p>
          <audio controls src={audio.url} className="w-full h-10" preload="metadata" />
          <Field
            label="음원 제목 (이메일·큐시트에 표시)"
            placeholder="유튜브에서 검색할 곡 제목"
            value={audio.trackTitle ?? audio.fileName}
            onChange={(e) => onSetTrackTitle(e.target.value)}
          />
          <p className="text-[11px] text-muted-text leading-relaxed">
            파일명과 실제 곡 제목이 다르면, 유튜브에서 찾을 수 있도록 곡 제목을 수기로 입력해
            주세요.
          </p>
          <button type="button" onClick={onRemoveAudio} className="text-[12px] text-muted-text">
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

      <div className="entrance-drag-zone rounded-2xl p-3 mb-1">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 entrance-drag-hint">
            <span className="text-base leading-none" aria-hidden>
              👆
            </span>
            <span className="text-[13px] font-semibold text-accent">
              {marker ? '보라색 핸들을 좌우로 드래그' : '아래 바를 탭해 입장 시점 선택'}
            </span>
          </div>
          {marker && (
            <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[12px] font-bold text-white tabular-nums">
              {marker.time}초
            </span>
          )}
        </div>

        <div className="flex justify-between text-[10px] text-muted-text mb-1.5 tabular-nums px-0.5">
          {tickMarks.map((pct) => (
            <span key={pct}>{fmt(Math.round(pct * duration))}</span>
          ))}
        </div>

        <div
          ref={barRef}
          onClick={handleBarClick}
          onTouchStart={handleTrackTouch}
          className={`relative h-14 rounded-full cursor-pointer select-none border-2 border-accent/30 overflow-visible entrance-drag-track ${!marker ? 'entrance-drag-track--idle' : ''}`}
          role="slider"
          aria-label="입장 타이밍"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={marker?.time ?? 0}
        >
          {marker && (
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-accent/25 pointer-events-none transition-[width] duration-75"
              style={{ width: `${markerPct}%` }}
            />
          )}

          {[0.25, 0.5, 0.75].map((pct) => (
            <div
              key={pct}
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent/20 pointer-events-none"
              style={{ left: `${pct * 100}%` }}
            />
          ))}

          {!marker && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="flex items-center gap-1 text-[12px] font-medium text-accent/80">
                <span className="entrance-drag-arrow inline-block">→</span>
                탭 또는 드래그
                <span className="entrance-drag-arrow inline-block scale-x-[-1]">→</span>
              </span>
            </div>
          )}

          {marker && (
            <>
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-accent/50 pointer-events-none -translate-x-1/2"
                style={{ left: `${markerPct}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 touch-none"
                style={{ left: `${markerPct}%` }}
                onMouseDown={handleMarkerDrag}
                onTouchStart={handleMarkerTouch}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={`relative flex items-center justify-center ${dragging ? 'scale-110' : ''} transition-transform`}
                >
                  <div
                    className={`absolute w-10 h-10 rounded-full border-2 border-dashed border-accent/40 entrance-drag-handle-ring pointer-events-none ${dragging ? 'opacity-0' : ''}`}
                  />
                  <div
                    className={`relative w-8 h-8 bg-accent rounded-full border-[3px] border-white shadow-md entrance-drag-handle ${dragging ? 'entrance-drag-handle--dragging' : ''}`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex gap-0.5">
                        <span className="w-0.5 h-3 bg-white/90 rounded-full" />
                        <span className="w-0.5 h-3 bg-white/90 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-bold px-2 py-1 rounded-lg whitespace-nowrap tabular-nums shadow-sm">
                  {marker.time}초 후 입장
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-accent rotate-45" />
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-[12px] text-accent/90 font-medium mt-2.5 text-center">
          {marker
            ? `음악 시작 후 ${marker.time}초에 ${entranceType === 'groom' ? '신랑' : '신부'} 입장 · 핸들을 움직여 조정`
            : '음악 타임라인에서 입장 시점을 선택하세요'}
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
        [audioKey]: { ...analyzed, trackTitle: file.name },
        [markerKey]: nextMarker,
      }
    })
  }

  const setTrackTitle = (type: 'groom' | 'bride', title: string) => {
    const audioKey = type === 'groom' ? 'groomAudio' : 'brideAudio'
    setData((prev) => {
      const audio = prev[audioKey]
      if (!audio) return prev
      return {
        ...prev,
        [audioKey]: { ...audio, trackTitle: title },
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
            onSetTrackTitle={(title) => setTrackTitle('groom', title)}
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
            onSetTrackTitle={(title) => setTrackTitle('bride', title)}
            onSetTime={(t) => setEntranceTime('bride', t)}
            onGenerateScript={() => generateEntranceScript('bride')}
            onClear={() => clearEntrance('bride')}
          />
      </div>
    </ScreenLayout>
  )
}
