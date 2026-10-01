import type { McRequestRecord } from './mcRequestStore'

export type ResendConfig = {
  apiKey: string
  from: string
}

export function getResendConfig(env: Record<string, string | undefined>): ResendConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim()
  if (!apiKey) return null
  const from = env.RESEND_FROM?.trim() || 'ENX Wedding MC <onboarding@resend.dev>'
  return { apiKey, from }
}

function buildMcRequestEmailText(record: McRequestRecord): string {
  const lines = [
    '[MC 상담 신청]',
    '',
    `신랑: ${record.groomName}`,
    `신부: ${record.brideName}`,
    `예식일: ${record.ceremonyDate || '-'} ${record.ceremonyTime || ''}`.trim(),
    `예식장: ${record.venue}`,
    `연락처: ${record.phone}`,
    `이메일: ${record.email}`,
    `식전영상 신청: ${record.wantsPreweddingVideo ? '예' : '아니오'}`,
    '',
    '문의 내용:',
    record.message || '(없음)',
    '',
    `접수 ID: ${record.id}`,
    `접수 시각: ${record.createdAt}`,
  ]
  return lines.join('\n')
}

export async function sendMcRequestNotificationEmail(
  config: ResendConfig,
  record: McRequestRecord,
  notifyTo: string,
): Promise<void> {
  const subject = `[MC 상담] ${record.groomName} · ${record.brideName}`
  const text = buildMcRequestEmailText(record)

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.from,
      to: [notifyTo],
      subject,
      text,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || '운영자 알림 메일 전송에 실패했습니다.')
  }
}
