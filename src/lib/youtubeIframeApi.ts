export type YoutubePlayerInstance = {
  unMute: () => void
  setVolume: (volume: number) => void
  destroy: () => void
}

type YtPlayerCtor = new (
  elementId: string,
  options: {
    videoId: string
    playerVars?: Record<string, string | number>
    events?: { onReady?: (event: { target: YoutubePlayerInstance }) => void }
  },
) => YoutubePlayerInstance

declare global {
  interface Window {
    YT?: { Player: YtPlayerCtor }
    onYouTubeIframeAPIReady?: () => void
  }
}

let loadPromise: Promise<void> | null = null

export function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()

  if (!loadPromise) {
    loadPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve()
      }

      if (document.querySelector('script[data-youtube-iframe-api]')) {
        if (window.YT?.Player) resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.dataset.youtubeIframeApi = '1'
      document.head.appendChild(script)
    })
  }

  return loadPromise
}

export function createYouTubePlayer(
  elementId: string,
  videoId: string,
  onReady: (player: YoutubePlayerInstance) => void,
): YoutubePlayerInstance | null {
  const Player = window.YT?.Player
  if (!Player) return null

  const origin =
    typeof window !== 'undefined' && window.location.origin ? window.location.origin : ''

  return new Player(elementId, {
    videoId,
    playerVars: {
      autoplay: 1,
      rel: 0,
      playsinline: 1,
      mute: 0,
      ...(origin ? { origin } : {}),
    },
    events: {
      onReady: (event) => onReady(event.target),
    },
  })
}
