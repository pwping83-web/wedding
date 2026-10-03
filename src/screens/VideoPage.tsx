import { useEffect } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import YouTubeLiteEmbed from '../components/YouTubeLiteEmbed'
import VideoAccessGate from '../components/VideoAccessGate'
import { SAMPLE_THUMB_URL, SAMPLE_VIDEO_ID } from '../config/marketing'
import { videoPageLead, videoPageSub } from '../config/marketingCopy'
import { goToMarketing } from '../lib/marketingRoutes'
import { clearVideoAccess } from '../lib/videoAccess'
import { SEO_TITLE } from '../config/siteSeo'

export default function VideoPage() {
  useEffect(() => {
    clearVideoAccess()
    const prev = document.title
    document.title = `식전영상 무료 제작 | ${SEO_TITLE.split('|')[0].trim()}`
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <ScreenLayout
      title="식전영상 무료 제작"
      subtitle={videoPageSub}
      onBack={() => goToMarketing('home')}
      contentClassName="pb-8"
      footer={
        <div className="space-y-3">
          <Btn variant="secondary" onClick={() => goToMarketing('mc')}>
            MC 상담 신청하기
          </Btn>
          <button
            type="button"
            onClick={() => goToMarketing('home')}
            className="w-full text-[13px] text-muted-text underline-offset-2 hover:text-charcoal hover:underline"
          >
            식순 만들기로 돌아가기
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <YouTubeLiteEmbed
          videoId={SAMPLE_VIDEO_ID}
          title="식전영상 샘플"
          thumbUrl={SAMPLE_THUMB_URL}
        />
        <p className="text-[15px] font-medium text-charcoal text-center leading-relaxed">{videoPageLead}</p>

        <VideoAccessGate />
      </div>
    </ScreenLayout>
  )
}
