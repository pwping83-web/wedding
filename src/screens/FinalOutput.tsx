import { useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import CueSheetDocument from '../components/CueSheetDocument'
import { deliverCueSheetToMc } from '../lib/deliverCueSheet'
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
      subtitle="인쇄하면 사회자용 2열 대본 형태로 출력됩니다"
      onBack={onBack}
      contentClassName="pb-36"
      footer={
        <div className="space-y-2">
          <Btn onClick={() => window.print()}>인쇄</Btn>
          <Btn variant="secondary" onClick={handleDeliver} disabled={delivering || delivered}>
            {delivered ? '전송 완료' : delivering ? '전송 중…' : '사회자에게 전송'}
          </Btn>
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
