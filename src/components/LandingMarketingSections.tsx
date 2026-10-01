import Btn from './mobile/Btn'
import YouTubeLiteEmbed from './YouTubeLiteEmbed'
import { MC_THUMB_URL, MC_VIDEO_ID, SAMPLE_THUMB_URL, SAMPLE_VIDEO_ID } from '../config/marketing'
import {
  landingMcBenefitLine,
  landingVideoBenefitLine,
  landingVideoSectionTitle,
} from '../config/marketingCopy'
import { goToMarketing } from '../lib/marketingRoutes'

const sectionTitleClass =
  'text-[17px] font-semibold text-charcoal leading-snug text-center [word-break:keep-all]'

export default function LandingMarketingSections() {
  return (
    <div
      id="landing-marketing"
      className="landing-content w-full max-w-[340px] mx-auto px-5 pb-14 pt-2 space-y-10 text-left scroll-mt-4"
    >
      <section className="landing-card space-y-4">
        <h2 className={sectionTitleClass}>
          식순을 만든 MC가
          <br />
          직접 진행합니다
        </h2>
        <YouTubeLiteEmbed
          videoId={MC_VIDEO_ID}
          title="MC 진행 영상"
          thumbUrl={MC_THUMB_URL}
        />
        <p className="text-[13px] text-charcoal/90 text-center leading-relaxed [word-break:keep-all]">
          {landingMcBenefitLine}
        </p>
        <Btn variant="secondary" onClick={() => goToMarketing('mc')}>
          MC 소개 보기
        </Btn>
      </section>

      <section className="landing-card space-y-4">
        <h2 className={sectionTitleClass}>{landingVideoSectionTitle}</h2>
        <YouTubeLiteEmbed
          videoId={SAMPLE_VIDEO_ID}
          title="식전영상 샘플"
          thumbUrl={SAMPLE_THUMB_URL}
        />
        <p className="text-[13px] text-charcoal/90 text-center leading-relaxed [word-break:keep-all]">
          {landingVideoBenefitLine}
        </p>
        <Btn variant="secondary" onClick={() => goToMarketing('video')}>
          자세히 보기
        </Btn>
      </section>
    </div>
  )
}
