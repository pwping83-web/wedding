import { useRef, useState } from 'react'
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

const DEFAULT_DURATION = 120

export default function FinalOutput({ data, setData, onBack }: Props) {
  const [view, setView] = useState<CueSheetVariant>('mc')
  const [mcEmail, setMcEmail] = useState(data.email || '')
  const [coupleEmail, setCoupleEmail] = useState(data.coupleEmail || '')
  const [delivered, setDelivered] = useState(false)
  const [delivering, setDelivering] = useState(false)
  const [deliverError, setDeliverError] = useState('')
  const [printing, setPrinting] = useState(false)
  const [uploading, setUploading] = useState<'groom' | 'bride' | null>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const groomInputRef = useRef<HTMLInputElement>(null)
  const brideInputRef = useRef<HTMLInputElement>(null)

  const groomMeta = getEntranceCueMeta(data, 'groom')
  const brideMeta = getEntranceCueMeta(data, 'bride')

  const handlePrint = () => {
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setTimeout(() => setPrinting(false), 2000)
    }, 150)
  }

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

        return {
          ...prev,
          [audioKey]: analyzed,
          [markerKey]: nextMarker,
        }
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
      setTimeout(() => setDelivered(false), 4000)
    } catch (error) {
      setDeliverError(error instanceof Error ? error.message : '전달에 실패했습니다.')
    } finally {
      setDelivering(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="sticky top-0 z-20 bg-bg/95 backdrop-blur-sm border-b border-border no-print">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={onBack}
            className="text-muted-text hover:text-charcoal transition-colors text-sm"
          >
            ← 이전
          </button>
          <span className="font-semibold text-charcoal text-sm mx-auto">최종 큐시트</span>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {/* View toggle */}
        <div className="flex gap-1 bg-muted-bg rounded-[12px] p-1 mb-5 no-print">
          {(
            [
              ['mc', '사회자 전달용'],
              ['couple', '본인 출력용'],
            ] as [CueSheetVariant, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2.5 rounded-[10px] text-sm font-semibold transition-all ${
                view === v
                  ? 'bg-surface text-charcoal shadow-sm'
                  : 'text-muted-text hover:text-charcoal'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Audio upload section */}
        <div className="bg-surface rounded-[13px] border border-border p-5 mb-5 no-print">
          <h2 className="font-semibold text-charcoal text-sm mb-1">입장 음원 첨부</h2>
          <p className="text-muted-text text-xs mb-4">
            음원을 업로드하면 최종 큐시트에 제목과 입장 타이밍이 함께 표시됩니다.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-muted-bg rounded-[10px] p-4 border border-border">
              <p className="text-xs font-semibold text-charcoal mb-2">💒 신랑 입장</p>
              {data.groomAudio ? (
                <p className="text-xs text-lavender font-medium truncate mb-2">
                  🎵 {data.groomAudio.fileName}
                </p>
              ) : (
                <p className="text-xs text-muted-text mb-2">음원 없음</p>
              )}
              {groomMeta && (
                <p className="text-xs font-bold text-sage mb-3">{groomMeta.timingLabel}</p>
              )}
              <button
                type="button"
                onClick={() => groomInputRef.current?.click()}
                disabled={uploading === 'groom'}
                className="w-full py-2 bg-lavender-pale text-lavender rounded-[8px] text-xs font-semibold hover:bg-lavender hover:text-white transition-all disabled:opacity-50"
              >
                {uploading === 'groom' ? '업로드 중...' : data.groomAudio ? '음원 변경' : '음원 파일 업로드'}
              </button>
              <input
                ref={groomInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) uploadAudio('groom', file)
                }}
              />
            </div>

            <div className="bg-muted-bg rounded-[10px] p-4 border border-border">
              <p className="text-xs font-semibold text-charcoal mb-2">👰 신부 입장</p>
              {data.brideAudio ? (
                <p className="text-xs text-lavender font-medium truncate mb-2">
                  🎵 {data.brideAudio.fileName}
                </p>
              ) : (
                <p className="text-xs text-muted-text mb-2">음원 없음</p>
              )}
              {brideMeta && (
                <p className="text-xs font-bold text-sage mb-3">{brideMeta.timingLabel}</p>
              )}
              <button
                type="button"
                onClick={() => brideInputRef.current?.click()}
                disabled={uploading === 'bride'}
                className="w-full py-2 bg-lavender-pale text-lavender rounded-[8px] text-xs font-semibold hover:bg-lavender hover:text-white transition-all disabled:opacity-50"
              >
                {uploading === 'bride' ? '업로드 중...' : data.brideAudio ? '음원 변경' : '음원 파일 업로드'}
              </button>
              <input
                ref={brideInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) uploadAudio('bride', file)
                }}
              />
            </div>
          </div>
          {!data.groomMarkers[0] && !data.brideMarkers[0] && (
            <p className="text-[10px] text-muted-text mt-3">
              입장 타이밍은 「입장 연출 설정」에서 조정하거나, 여기서 음원 업로드 시 기본값이 설정됩니다.
            </p>
          )}
        </div>

        {/* Delivery form */}
        <div className="bg-surface rounded-[13px] border border-border p-5 mb-6 no-print">
          <h2 className="font-semibold text-charcoal text-sm mb-3">사회자에게 전달</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-text mb-1.5">
                사회자 이메일
              </label>
              <input
                type="email"
                placeholder="mc@example.com"
                value={mcEmail}
                onChange={(e) => setMcEmail(e.target.value)}
                className="w-full px-4 py-3 bg-muted-bg border border-border rounded-[10px] text-sm text-charcoal outline-none focus:ring-2 focus:ring-lavender/25 focus:border-lavender"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-text mb-1.5">
                본인 이메일 (선택 — 사본 수신)
              </label>
              <input
                type="email"
                placeholder="my@example.com"
                value={coupleEmail}
                onChange={(e) => setCoupleEmail(e.target.value)}
                className="w-full px-4 py-3 bg-muted-bg border border-border rounded-[10px] text-sm text-charcoal outline-none focus:ring-2 focus:ring-lavender/25 focus:border-lavender"
              />
            </div>
            {deliverError && (
              <p className="text-xs text-rose bg-rose-pale px-3 py-2 rounded-[8px]">{deliverError}</p>
            )}
            <button
              onClick={handleDeliver}
              disabled={!mcEmail.trim() || delivering}
              className={`w-full py-4 rounded-[12px] font-bold text-sm transition-all disabled:opacity-40 ${
                delivered
                  ? 'bg-sage text-white'
                  : 'bg-rose text-white hover:bg-rose/90 hover:shadow-md'
              }`}
            >
              {delivered ? '✓ 사회자에게 전달 완료!' : delivering ? '전달 중...' : '사회자에게 전달'}
            </button>
            <p className="text-[10px] text-muted-text text-center">
              큐시트 전체 · 입장 음원 정보 · 타이밍이 함께 전송됩니다
            </p>
          </div>
        </div>

        {/* Printable documents — both in DOM, show active only on screen, print active only */}
        <div ref={printRef} className="print-document">
          <div className={view === 'mc' ? 'block' : 'hidden print:hidden'}>
            <CueSheetDocument data={data} variant="mc" />
          </div>
          <div className={view === 'couple' ? 'block' : 'hidden print:hidden'}>
            <CueSheetDocument data={data} variant="couple" />
          </div>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg/95 backdrop-blur-sm border-t border-border px-4 py-4 no-print">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={handlePrint}
            disabled={printing}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[12px] font-bold text-sm transition-all ${
              printing
                ? 'bg-sage text-white'
                : view === 'couple'
                  ? 'bg-rose text-white hover:bg-rose/90'
                  : 'bg-lavender text-white hover:bg-lavender-light'
            }`}
          >
            <span>🖨️</span>
            {printing ? '인쇄 중...' : view === 'couple' ? '본인용 인쇄' : '사회자용 인쇄'}
          </button>
          <button
            onClick={handleDeliver}
            disabled={!mcEmail.trim() || delivering || delivered}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[12px] font-bold text-sm transition-all disabled:opacity-40 ${
              delivered
                ? 'bg-sage text-white'
                : 'bg-surface border border-border text-charcoal hover:border-rose hover:text-rose'
            }`}
          >
            <span>✉️</span>
            {delivered ? '전달 완료' : delivering ? '전달 중...' : '사회자 전달'}
          </button>
        </div>
      </div>
    </div>
  )
}
