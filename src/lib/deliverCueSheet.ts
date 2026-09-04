import type { AppData } from '../data'
import { buildCueSheetPlainText } from './cueSheetUtils'

type DeliveryPayload = {
  mcEmail: string
  data: AppData
}

export async function deliverCueSheetToMc({ mcEmail, data }: DeliveryPayload): Promise<void> {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID

  if (!publicKey || !templateId) {
    throw new Error('EmailJS 설정(VITE_EMAILJS_PUBLIC_KEY, VITE_EMAILJS_TEMPLATE_ID)이 필요합니다.')
  }

  if (!serviceId) {
    throw new Error(
      'EmailJS 서비스 ID(VITE_EMAILJS_SERVICE_ID)를 .env.local에 추가해 주세요.',
    )
  }

  const cueSheet = buildCueSheetPlainText(data, 'mc')

  const groomAudio = data.groomAudio?.fileName ?? '없음'
  const brideAudio = data.brideAudio?.fileName ?? '없음'
  const groomTiming = data.groomMarkers[0]
    ? `신랑 ${data.groomMarkers[0].time}초 후 입장`
    : '미설정'
  const brideTiming = data.brideMarkers[0]
    ? `신부 ${data.brideMarkers[0].time}초 후 입장`
    : '미설정'

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lib_version: '4.4.1',
      user_id: publicKey,
      service_id: serviceId,
      template_id: templateId,
      template_params: {
        to_email: mcEmail,
        mc_email: mcEmail,
        groom_name: data.groomName || '신랑',
        bride_name: data.brideName || '신부',
        ceremony_date: data.date || '',
        ceremony_time: data.time || '',
        venue: data.venue || '',
        mc_cue_sheet: cueSheet,
        groom_audio: groomAudio,
        bride_audio: brideAudio,
        groom_timing: groomTiming,
        bride_timing: brideTiming,
        message: cueSheet,
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || '이메일 전송에 실패했습니다.')
  }
}
