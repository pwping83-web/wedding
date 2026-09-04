import type { AppData } from '../data'
import { buildCueSheetPlainText } from './cueSheetUtils'

type DeliveryPayload = {
  mcEmail: string
  data: AppData
}

export async function deliverCueSheetToMc({ mcEmail, data }: DeliveryPayload): Promise<void> {
  const cueSheet = buildCueSheetPlainText(data, 'mc')

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
      mcEmail,
      groomName: data.groomName || '신랑',
      brideName: data.brideName || '신부',
      ceremonyDate: data.date || '',
      ceremonyTime: data.time || '',
      venue: data.venue || '',
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
