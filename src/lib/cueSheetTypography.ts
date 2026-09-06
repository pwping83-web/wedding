import type { CueSheetDisplayRow } from './cueSheetRows'

/** A4 portrait — @page margin 5mm top/bottom */
const A4_PRINTABLE_HEIGHT_MM = 287
const HEADER_HEIGHT_MM = 20
const TABLE_HEAD_MM = 7
const ROW_PADDING_MM = 2.5
const LABEL_ROW_OVERHEAD_MM = 6

/** 2열 표 기준 멘트 열 폭 (약 85% × 198mm) */
const SCRIPT_COL_WIDTH_MM = 168

export const CUE_SCRIPT_FONT_MIN_PT = 12
export const CUE_SCRIPT_FONT_MAX_PT = 14
export const CUE_LABEL_FONT_MIN_PT = 9
export const CUE_LABEL_FONT_MAX_PT = 10.5

export type CueSheetTypography = {
  scriptPt: number
  labelPt: number
  lineHeight: number
}

function charsPerLine(scriptPt: number): number {
  const charWidthMm = scriptPt * 0.352778 * 1.05
  return Math.max(18, Math.floor(SCRIPT_COL_WIDTH_MM / charWidthMm))
}

function estimateRowHeightMm(script: string, scriptPt: number, lineHeight: number): number {
  const lines = Math.max(1, Math.ceil(script.length / charsPerLine(scriptPt)))
  const scriptHeight = lines * scriptPt * lineHeight * 0.352778
  return Math.max(LABEL_ROW_OVERHEAD_MM, scriptHeight + ROW_PADDING_MM * 2)
}

/** 신부 입장까지 1페이지에 맞도록 12–14pt 범위에서 멘트·라벨 크기를 추정합니다. */
export function computeCueSheetTypography(rows: CueSheetDisplayRow[]): CueSheetTypography {
  const brideIndex = rows.findIndex((row) => row.orderTitle === '신부 입장')
  if (brideIndex < 0) {
    return { scriptPt: 12, labelPt: 9, lineHeight: 1.45 }
  }

  const firstPageRows = rows.slice(0, brideIndex + 1)
  const budgetMm = A4_PRINTABLE_HEIGHT_MM - HEADER_HEIGHT_MM - TABLE_HEAD_MM

  for (let scriptPt = CUE_SCRIPT_FONT_MAX_PT; scriptPt >= CUE_SCRIPT_FONT_MIN_PT; scriptPt -= 0.25) {
    const lineHeight = scriptPt >= 13.5 ? 1.48 : 1.45
    const labelPt = Math.min(
      CUE_LABEL_FONT_MAX_PT,
      CUE_LABEL_FONT_MIN_PT + (scriptPt - CUE_SCRIPT_FONT_MIN_PT) * 0.67,
    )
    const totalMm = firstPageRows.reduce(
      (sum, row) => sum + estimateRowHeightMm(row.script, scriptPt, lineHeight),
      0,
    )

    if (totalMm <= budgetMm) {
      return {
        scriptPt: Math.round(scriptPt * 4) / 4,
        labelPt: Math.round(labelPt * 4) / 4,
        lineHeight,
      }
    }
  }

  return { scriptPt: CUE_SCRIPT_FONT_MIN_PT, labelPt: CUE_LABEL_FONT_MIN_PT, lineHeight: 1.45 }
}
