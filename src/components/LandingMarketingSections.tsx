import Btn from './mobile/Btn'
import YouTubeLiteEmbed from './YouTubeLiteEmbed'
import {
  MC_VIDEO_ID,
  SAMPLE_VIDEO_DISCLAIMER,
  SAMPLE_VIDEO_ID,
} from '../config/marketing'
import { landingMcSectionTitle, landingVideoSectionTitle } from '../config/marketingCopy'
import { goToMarketing } from '../lib/marketingRoutes'

export default function LandingMarketingSections() {
  return (
    <div className="landing-content w-full max-w-[340px] mx-auto px-5 pb-14 space-y-10 text-left">
      <section className="landing-card space-y-4">
        <h2 className="text-[17px] font-semibold text-charcoal leading-snug text-center">
          {landingMcSectionTitle}
        </h2>
        <YouTubeLiteEmbed videoId={MC_VIDEO_ID} title="MC 진행 영상" />
        <Btn variant="secondary" onClick={() => goToMarketing('mc')}>
          MC 소개 보기
        </Btn>
      </section>

      <section className="landing-card space-y-4">
        <h2 className="text-[17px] font-semibold text-charcoal leading-snug text-center">
          {landingVideoSectionTitle}
        </h2>
        <YouTubeLiteEmbed videoId={SAMPLE_VIDEO_ID} title="식전영상 샘플" />
        <p className="text-[11px] text-muted-text text-center leading-relaxed">
          {SAMPLE_VIDEO_DISCLAIMER}
        </p>
        <Btn variant="secondary" onClick={() => goToMarketing('video')}>
          자세히 보기
        </Btn>
      </section>
    </div>
  )
}
