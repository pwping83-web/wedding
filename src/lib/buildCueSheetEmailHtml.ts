import type { AppData } from '../data'
import { moodLabels } from '../data'
import { buildCueSheetDisplayRows } from './cueSheetRows'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const CUE_PATTERN = /(\([^)]*\)|\[[^\]]*\])/g
const EMPHASIS_PATTERN =
  /(배경\s*음악|박\s*수|맞\s*절|박\s*전|환\s*호|음\s*악\s*주세요|큰\s*박\s*수|따뜻한\s*박\s*수)/g

function preserveLineBreaks(value: string): string {
  return value.replace(/\n/g, '<br/>')
}

function formatScriptHtml(script: string): string {
  return preserveLineBreaks(escapeHtml(script))
    .replace(CUE_PATTERN, '<span style="color:#C45C5C;font-weight:700;">$1</span>')
    .replace(EMPHASIS_PATTERN, '<span style="color:#1F5FA8;font-weight:700;">$1</span>')
}

function formatDateLabel(date: string): string {
  if (!date) return ''
  return new Date(`${date}T00:00:00`).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export function buildCueSheetEmailSubject(data: AppData): string {
  const groom = data.groomName || '신랑'
  const bride = data.brideName || '신부'
  const date = data.date ? formatDateLabel(data.date) : ''
  return `[웨딩 큐시트] ${groom} · ${bride}${date ? ` — ${date}` : ''}`
}

export function buildCueSheetEmailHtml(data: AppData): string {
  const groom = escapeHtml(data.groomName || '신랑')
  const bride = escapeHtml(data.brideName || '신부')
  const dateLabel = escapeHtml(formatDateLabel(data.date))
  const timeLabel = escapeHtml(data.time || '')
  const venueLabel = escapeHtml(data.venue || '예식장')
  const moodLabel = escapeHtml(moodLabels[data.mood])
  const rows = buildCueSheetDisplayRows(data, 'mc')

  const orderHtml = rows
    .map((row) => {
      return `
      <tr>
        <td style="width:9%;padding:4px 5px;border-top:1px dotted #444;border-bottom:1px dotted #444;border-right:1px dotted #444;background:#FAFAFA;text-align:center;vertical-align:top;">
          <div style="font-size:9px;font-weight:700;line-height:1.35;color:#111;white-space:pre-line;">${preserveLineBreaks(escapeHtml(row.labelMain))}</div>
          ${row.labelSub ? `<div style="margin-top:2px;font-size:8px;font-weight:700;color:#111;">${escapeHtml(row.labelSub)}</div>` : ''}
        </td>
        <td style="width:91%;padding:4px 7px;border-top:1px dotted #444;border-bottom:1px dotted #444;vertical-align:top;">
          ${
            row.personNote
              ? `<div style="margin:0 0 5px;padding-bottom:4px;border-bottom:1px dotted #D8D8D8;font-size:10px;line-height:1.45;color:#7B6FA8;">${escapeHtml(row.personNote)}</div>`
              : ''
          }
          <div style="font-size:11px;line-height:1.55;color:#222;word-break:keep-all;">${formatScriptHtml(row.script)}</div>
        </td>
      </tr>
      ${
        row.labelMain === '신부 입장'
          ? '<tr><td colspan="2" style="padding:0;border:0;height:0;page-break-after:always;"></td></tr>'
          : ''
      }`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>웨딩 큐시트</title>
</head>
<body style="margin:0;padding:0;background:#FFFFFF;font-family:'Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif;color:#1A1A1A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;padding:0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:760px;background:#FFFFFF;border-left:2px solid #173F9F;border-right:2px solid #173F9F;border-collapse:collapse;">
          <tr>
            <td style="padding:12px 10px 10px;text-align:center;border-bottom:2px solid #173F9F;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#7B6FA8;letter-spacing:0.1em;">WEDDING CEREMONY CUE SHEET</p>
              <h1 style="margin:0 0 6px;font-size:16px;font-weight:700;color:#1A1A1A;line-height:1.35;">
                ${groom} · ${bride} 결혼 예식 — 사회자 큐시트
              </h1>
              <p style="margin:0;font-size:11px;color:#555;line-height:1.45;">
                ${dateLabel}${dateLabel && timeLabel ? ' · ' : ''}${timeLabel}${(dateLabel || timeLabel) && venueLabel ? '<br/>' : ''}${venueLabel}
              </p>
              <p style="margin:4px 0 0;font-size:10px;color:#777;">분위기: ${moodLabel}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">
                ${orderHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 10px;text-align:center;border-top:2px solid #173F9F;">
              <p style="margin:0;font-size:10px;color:#888;line-height:1.4;">
                AI 자동 식순 큐시트 · 사회자 전달용
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
