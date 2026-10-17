import YouTubeLiteEmbed from './YouTubeLiteEmbed'
import { MC_PROGRESS_VIDEOS, MC_THUMB_URL } from '../config/marketing'

interface Props {
  className?: string
}

export default function McProgressVideos({ className = 'space-y-4' }: Props) {
  return (
    <div className={className}>
      {MC_PROGRESS_VIDEOS.map((video, index) => (
        <div key={video.id} className="space-y-2">
          {video.label ? (
            <p className="text-[14px] font-semibold text-charcoal text-center [word-break:keep-all]">
              {video.label}
            </p>
          ) : null}
          <YouTubeLiteEmbed
            videoId={video.id}
            title={video.title ?? video.label ?? 'MC 진행 영상'}
            thumbUrl={video.thumbUrl ?? (index === 0 ? MC_THUMB_URL : '')}
          />
        </div>
      ))}
    </div>
  )
}
