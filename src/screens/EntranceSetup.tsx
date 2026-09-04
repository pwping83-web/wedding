import { useRef, useState } from 'react'
import StepIndicator from '../components/StepIndicator'
import type { AppData, EntranceAudio, Marker, SetData, Style } from '../data'
import { WAVEFORM_HEIGHTS, getMarkerEntranceScript } from '../data'
import { buildEntranceGeneratePayload, requestGeneratedScript } from '../lib/generateScript'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

const DEFAULT_DURATION = 120

async function analyzeAudioFile(file: File): Promise<EntranceAudio> {
  const url = URL.createObjectURL(file)
  const arrayBuffer = await file.arrayBuffer()
  const audioContext = new AudioContext()

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const channelData = audioBuffer.getChannelData(0)
    const barCount = WAVEFORM_HEIGHTS.length
    const blockSize = Math.max(1, Math.floor(channelData.length / barCount))
    const waveform: number[] = []

    for (let i = 0; i < barCount; i++) {
      let peak = 0
      const start = i * blockSize
      const end = Math.min(start + blockSize, channelData.length)
      for (let j = start; j < end; j++) {
        peak = Math.max(peak, Math.abs(channelData[j]))
      }
      waveform.push(Math.max(4, Math.round(peak * 140)))
    }

    return {
      fileName: file.name,
      url,
      duration: Math.max(1, Math.round(audioBuffer.duration)),
      waveform,
    }
  } finally {
    await audioContext.close()
  }
}

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
    <div className="bg-surface rounded-[13px] border border-border p-5">
      <div className="flex items-center justify-between mb-4 gap-3">
        <span className="font-semibold text-charcoal text-sm">{label}</span>
        <div className="flex items-center gap-2">
          {audio && (
            <button
              type="button"
              onClick={onRemoveAudio}
              className="px-2.5 py-1.5 rounded-[8px] text-xs text-muted-text hover:text-rose hover:bg-rose-pale transition-colors"
            >
              음원 제거
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 bg-muted-bg rounded-[8px] text-xs text-muted-text font-medium flex items-center gap-1.5 hover:bg-lavender-pale hover:text-lavender transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>🎵</span>
            <span>{uploading ? '업로드 중...' : audio ? '음원 변경' : '음원 업로드'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {audio && (
        <div className="mb-3 px-3 py-2 bg-lavender-pale/60 rounded-[8px] border border-lavender/15">
          <p className="text-xs text-lavender font-medium truncate mb-2">📁 {audio.fileName}</p>
          <audio controls src={audio.url} className="w-full h-9" preload="metadata" />
        </div>
      )}

      {uploadError && <p className="text-xs text-rose mb-3">{uploadError}</p>}

      <div className="h-12 bg-muted-bg rounded-[8px] mb-4 overflow-hidden flex items-end gap-px px-1">
        {waveform.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-sm ${audio ? 'bg-lavender/60' : 'bg-lavender/30'}`}
            style={{ height: `${h}px` }}
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
          className="relative h-8 bg-lavender-pale rounded-full cursor-crosshair select-none border border-lavender/20"
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
              <div className="w-5 h-5 bg-lavender rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing group-hover:scale-125 transition-transform" />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none tabular-nums">
                {fmt(marker.time)}
              </div>
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-text mt-1.5">
          {marker
            ? '타임라인을 클릭하거나 마커를 드래그해 입장 타이밍을 조정하세요'
            : audio
              ? '타임라인을 클릭해 입장 타이밍을 선택하세요 (1회만 설정)'
              : '음원을 업로드한 뒤 입장 타이밍을 선택하세요'}
        </p>
      </div>

      {marker && (
        <div className="mt-4 p-4 bg-muted-bg rounded-[10px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lavender font-bold text-xs tabular-nums">{fmt(marker.time)}</span>
              <span className="text-xs text-muted-text">이 시점의 멘트 선택하기</span>
            </div>
            <button
              onClick={onClear}
              className="text-muted-text/50 hover:text-rose text-xs transition-colors"
            >
              타이밍 초기화
            </button>
          </div>

          <div className="bg-surface rounded-[10px] border border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-lavender uppercase tracking-wide">
                사회자 멘트
              </span>
              <button
                onClick={handleGenerate}
                disabled={regenerating}
                className="flex items-center gap-1 text-xs text-muted-text hover:text-lavender transition-colors disabled:opacity-50 px-2 py-1 rounded-[6px] hover:bg-lavender-pale group"
              >
                <span
                  className={`text-sm transition-transform duration-400 ${
                    regenerating ? 'animate-spin' : 'group-hover:rotate-180'
                  }`}
                >
                  ↻
                </span>
                <span>{regenerating ? 'AI 생성 중' : 'AI 멘트'}</span>
              </button>
            </div>
            <p
              className={`text-sm leading-relaxed transition-opacity duration-300 ${
                regenerating ? 'text-muted-text/40' : 'text-charcoal'
              }`}
            >
              {scriptDisplay}
            </p>
          </div>

          <p className="text-[10px] text-muted-text mt-2.5 flex items-center gap-1">
            <span>→</span>
            <span>
              {fmt(marker.time)}에 위 멘트 후 {entranceType === 'groom' ? '신랑' : '신부'} 입장
            </span>
          </p>
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

    const personName = type === 'groom' ? data.groomName : data.brideName
    const currentScript = getMarkerEntranceScript(type, data.style, marker, personName)

    try {
      const script = await requestGeneratedScript(
        buildEntranceGeneratePayload(data, type, currentScript),
      )
      setData((prev) => ({
        ...prev,
        [key]: prev[key].map((m) =>
          m.id === marker.id ? { ...m, customScript: script } : m,
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
    <div className="min-h-screen bg-bg">
      <StepIndicator currentStep={2} onBack={onBack} />

      <div className="max-w-lg mx-auto px-4 py-8 pb-20">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">입장 연출 설정</h1>
          <p className="text-muted-text text-sm">
            입장 음원을 업로드하고, 타이밍과 멘트를 선택하세요
          </p>
        </div>

        <div className="space-y-5">
          <Timeline
            label="💒 신랑 입장"
            entranceType="groom"
            personName={data.groomName}
            style={data.style}
            audio={data.groomAudio}
            marker={groomMarker}
            script={
              groomMarker
                ? getMarkerEntranceScript('groom', data.style, groomMarker, data.groomName)
                : ''
            }
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
            script={
              brideMarker
                ? getMarkerEntranceScript('bride', data.style, brideMarker, data.brideName)
                : ''
            }
            onUpload={(file) => uploadAudio('bride', file)}
            onRemoveAudio={() => removeAudio('bride')}
            onSetTime={(t) => setEntranceTime('bride', t)}
            onGenerateScript={() => generateEntranceScript('bride')}
            onClear={() => clearEntrance('bride')}
          />
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={onNext}
            className="w-full py-4 bg-lavender text-white rounded-[13px] font-bold text-base hover:bg-lavender-light transition-all hover:shadow-md"
          >
            다음 단계 →
          </button>
          <button
            onClick={onNext}
            className="w-full py-2.5 text-muted-text text-sm hover:text-charcoal transition-colors"
          >
            이 단계 건너뛰기
          </button>
        </div>
      </div>
    </div>
  )
}
