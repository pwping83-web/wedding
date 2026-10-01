import type { McRequestRecord } from './mcRequestStore'
import { getEmailConfig, sendEmailJsTemplate } from './sendCueSheetEmail'

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
    `연락처: ${record.phone}`,
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
  const subject = `[MC 상담] ${record.phone}`
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

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildMcRequestEmailHtml(record: McRequestRecord): string {
  const text = buildMcRequestEmailText(record)
  return `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#222">${escapeHtml(text).replace(/\n/g, '<br/>')}</div>`
}

/** 큐시트 수신과 같은 사회자 메일 우선 */
export function getMcNotifyEmail(env: Record<string, string | undefined>): string {
  return (
    env.MC_NOTIFY_EMAIL?.trim() ||
    env.MC_EMAIL?.trim() ||
    'tseizou@naver.com'
  )
}

export async function sendMcRequestNotificationViaEmailJs(
  env: Record<string, string | undefined>,
  record: McRequestRecord,
  notifyTo: string,
): Promise<void> {
  const config = getEmailConfig(env)
  const subject = `[MC 상담] ${record.phone}`
  const templateId = env.EMAILJS_MC_TEMPLATE_ID?.trim()
  await sendEmailJsTemplate(
    config,
    {
      to_email: notifyTo,
      subject,
      mc_cue_sheet: buildMcRequestEmailHtml(record),
    },
    templateId || undefined,
  )
}

/** Resend 키가 있으면 Resend, 없으면 큐시트와 동일한 EmailJS */
export async function sendMcRequestNotification(
  env: Record<string, string | undefined>,
  record: McRequestRecord,
): Promise<void> {
  const notifyTo = getMcNotifyEmail(env)
  const resend = getResendConfig(env)
  if (resend) {
    await sendMcRequestNotificationEmail(resend, record, notifyTo)
    return
  }
  await sendMcRequestNotificationViaEmailJs(env, record, notifyTo)
}
