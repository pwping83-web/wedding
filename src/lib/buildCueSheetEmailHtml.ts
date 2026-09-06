import type { AppData } from '../data'
import { moodLabels } from '../data'
import { buildCueSheetDisplayRows, type CueSheetDisplayRow } from './cueSheetRows'
import { computeCueSheetTypography } from './cueSheetTypography'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const CUE_PATTERN = /(\([^)]*\)|\[[^\]]*\])/g
const EMPHASIS_PATTERN =
  /(배경\s*음악|박\s*수|맞\s*절|박\s*전|환\s*호|음\s*악\s*주세요|큰\s*박\s*수|따뜻한\s*박\s*수|입장해\s*주|일어나\s*주|맞이해\s*주|박수로\s*맞이|박수\s*부탁)/g

function labelCellStyle(labelPt: number): string {
  return `width:16%;min-width:28mm;padding:3px 2px;border-top:1px dotted #444;border-right:1px dotted #444;text-align:center;vertical-align:middle;font-size:${labelPt}pt;font-weight:700;line-height:1.35;word-break:keep-all;overflow-wrap:break-word;color:#111;background:#FAFAFA;`
}

function highlightNamesHtml(text: string, groomName: string, brideName: string): string {
  const names = [...new Set([groomName.trim(), brideName.trim()].filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  )
  if (names.length === 0) return text

  const pattern = new RegExp(`(${names.map(escapeRegExp).join('|')})`, 'g')
  return text.replace(pattern, '<span style="color:#1F5FA8;font-weight:700;">$1</span>')
}

function formatScriptHtml(script: string, groomName: string, brideName: string): string {
  const escaped = escapeHtml(script).replace(/\n/g, '<br/>')
  return highlightNamesHtml(
    escaped
      .replace(CUE_PATTERN, '<span style="color:#C45C5C;font-weight:700;">$1</span>')
      .replace(EMPHASIS_PATTERN, '<span style="color:#1F5FA8;font-weight:700;">$1</span>'),
    groomName,
    brideName,
  )
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

function renderTableHtml(
  pageRows: CueSheetDisplayRow[],
  groomName: string,
  brideName: string,
  labelPt: number,
  scriptPt: number,
  lineHeight: number,
): string {
  const rows = pageRows
    .map((row) => {
      return `
        <tr>
          <td style="${labelCellStyle(labelPt)}">
            ${escapeHtml(row.labelMain)}
          </td>
          <td style="width:84%;padding:3px 5px;border-top:1px dotted #444;vertical-align:top;font-size:${scriptPt}pt;line-height:${lineHeight};color:#222;overflow-wrap:break-word;word-break:keep-all;">
            ${formatScriptHtml(row.script, groomName, brideName)}
          </td>
        </tr>`
    })
    .join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;border-left:2px solid #173F9F;border-right:2px solid #173F9F;">
      <colgroup>
        <col style="width:16%;min-width:28mm;" />
        <col style="width:84%;" />
      </colgroup>
      <thead>
        <tr>
          <th style="width:16%;min-width:28mm;padding:4px 3px;border-top:2px solid #173F9F;border-bottom:1px solid #173F9F;border-right:1px dotted #444;background:#EEF2FA;font-size:${labelPt}pt;font-weight:700;color:#173F9F;">구분</th>
          <th style="width:84%;padding:4px 3px;border-top:2px solid #173F9F;border-bottom:1px solid #173F9F;background:#EEF2FA;font-size:${labelPt}pt;font-weight:700;color:#173F9F;">사회자 멘트</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`
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
  const groomRaw = data.groomName || '신랑'
  const brideRaw = data.brideName || '신부'
  const dateLabel = escapeHtml(formatDateLabel(data.date))
  const timeLabel = escapeHtml(data.time || '')
  const venueLabel = escapeHtml(data.venue || '예식장')
  const moodLabel = escapeHtml(moodLabels[data.mood])
  const rows = buildCueSheetDisplayRows(data, 'mc')
  const { scriptPt, labelPt, lineHeight } = computeCueSheetTypography(rows)

  const headerHtml = `
    <div style="padding:8px 6px 6px;text-align:center;border-bottom:2px solid #173F9F;">
      <p style="margin:0 0 2px;font-size:6.5pt;font-weight:700;color:#7B6FA8;letter-spacing:0.1em;">WEDDING CEREMONY CUE SHEET</p>
      <h1 style="margin:0 0 3px;font-size:10pt;font-weight:700;color:#1A1A1A;line-height:1.3;">${groom} · ${bride}</h1>
      <p style="margin:0;font-size:8pt;color:#555;line-height:1.35;">${dateLabel}${timeLabel ? ` · ${timeLabel}` : ''}${venueLabel ? ` · ${venueLabel}` : ''} · 분위기: ${moodLabel}</p>
    </div>`

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>웨딩 큐시트</title>
</head>
<body style="margin:0;padding:0;background:#FFFFFF;font-family:'Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif;color:#1A1A1A;">
  <div style="width:100%;max-width:760px;margin:0 auto;">
    ${headerHtml}
    ${renderTableHtml(rows, groomRaw, brideRaw, labelPt, scriptPt, lineHeight)}
  </div>
</body>
</html>`
}
