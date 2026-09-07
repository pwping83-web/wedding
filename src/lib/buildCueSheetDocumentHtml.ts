import type { AppData } from '../data'
import type { CueSheetVariant } from './cueSheetUtils'
import { buildCueSheetDisplayRows, type CueSheetDisplayRow } from './cueSheetRows'
import {
  computeCueSheetRowSpacing,
  CUE_SHEET_LABEL_PT,
  CUE_SHEET_LINE_HEIGHT,
  CUE_SHEET_SCRIPT_PT,
} from './cueSheetSpacing'
import { formatMcScriptHtml } from './formatMcScriptHtml'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * FinalOutput `.print-document` > CueSheetDocument 과 동일한 표 HTML.
 * @media print 기준 padding·폰트·색상을 인라인으로 고정 (이메일 클라이언트용).
 */
function renderCueSheetTableHtml(
  pageRows: CueSheetDisplayRow[],
  groomName: string,
  brideName: string,
  rowPaddingPx: number,
): string {
  const labelPadY = rowPaddingPx
  const scriptPadY = rowPaddingPx

  const rows = pageRows
    .map((row, index) => {
      const isLast = index === pageRows.length - 1
      const bottomBorder = isLast ? 'border-bottom:1px dotted #444;' : ''

      return `
        <tr>
          <td style="padding:${labelPadY}px 2px;border-top:1px dotted #444;border-right:1px dotted #444;${bottomBorder}text-align:center;vertical-align:middle;font-size:${CUE_SHEET_LABEL_PT}pt;font-weight:700;line-height:1.35;word-break:keep-all;overflow-wrap:break-word;color:#1A1A1A;background:#FAFAFA;box-sizing:border-box;">
            ${escapeHtml(row.labelMain)}
          </td>
          <td style="padding:${scriptPadY}px 5px;border-top:1px dotted #444;${bottomBorder}vertical-align:top;box-sizing:border-box;overflow-wrap:break-word;word-break:keep-all;">
            <div style="font-size:${CUE_SHEET_SCRIPT_PT}pt;line-height:${CUE_SHEET_LINE_HEIGHT};white-space:pre-wrap;overflow-wrap:break-word;word-break:keep-all;color:#1A1A1A;">
              ${formatMcScriptHtml(row.script, groomName, brideName)}
            </div>
          </td>
        </tr>`
    })
    .join('')

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;table-layout:fixed;border-left:2px solid #173F9F;border-right:2px solid #173F9F;background:#FFFFFF;">
      <colgroup>
        <col style="width:16%;min-width:28mm;" />
        <col style="width:84%;" />
      </colgroup>
      <thead>
        <tr>
          <th style="padding:4px 3px;border-top:2px solid #173F9F;border-bottom:1px solid #173F9F;border-right:1px dotted #444;background:#EEF2FA;font-size:${CUE_SHEET_LABEL_PT}pt;font-weight:700;text-align:center;color:#173F9F;">구분</th>
          <th style="padding:4px 3px;border-top:2px solid #173F9F;border-bottom:1px solid #173F9F;background:#EEF2FA;font-size:${CUE_SHEET_LABEL_PT}pt;font-weight:700;text-align:center;color:#173F9F;">사회자 멘트</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`
}

/**
 * 인쇄 시 `.print-document` 안에만 나오는 큐시트 HTML.
 * CueSheetDocument(표만, 헤더 없음)와 동일 데이터·동일 레이아웃.
 */
export function buildCueSheetDocumentHtml(data: AppData, variant: CueSheetVariant = 'mc'): string {
  const groomName = data.groomName || '신랑'
  const brideName = data.brideName || '신부'
  const rows = buildCueSheetDisplayRows(data, variant)
  const { rowPaddingPx } = computeCueSheetRowSpacing(rows)
  const tableHtml = renderCueSheetTableHtml(rows, groomName, brideName, rowPaddingPx)

  return `
<div class="print-document" style="margin:0;padding:0;width:100%;max-width:none;background:#FFFFFF;">
  <article class="cue-sheet" style="margin:0;padding:0;background:#FFFFFF;color:#1A1A1A;width:100%;font-family:'Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif;">
    <section class="cue-sheet-page" style="margin:0;padding:0;background:#FFFFFF;width:100%;">
      ${tableHtml}
    </section>
  </article>
</div>`.trim()
}

/** buildCueSheetDocumentHtml 과 동일 — 이메일 본문용 */
export function buildCueSheetPrintHtml(data: AppData, variant: CueSheetVariant = 'mc'): string {
  return buildCueSheetDocumentHtml(data, variant)
}
