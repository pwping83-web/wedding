import { useRef, useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import Field from '../components/mobile/Field'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, SetData } from '../data'
import CueSheetDocument from '../components/CueSheetDocument'
import { analyzeAudioFile } from '../lib/audioAnalysis'
import { deliverCueSheetToMc } from '../lib/deliverCueSheet'
import type { CueSheetVariant } from '../lib/cueSheetUtils'
import { getEntranceCueMeta } from '../lib/cueSheetUtils'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

export default function FinalOutput({ data, setData, onBack }: Props) {
  const [view, setView] = useState<CueSheetVariant>('mc')
  const [mcEmail, setMcEmail] = useState(data.email || '')
  const [coupleEmail, setCoupleEmail] = useState(data.coupleEmail || '')
  const [delivered, setDelivered] = useState(false)
  const [delivering, setDelivering] = useState(false)
  const [deliverError, setDeliverError] = useState('')
  const [uploading, setUploading] = useState<'groom' | 'bride' | null>(null)
  const groomInputRef = useRef<HTMLInputElement>(null)
  const brideInputRef = useRef<HTMLInputElement>(null)

  const groomMeta = getEntranceCueMeta(data, 'groom')
  const brideMeta = getEntranceCueMeta(data, 'bride')

  const uploadAudio = async (type: 'groom' | 'bride', file: File) => {
    if (!file.type.startsWith('audio/')) return
    setUploading(type)
    try {
      const analyzed = await analyzeAudioFile(file)
      const audioKey = type === 'groom' ? 'groomAudio' : 'brideAudio'
      const markerKey = type === 'groom' ? 'groomMarkers' : 'brideMarkers'
      setData((prev) => {
        const previous = prev[audioKey]
        if (previous?.url) URL.revokeObjectURL(previous.url)
        const existingMarker = prev[markerKey][0]
        const nextMarker = existingMarker
          ? [{ ...existingMarker, time: Math.min(existingMarker.time, analyzed.duration) }]
          : [{ id: Date.now().toString(), time: Math.round(analyzed.duration * 0.3), scriptVariant: 0 }]
        return { ...prev, [audioKey]: analyzed, [markerKey]: nextMarker }
      })
    } finally {
      setUploading(null)
    }
  }

  const handleDeliver = async () => {
    if (!mcEmail.trim()) return
    setDelivering(true)
    setDeliverError('')
    setData((prev) => ({ ...prev, email: mcEmail.trim(), coupleEmail: coupleEmail.trim() }))
    try {
      await deliverCueSheetToMc({
        mcEmail: mcEmail.trim(),
        coupleEmail: coupleEmail.trim() || undefined,
        data: { ...data, email: mcEmail.trim(), coupleEmail: coupleEmail.trim() },
      })
      setDelivered(true)
    } catch (error) {
      setDeliverError(error instanceof Error ? error.message : '전달 실패')
    } finally {
      setDelivering(false)
    }
  }

  return (
    <ScreenLayout
      title="최종 큐시트"
      subtitle="전달 · 인쇄"
      onBack={onBack}
      contentClassName="pb-36"
      footer={
        <div className="space-y-2">
          <Btn onClick={() => window.print()}>
            {view === 'mc' ? '사회자용 인쇄' : '본인용 인쇄'}
          </Btn>
          <Btn
            variant="secondary"
            onClick={handleDeliver}
            disabled={!mcEmail.trim() || delivering}
          >
            {delivered ? '전달 완료' : delivering ? '전달 중…' : '사회자에게 전달'}
          </Btn>
        </div>
      }
    >
      {/* View toggle */}
      <div className="flex gap-1 bg-muted-bg rounded-xl p-1 mb-5 no-print">
        {(
          [
            ['mc', '사회자용'],
            ['couple', '본인용'],
          ] as [CueSheetVariant, string][]
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold ${
              view === v ? 'bg-surface text-charcoal shadow-sm' : 'text-muted-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Audio upload */}
      <Card className="p-4 mb-4 no-print">
        <p className="text-[14px] font-semibold mb-3">입장 음원</p>
        <div className="space-y-3">
          {(['groom', 'bride'] as const).map((type) => {
            const meta = type === 'groom' ? groomMeta : brideMeta
            const audio = type === 'groom' ? data.groomAudio : data.brideAudio
            const label = type === 'groom' ? '신랑' : '신부'
            const inputRef = type === 'groom' ? groomInputRef : brideInputRef
            return (
              <div key={type} className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">{label}</p>
                  <p className="text-[12px] text-muted-text truncate">
                    {audio?.fileName ?? '미첨부'}
                  </p>
                  {meta && (
                    <p className="text-[12px] text-success font-medium">{meta.timingLabel}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading === type}
                  className="text-[13px] font-medium text-accent shrink-0"
                >
                  {uploading === type ? '…' : '업로드'}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) uploadAudio(type, file)
                  }}
                />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Email */}
      <Card className="p-4 mb-5 space-y-3 no-print">
        <Field
          label="사회자 이메일"
          type="email"
          placeholder="mc@example.com"
          value={mcEmail}
          onChange={(e) => setMcEmail(e.target.value)}
        />
        <Field
          label="본인 이메일 (선택)"
          type="email"
          placeholder="사본 수신"
          value={coupleEmail}
          onChange={(e) => setCoupleEmail(e.target.value)}
        />
        {deliverError && <p className="text-[12px] text-danger">{deliverError}</p>}
      </Card>

      {/* Document */}
      <div className="print-document">
        <div className={view === 'mc' ? 'block' : 'hidden print:hidden'}>
          <CueSheetDocument data={data} variant="mc" />
        </div>
        <div className={view === 'couple' ? 'block' : 'hidden print:hidden'}>
          <CueSheetDocument data={data} variant="couple" />
        </div>
      </div>
    </ScreenLayout>
  )
}
