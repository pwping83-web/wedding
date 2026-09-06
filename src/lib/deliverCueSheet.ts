import type { AppData } from '../data'
import { moodLabels } from '../data'
import { ENTRANCE_AUDIO_TIMING_ENABLED } from '../config/features'
import { buildCueSheetEmailHtml, buildCueSheetEmailSubject } from './buildCueSheetEmailHtml'
import { getEntranceAudioTitle } from './cueSheetUtils'

export const MC_EMAIL = 'tseizou@naver.com'

function apiUrl() {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}api/send-cue-sheet`.replace(/([^:]\/)\/+/g, '$1')
}

function formatDateLabel(date: string): string {
  if (!date) return '날짜 미정'
  return new Date(`${date}T00:00:00`).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

type DeliveryPayload = {
  data: AppData
}

export async function deliverCueSheetToMc({ data }: DeliveryPayload): Promise<void> {
  const cueSheet = buildCueSheetEmailHtml(data)
  const subject = buildCueSheetEmailSubject(data)

  const groomAudio = ENTRANCE_AUDIO_TIMING_ENABLED ? getEntranceAudioTitle(data.groomAudio) : '-'
  const brideAudio = ENTRANCE_AUDIO_TIMING_ENABLED ? getEntranceAudioTitle(data.brideAudio) : '-'
  const groomTiming =
    ENTRANCE_AUDIO_TIMING_ENABLED && data.groomMarkers[0]
      ? `신랑 ${data.groomMarkers[0].time}초 후 입장`
      : '-'
  const brideTiming =
    ENTRANCE_AUDIO_TIMING_ENABLED && data.brideMarkers[0]
      ? `신부 ${data.brideMarkers[0].time}초 후 입장`
      : '-'

  const response = await fetch(apiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mcEmail: MC_EMAIL,
      subject,
      groomName: data.groomName || '신랑',
      brideName: data.brideName || '신부',
      ceremonyDate: formatDateLabel(data.date),
      ceremonyTime: data.time || '시간 미정',
      venue: data.venue || '장소 미정',
      moodLabel: moodLabels[data.mood],
      cueSheet,
      groomAudio,
      brideAudio,
      groomTiming,
      brideTiming,
    }),
  })

  const raw = await response.text()
  let result: { error?: string; ok?: boolean } = {}
  try {
    result = raw ? (JSON.parse(raw) as { error?: string; ok?: boolean }) : {}
  } catch {
    throw new Error(
      response.ok
        ? '서버 응답을 처리하지 못했습니다.'
        : `서버 오류(${response.status}). Vercel 배포·EmailJS 설정을 확인해 주세요.`,
    )
  }

  if (!response.ok) {
    throw new Error(result.error || `이메일 전송에 실패했습니다. (${response.status})`)
  }
}
