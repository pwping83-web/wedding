import { useMemo, useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import YouTubeLiteEmbed from '../components/YouTubeLiteEmbed'
import McInquiryForm from '../components/McInquiryForm'
import McInquirySuccessModal from '../components/McInquirySuccessModal'
import { MC_THUMB_URL, MC_VIDEO_ID } from '../config/marketing'
import { mcPagePackageLine, mcPageRegionLine } from '../config/marketingCopy'
import { loadMcInquiryPrefill } from '../lib/mcInquiryPrefill'
import { goToMarketing } from '../lib/marketingRoutes'

export default function McPage() {
  const prefill = useMemo(() => loadMcInquiryPrefill(), [])
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  return (
    <ScreenLayout
      title="ENX 웨딩 · MC"
      subtitle="식순 작성부터 본식 진행까지"
      onBack={() => goToMarketing('home')}
      contentClassName="pb-8"
      footer={
        <Btn variant="secondary" onClick={() => goToMarketing('home')}>
          식순 만들기로 돌아가기
        </Btn>
      }
    >
      <div className="space-y-6">
        <YouTubeLiteEmbed videoId={MC_VIDEO_ID} title="MC 진행 영상" thumbUrl={MC_THUMB_URL} />

        <div className="landing-card space-y-1 text-[14px] text-charcoal leading-relaxed text-center">
          <p className="font-semibold">{mcPageRegionLine}</p>
          <p>{mcPagePackageLine}</p>
        </div>

        <McInquiryForm prefill={prefill} onSuccess={() => setShowSuccessModal(true)} />
      </div>

      <McInquirySuccessModal open={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </ScreenLayout>
  )
}
