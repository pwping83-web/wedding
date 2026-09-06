import type { AppData } from '../data'
import { moodLabels } from '../data'
import { buildCueSheetDisplayRows, type CueSheetDisplayRow } from './cueSheetRows'

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

function splitPages(rows: CueSheetDisplayRow[]) {
  const brideEntranceIndex = rows.findIndex((row) => row.labelMain === '신부 입장')
  if (brideEntranceIndex < 0) {
    return { firstPageRows: rows, secondPageRows: [] as CueSheetDisplayRow[] }
  }
  return {
    firstPageRows: rows.slice(0, brideEntranceIndex + 1),
    secondPageRows: rows.slice(brideEntranceIndex + 1),
  }
}

function renderRowsHtml(pageRows: CueSheetDisplayRow[]): string {
  return pageRows
    .map((row) => {
      return `
      <tr>
        <td style="width:12mm;max-width:12mm;min-width:12mm;padding:3px 2px;border-top:1px dotted #444;border-bottom:1px dotted #444;border-right:1px dotted #444;background:#FAFAFA;text-align:center;vertical-align:middle;">
          <div style="font-size:6pt;font-weight:700;line-height:1.25;color:#111;white-space:pre-line;word-break:keep-all;">${preserveLineBreaks(escapeHtml(row.labelMain))}</div>
          ${row.labelSub ? `<div style="margin-top:2px;font-size:5.5pt;font-weight:700;color:#111;">${escapeHtml(row.labelSub)}</div>` : ''}
        </td>
        <td style="padding:4px 7px;border-top:1px dotted #444;border-bottom:1px dotted #444;vertical-align:top;">
          ${
            row.personNote
              ? `<div style="margin:0 0 5px;padding-bottom:4px;border-bottom:1px dotted #D8D8D8;font-size:9pt;line-height:1.45;color:#7B6FA8;">${escapeHtml(row.personNote)}</div>`
              : ''
          }
          <div style="font-size:8.5pt;line-height:1.45;color:#222;word-break:keep-all;">${formatScriptHtml(row.script)}</div>
        </td>
      </tr>`
    })
    .join('')
}

function renderPageTable(pageRows: CueSheetDisplayRow[]): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;border-left:2px solid #173F9F;border-right:2px solid #173F9F;">
      <colgroup>
        <col style="width:12mm;" />
        <col />
      </colgroup>
      ${renderRowsHtml(pageRows)}
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
  const dateLabel = escapeHtml(formatDateLabel(data.date))
  const venueLabel = escapeHtml(data.venue || '예식장')
  const moodLabel = escapeHtml(moodLabels[data.mood])
  const rows = buildCueSheetDisplayRows(data, 'mc')
  const { firstPageRows, secondPageRows } = splitPages(rows)

  const headerHtml = `
    <div style="padding:12px 10px 10px;text-align:center;border-bottom:2px solid #173F9F;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#7B6FA8;letter-spacing:0.1em;">WEDDING CEREMONY CUE SHEET</p>
      <h1 style="margin:0 0 6px;font-size:16px;font-weight:700;color:#1A1A1A;line-height:1.35;">
        ${groom} · ${bride} 결혼 예식 — 사회자 큐시트
      </h1>
      <p style="margin:0;font-size:11px;color:#555;line-height:1.45;">
        ${dateLabel}${dateLabel && venueLabel ? '<br/>' : ''}${venueLabel}
      </p>
      <p style="margin:4px 0 0;font-size:10px;color:#777;">분위기: ${moodLabel}</p>
    </div>`

  const footerHtml = `
    <div style="padding:8px 10px;text-align:center;border-top:2px solid #173F9F;">
      <p style="margin:0;font-size:10px;color:#888;line-height:1.4;">
        AI 자동 식순 큐시트 · 사회자 전달용
      </p>
    </div>`

  const firstPageHtml = `
    <div style="page-break-after:always;">
      ${headerHtml}
      ${renderPageTable(firstPageRows)}
      ${footerHtml}
    </div>`

  const secondPageHtml =
    secondPageRows.length > 0
      ? `
    <div>
      ${renderPageTable(secondPageRows)}
      ${footerHtml}
    </div>`
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
