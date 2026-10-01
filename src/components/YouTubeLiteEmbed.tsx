import { useState } from 'react'
import { youtubeThumbnailUrl } from '../config/marketing'

interface Props {
  videoId: string
  title: string
}

export default function YouTubeLiteEmbed({ videoId, title }: Props) {
  const [active, setActive] = useState(false)

  if (!videoId.trim()) {
    return (
      <div className="aspect-video w-full rounded-xl bg-muted-bg border border-border flex items-center justify-center px-4 text-center text-[13px] text-muted-text">
        영상 ID를 config/marketing.ts에 설정해 주세요.
      </div>
    )
  }

  if (!active) {
    const thumb = youtubeThumbnailUrl(videoId)
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/80 shadow-sm"
        aria-label={`${title} 재생`}
      >
        <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <span className="absolute inset-0 bg-charcoal/25" aria-hidden="true" />
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/95 text-charcoal text-lg flex items-center justify-center shadow-md"
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
