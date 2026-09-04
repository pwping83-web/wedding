import type { AppData } from '../data'
import { moodLabels } from '../data'
import { buildCueSheetEmailSubject } from './buildCueSheetEmailHtml'
import { buildCueSheetPlainText } from './cueSheetUtils'

export const MC_EMAIL = 'tseizou@naver.com'

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
  const cueSheet = buildCueSheetPlainText(data, 'mc')
  const subject = buildCueSheetEmailSubject(data)

  const groomAudio = data.groomAudio?.fileName ?? '없음'
  const brideAudio = data.brideAudio?.fileName ?? '없음'
  const groomTiming = data.groomMarkers[0]
    ? `신랑 ${data.groomMarkers[0].time}초 후 입장`
    : '미설정'
  const brideTiming = data.brideMarkers[0]
    ? `신부 ${data.brideMarkers[0].time}초 후 입장`
    : '미설정'

  const response = await fetch('/api/send-cue-sheet', {
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

  const result = (await response.json()) as { error?: string }
  if (!response.ok) {
    throw new Error(result.error || '이메일 전송에 실패했습니다.')
  }
}
