import { getEmailConfig, sendEmailJsTemplate } from './sendCueSheetEmail'
import { getMcNotifyEmail } from './sendMcRequestEmail'
import type { VideoTextRecord } from './videoTextStore'

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function formatPayloadLines(payload: Record<string, string>): string {
  return Object.entries(payload)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
}

function buildAdminEmailHtml(record: VideoTextRecord): string {
  const lines = formatPayloadLines(record.textPayload)
  return `<div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#222">
<p><strong>[식전영상 글귀 저장]</strong></p>
<p>신랑·신부: ${escapeHtml(record.groomName)} · ${escapeHtml(record.brideName)}</p>
<p>고객 이메일: ${escapeHtml(record.contactEmail)}</p>
<p>접수 ID: ${escapeHtml(record.id)}</p>
<hr/>
<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(lines)}</pre>
<p style="color:#666;font-size:12px">관리자 페이지에서 전체 글귀를 확인하세요.</p>
</div>`
}

export async function sendVideoTextSavedNotification(
  env: Record<string, string | undefined>,
  record: VideoTextRecord,
): Promise<void> {
  const config = getEmailConfig(env)
  const notifyTo = getMcNotifyEmail(env)
  const subject = `[식전영상 글귀] ${record.groomName} · ${record.brideName}`

  await sendEmailJsTemplate(config, {
    to_email: notifyTo,
    subject,
    mc_cue_sheet: buildAdminEmailHtml(record),
  })
}
