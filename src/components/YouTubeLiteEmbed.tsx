import { useState } from 'react'
import { youtubeThumbnailUrl } from '../config/marketing'

interface Props {
  videoId: string
  title: string
  /** config MC_THUMB_URL / SAMPLE_THUMB_URL 등 */
  thumbUrl?: string
}

export default function YouTubeLiteEmbed({ videoId, title, thumbUrl = '' }: Props) {
  const [active, setActive] = useState(false)

  if (!videoId.trim()) {
    return (
      <div className="aspect-video w-full rounded-xl bg-muted-bg border border-border flex items-center justify-center px-4 text-center text-[13px] text-muted-text">
        영상 ID를 config/marketing.ts에 설정해 주세요.
      </div>
    )
  }

  const thumb =
    thumbUrl.trim() || youtubeThumbnailUrl(videoId, 'hq')

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/80 shadow-sm bg-charcoal"
        aria-label={`${title} 재생`}
      >
        <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <span className="absolute inset-0 bg-charcoal/15" aria-hidden="true" />
        <span
          className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-white/95 text-charcoal text-base flex items-center justify-center shadow-md"
          aria-hidden="true"
        >
          ▶
        </span>
      </button>
    )
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden border border-border/80 bg-black">
      <iframe
        title={title}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}
