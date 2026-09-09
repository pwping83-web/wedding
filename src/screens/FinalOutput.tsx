import { useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import DeliverySuccessModal from '../components/mobile/DeliverySuccessModal'
import CueSheetDocument from '../components/CueSheetDocument'
import { deliverCueSheetToMc } from '../lib/deliverCueSheet'
import { openCueSheetPrintPage } from '../lib/openCueSheetPrintPage'
import type { AppData, SetData } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

export default function FinalOutput({ data, setData: _setData, onBack }: Props) {
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [delivering, setDelivering] = useState(false)
  const [deliverError, setDeliverError] = useState('')
  const [printError, setPrintError] = useState('')

  const handlePrint = () => {
    setPrintError('')
    try {
      openCueSheetPrintPage(data)
    } catch (error) {
      setPrintError(error instanceof Error ? error.message : 'PDF 저장 화면을 열지 못했습니다.')
    }
  }

  const handleDeliver = async () => {
    setDelivering(true)
    setDeliverError('')
    try {
      await deliverCueSheetToMc({ data })
      setShowSuccessModal(true)
    } catch (error) {
      setDeliverError(error instanceof Error ? error.message : '전송에 실패했습니다.')
    } finally {
      setDelivering(false)
    }
  }

  return (
    <>
      <ScreenLayout
        title="최종 큐시트"
        subtitle="인쇄하면 A4 2장 · 사회자용 2열 대본 형태로 출력됩니다"
        onBack={onBack}
        contentClassName="pb-36 print:px-0 print:pt-0 print:pb-0"
        footer={
          <div className="space-y-2">
            <Btn onClick={handlePrint}>인쇄 · PDF 로 저장</Btn>
            <Btn variant="secondary" onClick={handleDeliver} disabled={delivering || showSuccessModal}>
              {delivering ? '전송 중…' : '사회자에게 전송'}
            </Btn>
            {printError && <p className="text-[12px] text-danger text-center">{printError}</p>}
            {deliverError && <p className="text-[12px] text-danger text-center">{deliverError}</p>}
          </div>
        }
      >
        <div className="print-document">
          <CueSheetDocument data={data} variant="mc" />
        </div>
      </ScreenLayout>

      <DeliverySuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        groomName={data.groomName}
        brideName={data.brideName}
      />
    </>
  )
}
