import { useRef } from 'react'
import StepIndicator from '../components/StepIndicator'
import type { AppData, Marker, SetData } from '../data'
import { WAVEFORM_HEIGHTS } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

const DURATION = 120 // seconds

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface TimelineProps {
  label: string
  markers: Marker[]
  onAdd: (time: number) => void
  onUpdateScript: (id: string, script: string) => void
  onUpdateTime: (id: string, time: number) => void
  onDelete: (id: string) => void
}

function Timeline({ label, markers, onAdd, onUpdateScript, onUpdateTime, onDelete }: TimelineProps) {
  const barRef = useRef<HTMLDivElement>(null)

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = barRef.current!.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onAdd(Math.round(pct * DURATION))
  }

  const handleMarkerDrag = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    e.preventDefault()
    const moveHandler = (me: MouseEvent) => {
      if (!barRef.current) return
      const rect = barRef.current.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width))
      onUpdateTime(id, Math.round(pct * DURATION))
    }
    const upHandler = () => {
      window.removeEventListener('mousemove', moveHandler)
      window.removeEventListener('mouseup', upHandler)
    }
    window.addEventListener('mousemove', moveHandler)
    window.addEventListener('mouseup', upHandler)
  }

  const sorted = [...markers].sort((a, b) => a.time - b.time)

  return (
    <div className="bg-surface rounded-[13px] border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-charcoal text-sm">{label}</span>
        <label className="px-3 py-1.5 bg-muted-bg rounded-[8px] text-xs text-muted-text font-medium flex items-center gap-1.5 hover:bg-lavender-pale hover:text-lavender transition-colors cursor-pointer">
          <span>🎵</span>
          <span>음원 업로드</span>
          <input type="file" accept="audio/*" className="hidden" />
        </label>
      </div>

      {/* Waveform */}
      <div className="h-12 bg-muted-bg rounded-[8px] mb-4 overflow-hidden flex items-end gap-px px-1">
        {WAVEFORM_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-lavender/30 rounded-t-sm"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      {/* Timeline bar */}
      <div className="mb-1">
        <div className="flex justify-between text-[10px] text-muted-text mb-1 tabular-nums">
          <span>0:00</span>
          <span>0:30</span>
          <span>1:00</span>
          <span>1:30</span>
          <span>2:00</span>
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
          {markers.map((m) => (
            <div
              key={m.id}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group z-10"
              style={{ left: `${(m.time / DURATION) * 100}%` }}
              onMouseDown={(e) => handleMarkerDrag(e, m.id)}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-5 h-5 bg-lavender rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing group-hover:scale-125 transition-transform" />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none tabular-nums">
                {fmt(m.time)}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-text mt-1.5">
          타임라인을 클릭해 멘트 마커를 추가하고, 드래그로 위치를 조정하세요
        </p>
      </div>

      {/* Marker list */}
      {sorted.length > 0 && (
        <div className="mt-4 space-y-2">
          {sorted.map((m) => (
            <div
              key={m.id}
              className="flex items-start gap-3 p-3 bg-muted-bg rounded-[10px] group"
            >
              <span className="text-lavender font-semibold text-xs min-w-[36px] mt-0.5 tabular-nums">
                {fmt(m.time)}
              </span>
              <input
                type="text"
                value={m.script}
                onChange={(e) => onUpdateScript(m.id, e.target.value)}
                placeholder="이 시점의 멘트를 입력하세요..."
                className="flex-1 bg-transparent text-sm text-charcoal outline-none placeholder:text-muted-text/50"
              />
              <button
                onClick={() => onDelete(m.id)}
                className="text-muted-text/40 hover:text-rose transition-colors text-xs opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function EntranceSetup({ data, setData, onNext, onBack }: Props) {
  const addMarker = (type: 'groom' | 'bride', time: number) => {
    const m: Marker = { id: Date.now().toString(), time, script: '' }
    if (type === 'groom') {
      setData((prev) => ({ ...prev, groomMarkers: [...prev.groomMarkers, m] }))
    } else {
      setData((prev) => ({ ...prev, brideMarkers: [...prev.brideMarkers, m] }))
    }
  }

  const updateScript = (type: 'groom' | 'bride', id: string, script: string) => {
    const mapper = (arr: Marker[]) => arr.map((m) => (m.id === id ? { ...m, script } : m))
    if (type === 'groom') {
      setData((prev) => ({ ...prev, groomMarkers: mapper(prev.groomMarkers) }))
    } else {
      setData((prev) => ({ ...prev, brideMarkers: mapper(prev.brideMarkers) }))
    }
  }

  const updateTime = (type: 'groom' | 'bride', id: string, time: number) => {
    const mapper = (arr: Marker[]) => arr.map((m) => (m.id === id ? { ...m, time } : m))
    if (type === 'groom') {
      setData((prev) => ({ ...prev, groomMarkers: mapper(prev.groomMarkers) }))
    } else {
      setData((prev) => ({ ...prev, brideMarkers: mapper(prev.brideMarkers) }))
    }
  }

  const deleteMarker = (type: 'groom' | 'bride', id: string) => {
    if (type === 'groom') {
      setData((prev) => ({ ...prev, groomMarkers: prev.groomMarkers.filter((m) => m.id !== id) }))
    } else {
      setData((prev) => ({ ...prev, brideMarkers: prev.brideMarkers.filter((m) => m.id !== id) }))
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <StepIndicator currentStep={2} onBack={onBack} />

      <div className="max-w-lg mx-auto px-4 py-8 pb-20">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">입장 연출 설정</h1>
          <p className="text-muted-text text-sm">
            입장 음악과 시점별 멘트 마커를 설정하세요
          </p>
        </div>

        <div className="space-y-5">
          <Timeline
            label="💒 신랑 입장"
            markers={data.groomMarkers}
            onAdd={(t) => addMarker('groom', t)}
            onUpdateScript={(id, s) => updateScript('groom', id, s)}
            onUpdateTime={(id, t) => updateTime('groom', id, t)}
            onDelete={(id) => deleteMarker('groom', id)}
          />
          <Timeline
            label="👰 신부 입장"
            markers={data.brideMarkers}
            onAdd={(t) => addMarker('bride', t)}
            onUpdateScript={(id, s) => updateScript('bride', id, s)}
            onUpdateTime={(id, t) => updateTime('bride', id, t)}
            onDelete={(id) => deleteMarker('bride', id)}
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
