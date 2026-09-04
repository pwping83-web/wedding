import { useRef, useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import Field from '../components/mobile/Field'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, SetData } from '../data'
import CueSheetDocument from '../components/CueSheetDocument'
import { analyzeAudioFile } from '../lib/audioAnalysis'
import { deliverCueSheetToMc } from '../lib/deliverCueSheet'
import { getEntranceCueMeta } from '../lib/cueSheetUtils'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

export default function FinalOutput({ data, setData, onBack }: Props) {
  const [delivered, setDelivered] = useState(false)
  const [delivering, setDelivering] = useState(false)
  const [deliverError, setDeliverError] = useState('')
  const [uploading, setUploading] = useState<'groom' | 'bride' | null>(null)
  const groomInputRef = useRef<HTMLInputElement>(null)
  const brideInputRef = useRef<HTMLInputElement>(null)

  const groomMeta = getEntranceCueMeta(data, 'groom')
  const brideMeta = getEntranceCueMeta(data, 'bride')

  const setTrackTitle = (type: 'groom' | 'bride', title: string) => {
    const audioKey = type === 'groom' ? 'groomAudio' : 'brideAudio'
    setData((prev) => {
      const audio = prev[audioKey]
      if (!audio) return prev
      return { ...prev, [audioKey]: { ...audio, trackTitle: title } }
    })
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
          [audioKey]: { ...analyzed, trackTitle: file.name },
          [markerKey]: nextMarker,
        }
      })
    } finally {
      setUploading(null)
    }
  }

  const handleDeliver = async () => {
    setDelivering(true)
    setDeliverError('')
    try {
      await deliverCueSheetToMc({ data })
      setDelivered(true)
      setTimeout(() => setDelivered(false), 4000)
    } catch (error) {
      setDeliverError(error instanceof Error ? error.message : '전송에 실패했습니다.')
    } finally {
      setDelivering(false)
    }
  }

  return (
    <ScreenLayout
      title="최종 큐시트"
      subtitle="인쇄하거나 사회자에게 이메일로 보내세요"
      onBack={onBack}
      contentClassName="pb-36"
      footer={
        <div className="space-y-2">
          <Btn onClick={() => window.print()}>인쇄</Btn>
          <Btn variant="secondary" onClick={handleDeliver} disabled={delivering || delivered}>
            {delivered ? '전송 완료' : delivering ? '전송 중…' : '사회자에게 전송'}
          </Btn>
          {deliverError && <p className="text-[12px] text-danger text-center">{deliverError}</p>}
          <p className="text-[11px] text-muted-text text-center leading-relaxed">
            이메일에는 음원 <strong>제목</strong>만 전달됩니다. 제목 보고 유튜브 등에서 찾아
            들으시면 됩니다.
          </p>
        </div>
      }
    >
      <Card className="p-4 mb-5 no-print">
        <p className="text-[14px] font-semibold mb-1">입장 음원 제목</p>
        <p className="text-[11px] text-muted-text mb-3 leading-relaxed">
          파일명과 곡 제목이 다르면 유튜브 검색용 제목을 수기로 입력해 주세요.
        </p>
        <div className="space-y-4">
          {(['groom', 'bride'] as const).map((type) => {
            const meta = type === 'groom' ? groomMeta : brideMeta
            const audio = type === 'groom' ? data.groomAudio : data.brideAudio
            const label = type === 'groom' ? '신랑' : '신부'
            const inputRef = type === 'groom' ? groomInputRef : brideInputRef
            return (
              <div key={type} className="space-y-2 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-medium">{label}</p>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading === type}
                    className="text-[13px] font-medium text-accent shrink-0"
                  >
                    {uploading === type ? '…' : audio ? '음원 변경' : '음원 업로드'}
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
                {audio ? (
                  <>
                    <Field
                      label="전달할 곡 제목"
                      placeholder="유튜브에서 검색할 곡 제목"
                      value={audio.trackTitle ?? audio.fileName}
                      onChange={(e) => setTrackTitle(type, e.target.value)}
                    />
                    <p className="text-[11px] text-muted-text truncate">파일: {audio.fileName}</p>
                    {meta && (
                      <p className="text-[12px] text-success font-medium">{meta.timingLabel}</p>
                    )}
                  </>
                ) : (
                  <p className="text-[12px] text-muted-text">미첨부</p>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <div className="print-document">
        <CueSheetDocument data={data} variant="mc" />
      </div>
    </ScreenLayout>
  )
}
