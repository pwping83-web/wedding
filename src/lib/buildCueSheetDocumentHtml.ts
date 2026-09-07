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
import { renderCueSheetVenueStampHtml } from './cueSheetVenueStamp'

/** 이메일 클라이언트(네이버 메일 등)에서 「인쇄」 시 앱 인쇄와 동일하게 */
const EMAIL_PRINT_STYLES = `
<style type="text/css">
  .wcm-print-root,
  .wcm-print-root * { box-sizing: border-box; }
  .wcm-print-root {
    margin: 0;
    padding: 0;
    width: 100%;
    max-width: none;
    background: #FFFFFF;
    color: #1A1A1A;
    font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', Arial, sans-serif;
  }
  .wcm-cue-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    border-left: 2px solid #173F9F;
    border-right: 2px solid #173F9F;
    background: #FFFFFF;
  }
  .wcm-cue-row { page-break-inside: avoid; break-inside: avoid; }
  .wcm-cue-head-script { position: relative; padding-right: 8px !important; }
  .wcm-venue-stamp { position: absolute; top: 50%; right: 6px; transform: translateY(-50%); }
  @media print {
    @page { size: A4 portrait; margin: 5mm 6mm; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background: #FFFFFF !important;
    }
    .wcm-email-hint { display: none !important; }
    .wcm-email-print-btn { display: none !important; }
    .wcm-print-root {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .wcm-cue-table { width: 100% !important; }
    .wcm-cue-row { page-break-inside: avoid !important; break-inside: avoid !important; }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
</style>`.trim()

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderCueSheetTableHtml(
  pageRows: CueSheetDisplayRow[],
  groomName: string,
  brideName: string,
  rowPaddingPx: number,
  options?: { omitBlankLines?: boolean },
  venueStampHtml = '',
): string {
  const labelPadY = rowPaddingPx
  const scriptPadY = rowPaddingPx
  const omitBlankLines = options?.omitBlankLines ?? false
  const scriptWhiteSpace = omitBlankLines ? 'normal' : 'pre-wrap'

  const rows = pageRows
    .map((row, index) => {
      const isLast = index === pageRows.length - 1
      const bottomBorder = isLast ? 'border-bottom:1px dotted #444;' : ''

      return `
        <tr class="wcm-cue-row">
          <td style="padding:${labelPadY}px 2px;border-top:1px dotted #444;border-right:1px dotted #444;${bottomBorder}text-align:center;vertical-align:middle;font-size:${CUE_SHEET_LABEL_PT}pt;font-weight:700;line-height:1.35;word-break:keep-all;overflow-wrap:break-word;color:#1A1A1A;background:#FAFAFA;">
            ${escapeHtml(row.labelMain)}
          </td>
          <td style="padding:${scriptPadY}px 5px;border-top:1px dotted #444;${bottomBorder}vertical-align:top;overflow-wrap:break-word;word-break:keep-all;">
            <div style="font-size:${CUE_SHEET_SCRIPT_PT}pt;line-height:${CUE_SHEET_LINE_HEIGHT};white-space:${scriptWhiteSpace};overflow-wrap:break-word;word-break:keep-all;color:#1A1A1A;">
              ${formatMcScriptHtml(row.script, groomName, brideName, { omitBlankLines })}
            </div>
          </td>
        </tr>`
    })
    .join('')

  return `
    <table class="wcm-cue-table cue-sheet-table" width="100%" cellpadding="0" cellspacing="0">
      <colgroup>
        <col style="width:16%;min-width:28mm;" />
        <col style="width:84%;" />
      </colgroup>
      <thead>
        <tr>
          <th style="padding:4px 3px;border-top:2px solid #173F9F;border-bottom:1px solid #173F9F;border-right:1px dotted #444;background:#EEF2FA;font-size:${CUE_SHEET_LABEL_PT}pt;font-weight:700;text-align:center;color:#173F9F;">구분</th>
          <th class="wcm-cue-head-script" style="padding:4px 8px 4px 3px;border-top:2px solid #173F9F;border-bottom:1px solid #173F9F;background:#EEF2FA;font-size:${CUE_SHEET_LABEL_PT}pt;font-weight:700;text-align:center;color:#173F9F;position:relative;">사회자 멘트${venueStampHtml}</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`
}

function renderPrintDocumentBody(
  data: AppData,
  variant: CueSheetVariant,
  options?: { omitBlankLines?: boolean },
): string {
  const groomName = data.groomName || '신랑'
  const brideName = data.brideName || '신부'
  const rows = buildCueSheetDisplayRows(data, variant)
  const { rowPaddingPx } = computeCueSheetRowSpacing(rows)
  const venueStampHtml = renderCueSheetVenueStampHtml(data)
  const tableHtml = renderCueSheetTableHtml(
    rows,
    groomName,
    brideName,
    rowPaddingPx,
    options,
    venueStampHtml,
  )

  return `
<div class="wcm-print-root print-document">
  <article class="cue-sheet" style="margin:0;padding:0;background:#FFFFFF;width:100%;">
    <section class="wcm-cue-sheet-page cue-sheet-page" style="margin:0;padding:0;background:#FFFFFF;width:100%;">
      ${tableHtml}
    </section>
  </article>
</div>`.trim()
}

/** 앱 인쇄 `.print-document` 영역 HTML */
export function buildCueSheetDocumentHtml(data: AppData, variant: CueSheetVariant = 'mc'): string {
  return renderPrintDocumentBody(data, variant)
}

/** 이메일 본문용 — 표 + @media print (인쇄 버튼은 API에서 링크 삽입) */
export function buildCueSheetEmailHtml(data: AppData, variant: CueSheetVariant = 'mc'): string {
  return `${EMAIL_PRINT_STYLES}\n${renderPrintDocumentBody(data, variant, { omitBlankLines: true })}`
}

/** 이메일 「인쇄」 버튼 → 브라우저 인쇄 페이지 */
export function buildCueSheetPrintHtml(data: AppData, variant: CueSheetVariant = 'mc'): string {
  return renderPrintDocumentBody(data, variant, { omitBlankLines: true })
}
