import YouTubeLiteEmbed from './YouTubeLiteEmbed'
import { MC_PROGRESS_VIDEOS, MC_THUMB_URL } from '../config/marketing'

interface Props {
  className?: string
}

export default function McProgressVideos({ className = 'space-y-4' }: Props) {
  return (
    <div className={className}>
      {MC_PROGRESS_VIDEOS.map((video, index) => (
        <YouTubeLiteEmbed
          key={video.id}
          videoId={video.id}
          title={
            video.title ??
            (MC_PROGRESS_VIDEOS.length > 1 ? `MC 진행 영상 ${index + 1}` : 'MC 진행 영상')
          }
          thumbUrl={video.thumbUrl ?? (index === 0 ? MC_THUMB_URL : '')}
        />
      ))}
    </div>
  )
}
