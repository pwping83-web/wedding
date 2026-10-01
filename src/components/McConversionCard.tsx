import Btn from './mobile/Btn'
import YouTubeLiteEmbed from './YouTubeLiteEmbed'
import { MC_PRICE_TEXT, MC_VIDEO_ID } from '../config/marketing'
import {
  outputMcCardBody,
  outputMcCardSub,
  outputMcCardTitle,
} from '../config/marketingCopy'
import type { AppData } from '../data'
import { saveMcInquiryPrefill } from '../lib/mcInquiryPrefill'
import { goToMarketing } from '../lib/marketingRoutes'

interface Props {
  data: AppData
}

export default function McConversionCard({ data }: Props) {
  const handleMcInquiry = () => {
    saveMcInquiryPrefill(data)
    goToMarketing('mc')
  }

  return (
    <div className="no-print mt-4 p-4 rounded-2xl border border-rose-gold/30 bg-gradient-to-b from-white/90 to-blush/30 shadow-sm text-left space-y-4">
      <div>
        <h2 className="text-[16px] font-semibold text-charcoal leading-snug">{outputMcCardTitle}</h2>
        <p className="text-[13px] text-charcoal/85 leading-relaxed mt-2">{outputMcCardBody}</p>
        <p className="text-[14px] font-semibold text-accent mt-2">{MC_PRICE_TEXT}</p>
        <p className="text-[12px] text-muted-text mt-2 leading-relaxed">{outputMcCardSub}</p>
      </div>

      <YouTubeLiteEmbed videoId={MC_VIDEO_ID} title="MC 진행 영상" />

      <div className="space-y-2">
        <Btn onClick={handleMcInquiry}>MC 상담 신청</Btn>
        <Btn variant="secondary" onClick={() => goToMarketing('video')}>
          식전영상 샘플 보기
        </Btn>
      </div>
    </div>
  )
}
