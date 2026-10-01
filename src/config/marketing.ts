/**
 * MC · 식전영상 마케팅 설정 — 값만 바꿔서 배포하면 됩니다.
 */

/** MC 진행 영상 (유튜브 ID만, URL 전체 아님) */
export const MC_VIDEO_ID = 'RFbaB4_rDmE'

/** 식전영상 샘플 (일부공개 업로드 권장) */
export const SAMPLE_VIDEO_ID = 'NuWvnTwHQ-s'

/** 식순 완성·/mc 페이지에 표시할 가격 문구 */
export const MC_PRICE_TEXT = '수도권 15만 원'

/** 사진·문의 수신 · 알림 수신 운영자 메일 */
export const OWNER_EMAIL = 'tseizou@naver.com'

/** 샘플 영상 안내 (랜딩·/video) */
export const SAMPLE_VIDEO_DISCLAIMER = '샘플 영상 · AI로 생성한 가상 인물입니다'

export function youtubeWatchUrl(videoId: string): string {
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : ''
}

export function youtubeThumbnailUrl(videoId: string, quality: 'hq' | 'max' = 'hq'): string {
  if (!videoId) return ''
  const file = quality === 'max' ? 'maxresdefault.jpg' : 'hqdefault.jpg'
  return `https://img.youtube.com/vi/${videoId}/${file}`
}
