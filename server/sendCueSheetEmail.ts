type EmailConfig = {
  publicKey: string
  privateKey: string
  serviceId: string
  templateId: string
}

export type SendCueSheetPayload = {
  mcEmail: string
  groomName: string
  brideName: string
  ceremonyDate: string
  ceremonyTime: string
  venue: string
  cueSheet: string
  groomAudio: string
  brideAudio: string
  groomTiming: string
  brideTiming: string
}

export function getEmailConfig(env: Record<string, string | undefined>): EmailConfig {
  const publicKey = env.EMAILJS_PUBLIC_KEY ?? env.VITE_EMAILJS_PUBLIC_KEY
  const privateKey = env.EMAILJS_PRIVATE_KEY
  const serviceId = env.EMAILJS_SERVICE_ID ?? env.VITE_EMAILJS_SERVICE_ID
  const templateId = env.EMAILJS_TEMPLATE_ID ?? env.VITE_EMAILJS_TEMPLATE_ID

  if (!publicKey || !templateId) {
    throw new Error('EmailJS 설정(EMAILJS_PUBLIC_KEY, EMAILJS_TEMPLATE_ID)이 필요합니다.')
  }

  if (!privateKey) {
    throw new Error('EmailJS Private Key(EMAILJS_PRIVATE_KEY)가 필요합니다.')
  }

  if (!serviceId) {
    throw new Error(
      'EmailJS 서비스 ID(EMAILJS_SERVICE_ID)가 필요합니다. EmailJS 대시보드 → Email Services에서 확인하세요.',
    )
  }

  return { publicKey, privateKey, serviceId, templateId }
}

export async function sendCueSheetEmail(
  config: EmailConfig,
  payload: SendCueSheetPayload,
): Promise<void> {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lib_version: '4.4.1',
      user_id: config.publicKey,
      accessToken: config.privateKey,
      service_id: config.serviceId,
      template_id: config.templateId,
      template_params: {
        to_email: payload.mcEmail,
        mc_email: payload.mcEmail,
        groom_name: payload.groomName,
        bride_name: payload.brideName,
        ceremony_date: payload.ceremonyDate,
        ceremony_time: payload.ceremonyTime,
        venue: payload.venue,
        mc_cue_sheet: payload.cueSheet,
        groom_audio: payload.groomAudio,
        bride_audio: payload.brideAudio,
        groom_timing: payload.groomTiming,
        bride_timing: payload.brideTiming,
        message: payload.cueSheet,
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || '이메일 전송에 실패했습니다.')
  }
}
