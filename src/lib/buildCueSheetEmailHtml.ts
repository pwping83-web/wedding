import type { AppData } from '../data'
import { moodLabels } from '../data'
import {
  buildCueSheetDisplayRows,
  splitCueSheetPages,
  type CueSheetDisplayRow,
} from './cueSheetRows'

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
  /(배경\s*음악|박\s*수|맞\s*절|박\s*전|환\s*호|음\s*악\s*주세요|큰\s*박\s*수|따뜻한\s*박\s*수)/g

function preserveLineBreaks(value: string): string {
  return value.replace(/\n/g, '<br/>')
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
  return highlightNamesHtml(
    preserveLineBreaks(escapeHtml(script))
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

function renderRowsHtml(
  pageRows: CueSheetDisplayRow[],
  groomName: string,
  brideName: string,
): string {
  return pageRows
    .map((row) => {
      return `
      <tr>
        <td style="width:1%;white-space:nowrap;max-width:14mm;padding:2px 3px;border-top:1px dotted #444;border-bottom:1px dotted #444;border-right:1px dotted #444;background:#FFFFFF;text-align:center;vertical-align:middle;">
          <div style="font-size:9pt;font-weight:700;line-height:1.2;color:#111;white-space:nowrap;word-break:keep-all;">${escapeHtml(row.labelMain)}</div>
        </td>
        <td style="padding:2px 5px;border-top:1px dotted #444;border-bottom:1px dotted #444;vertical-align:top;">
          ${
            row.personNote
              ? `<div style="margin:0 0 4px;padding-bottom:3px;border-bottom:1px dotted #D8D8D8;font-size:8pt;line-height:1.4;color:#7B6FA8;">${escapeHtml(row.personNote)}</div>`
              : ''
          }
          <div style="font-size:11.5pt;line-height:1.62;color:#222;word-break:keep-all;">${formatScriptHtml(row.script, groomName, brideName)}</div>
        </td>
      </tr>`
    })
    .join('')
}

function renderPageTable(
  pageRows: CueSheetDisplayRow[],
  groomName: string,
  brideName: string,
): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:auto;border-left:2px solid #173F9F;border-right:2px solid #173F9F;">
      ${renderRowsHtml(pageRows, groomName, brideName)}
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
  const venueLabel = escapeHtml(data.venue || '예식장')
  const moodLabel = escapeHtml(moodLabels[data.mood])
  const rows = buildCueSheetDisplayRows(data, 'mc')
  const { firstPageRows, secondPageRows } = splitCueSheetPages(rows)

  const headerHtml = `
    <div style="padding:8px 6px 6px;text-align:center;border-bottom:2px solid #173F9F;">
      <p style="margin:0 0 2px;font-size:6.5pt;font-weight:700;color:#7B6FA8;letter-spacing:0.1em;">WEDDING CEREMONY CUE SHEET</p>
      <h1 style="margin:0 0 3px;font-size:10pt;font-weight:700;color:#1A1A1A;line-height:1.3;">
        ${groom} · ${bride}
      </h1>
      <p style="margin:0;font-size:8pt;color:#555;line-height:1.35;">
        ${dateLabel}${dateLabel && venueLabel ? ' · ' : ''}${venueLabel}${venueLabel ? ' · ' : ''}분위기: ${moodLabel}
      </p>
    </div>`

  const firstPageHtml = `
    <div style="page-break-after:always;">
      ${headerHtml}
      ${renderPageTable(firstPageRows, groomRaw, brideRaw)}
    </div>`

  const secondPageHtml =
    secondPageRows.length > 0
      ? `<div>${renderPageTable(secondPageRows, groomRaw, brideRaw)}</div>`
      : ''

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>웨딩 큐시트</title>
</head>
<body style="margin:0;padding:0;background:#FFFFFF;font-family:'Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif;color:#1A1A1A;">
  <div style="width:100%;max-width:760px;margin:0 auto;background:#FFFFFF;">
    ${firstPageHtml}
    ${secondPageHtml}
  </div>
</body>
</html>`
}
