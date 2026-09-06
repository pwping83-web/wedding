import { useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import CueSheetDocument from '../components/CueSheetDocument'
import { deliverCueSheetToMc } from '../lib/deliverCueSheet'
import { shareCueSheetToKakao } from '../lib/shareCueSheet'
import type { AppData, SetData } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

export default function FinalOutput({ data, setData: _setData, onBack }: Props) {
  const [delivered, setDelivered] = useState(false)
  const [delivering, setDelivering] = useState(false)
  const [deliverError, setDeliverError] = useState('')
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared'>('idle')
  const [sharing, setSharing] = useState(false)
  const [shareError, setShareError] = useState('')

  const handleShareKakao = async () => {
    setSharing(true)
    setShareError('')
    setShareState('idle')
    try {
      const result = await shareCueSheetToKakao(data)
      setShareState(result)
      setTimeout(() => setShareState('idle'), 4000)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setShareError(error instanceof Error ? error.message : '공유에 실패했습니다.')
    } finally {
      setSharing(false)
    }
  }

  const shareLabel =
    shareState === 'shared'
      ? '전달 완료'
      : shareState === 'copied'
        ? '복사 완료 · 카톡에 붙여넣기'
        : sharing
          ? '준비 중…'
          : '카톡으로 전달'

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
      subtitle="인쇄하면 A4 2장 · 사회자용 2열 대본 형태로 출력됩니다"
      onBack={onBack}
      contentClassName="pb-36 print:px-0 print:pt-0 print:pb-0"
      footer={
        <div className="space-y-2">
          <Btn onClick={() => window.print()}>인쇄</Btn>
          <Btn variant="secondary" onClick={handleShareKakao} disabled={sharing}>
            {shareLabel}
          </Btn>
          <Btn variant="secondary" onClick={handleDeliver} disabled={delivering || delivered}>
            {delivered ? '전송 완료' : delivering ? '전송 중…' : '사회자에게 전송'}
          </Btn>
          {shareError && <p className="text-[12px] text-danger text-center">{shareError}</p>}
          {shareState === 'copied' && (
            <p className="text-[11px] text-muted-text text-center">
              큐시트 전문이 복사되었습니다. 카카오톡 채팅창에 붙여넣기 하세요.
            </p>
          )}
          {deliverError && <p className="text-[12px] text-danger text-center">{deliverError}</p>}
        </div>
      }
    >
      <div className="print-document">
        <CueSheetDocument data={data} variant="mc" />
      </div>
    </ScreenLayout>
  )
}
