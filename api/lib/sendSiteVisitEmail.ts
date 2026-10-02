import { getEmailConfig, sendEmailJsTemplate } from './sendCueSheetEmail'
import { getMcNotifyEmail, getResendConfig } from './sendMcRequestEmail'

export type SiteVisitInfo = {
  page: string
  path: string
  referrer: string
  userAgent: string
  at: string
  ipHint: string
}

export function isSiteVisitNotifyEnabled(env: Record<string, string | undefined>): boolean {
  const flag = env.SITE_VISIT_NOTIFY?.trim().toLowerCase()
  if (flag === 'false' || flag === '0' || flag === 'off') return false
  if (flag === 'true' || flag === '1' || flag === 'on') return true
  return env.VERCEL === '1'
}

export function getSiteVisitNotifyEmail(env: Record<string, string | undefined>): string {
  return env.SITE_VISIT_NOTIFY_EMAIL?.trim() || env.OWNER_EMAIL?.trim() || getMcNotifyEmail(env)
}

function buildSiteVisitText(info: SiteVisitInfo): string {
  return [
    '[ENX 웨딩 · MC] 홈페이지 방문',
    '',
    `페이지: ${info.page}`,
    `경로: ${info.path}`,
    `시각: ${info.at}`,
    `유입: ${info.referrer || '(직접/알 수 없음)'}`,
    `IP(프록시): ${info.ipHint || '(없음)'}`,
    '',
    'User-Agent:',
    info.userAgent || '(없음)',
  ].join('\n')
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildSiteVisitHtml(info: SiteVisitInfo): string {
  const text = buildSiteVisitText(info)
  return `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#222">${escapeHtml(text).replace(/\n/g, '<br/>')}</div>`
}

async function sendViaResend(
  env: Record<string, string | undefined>,
  info: SiteVisitInfo,
  notifyTo: string,
): Promise<void> {
  const resend = getResendConfig(env)
  if (!resend) throw new Error('Resend not configured')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resend.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: resend.from,
      to: [notifyTo],
      subject: '[ENX 큐시트] 홈페이지 방문',
      text: buildSiteVisitText(info),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || '방문 알림 메일 전송에 실패했습니다.')
  }
}

async function sendViaEmailJs(
  env: Record<string, string | undefined>,
  info: SiteVisitInfo,
  notifyTo: string,
): Promise<void> {
  const config = getEmailConfig(env)
  const templateId = env.EMAILJS_VISIT_TEMPLATE_ID?.trim()
  await sendEmailJsTemplate(
    config,
    {
      to_email: notifyTo,
      subject: '[ENX 큐시트] 홈페이지 방문',
      mc_cue_sheet: buildSiteVisitHtml(info),
    },
    templateId || undefined,
  )
}

export async function sendSiteVisitNotification(
  env: Record<string, string | undefined>,
  info: SiteVisitInfo,
): Promise<void> {
  if (!isSiteVisitNotifyEnabled(env)) return

  const notifyTo = getSiteVisitNotifyEmail(env)
  if (!notifyTo) return

  if (getResendConfig(env)) {
    await sendViaResend(env, info, notifyTo)
    return
  }

  await sendViaEmailJs(env, info, notifyTo)
}
