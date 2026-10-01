import { useMemo, useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import YouTubeLiteEmbed from '../components/YouTubeLiteEmbed'
import McInquiryForm from '../components/McInquiryForm'
import McInquirySuccess from '../components/McInquirySuccess'
import { MC_PRICE_TEXT, MC_THUMB_URL, MC_VIDEO_ID } from '../config/marketing'
import { mcPageBenefitTitle } from '../config/marketingCopy'
import { hasMcInquiryPrefill, loadMcInquiryPrefill } from '../lib/mcInquiryPrefill'
import { goToMarketing } from '../lib/marketingRoutes'

export default function McPage() {
  const prefill = useMemo(() => loadMcInquiryPrefill(), [])
  const showPrefill = hasMcInquiryPrefill(prefill)
  const [submitted, setSubmitted] = useState<{ wantsPreweddingVideo: boolean } | null>(null)

  return (
    <ScreenLayout
      title="ENX 웨딩 · MC"
      subtitle="식순 작성부터 본식 진행까지"
      onBack={() => goToMarketing('home')}
      contentClassName="pb-8"
      footer={
        submitted ? null : (
          <Btn variant="secondary" onClick={() => goToMarketing('home')}>
            식순 만들기로 돌아가기
          </Btn>
        )
      }
    >
      <div className="space-y-6">
        {!submitted && (
          <>
            <YouTubeLiteEmbed videoId={MC_VIDEO_ID} title="MC 진행 영상" thumbUrl={MC_THUMB_URL} />

            <div className="landing-card space-y-2 text-[14px] text-charcoal leading-relaxed">
              <p className="font-semibold">{MC_PRICE_TEXT}</p>
              <p>식순 작성 → 리허설 → 본식 진행을 한 분이 맡습니다.</p>
            </div>

            <div className="p-4 rounded-xl border border-accent/25 bg-accent-soft/40">
              <p className="text-[14px] font-semibold text-accent">{mcPageBenefitTitle}</p>
            </div>

            {showPrefill && prefill && (
              <div className="landing-card space-y-2 text-[14px] text-charcoal">
                <p className="text-[13px] font-semibold text-charcoal">식순에서 불러온 정보</p>
                <p>
                  {prefill.groomName || '신랑'} · {prefill.brideName || '신부'}
                </p>
                {(prefill.date || prefill.time) && (
                  <p className="text-muted-text">
                    {[prefill.date, prefill.time].filter(Boolean).join(' ')}
                  </p>
                )}
                {prefill.venue && <p className="text-muted-text">{prefill.venue}</p>}
              </div>
            )}
          </>
        )}

        {submitted ? (
          <McInquirySuccess wantsPreweddingVideo={submitted.wantsPreweddingVideo} />
        ) : (
          <McInquiryForm prefill={prefill} onSuccess={setSubmitted} />
        )}
      </div>
    </ScreenLayout>
  )
}
