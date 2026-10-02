import { useCallback, useMemo, useState } from 'react'
import { youtubeThumbnailUrl } from '../config/marketing'
import { publicAssetUrl } from '../lib/publicAssetUrl'

interface Props {
  videoId: string
  title: string
  /** config MC_THUMB_URL / SAMPLE_THUMB_URL 등 (번들 URL 또는 /public 경로) */
  thumbUrl?: string
}

function resolveThumbInput(thumbUrl: string): string {
  const trimmed = thumbUrl.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/assets/') || trimmed.includes('/assets/')) return trimmed
  return publicAssetUrl(trimmed)
}

function youtubeThumbCandidates(videoId: string): string[] {
  if (!videoId.trim()) return []
  const id = videoId.trim()
  return [
    youtubeThumbnailUrl(id, 'max'),
    youtubeThumbnailUrl(id, 'hq'),
    `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${id}/sddefault.jpg`,
    `https://img.youtube.com/vi/${id}/default.jpg`,
  ]
}

export default function YouTubeLiteEmbed({ videoId, title, thumbUrl = '' }: Props) {
  const [active, setActive] = useState(false)
  const [thumbIndex, setThumbIndex] = useState(0)

  const thumbCandidates = useMemo(() => {
    const custom = resolveThumbInput(thumbUrl)
    const fromYoutube = youtubeThumbCandidates(videoId)
    if (custom) return [custom, ...fromYoutube.filter((u) => u !== custom)]
    return fromYoutube
  }, [thumbUrl, videoId])

  const thumb = thumbCandidates[thumbIndex] ?? ''
  const thumbFailed = thumbIndex >= thumbCandidates.length && thumbCandidates.length > 0

  const onThumbError = useCallback(() => {
    setThumbIndex((i) => i + 1)
  }, [])

  if (!videoId.trim()) {
    return (
      <div className="aspect-video w-full rounded-xl bg-muted-bg border border-border flex items-center justify-center px-4 text-center text-[13px] text-muted-text">
        영상 ID를 config/marketing.ts에 설정해 주세요.
      </div>
    )
  }

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/80 shadow-sm bg-muted-bg"
        aria-label={`${title} 재생`}
      >
        {thumb && !thumbFailed ? (
          <img
            src={thumb}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={onThumbError}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-[13px] text-muted-text">
            {title}
            <br />
            <span className="text-[12px] mt-1">탭하여 재생</span>
          </span>
        )}
        <span className="absolute inset-0 bg-charcoal/10" aria-hidden="true" />
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
