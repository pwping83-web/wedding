import type { CueSheetDisplayRow } from './cueSheetRows'

/** A4 portrait — @page margin 5mm top/bottom */
const A4_PRINTABLE_HEIGHT_MM = 287
const HEADER_HEIGHT_MM = 20
const TABLE_HEAD_MM = 7

/** 2열 표 기준 멘트 열 폭 (약 84% × 198mm) */
const SCRIPT_COL_WIDTH_MM = 166

export const CUE_SHEET_SCRIPT_PT = 12
export const CUE_SHEET_LABEL_PT = 9
export const CUE_SHEET_LINE_HEIGHT = 1.45

export const CUE_ROW_PADDING_MIN_PX = 4
export const CUE_ROW_PADDING_MAX_PX = 14

export type CueSheetSpacing = {
  rowPaddingPx: number
}

function pxToMm(px: number): number {
  return px * 0.264583
}

function charsPerLine(): number {
  const charWidthMm = CUE_SHEET_SCRIPT_PT * 0.352778 * 1.05
  return Math.max(18, Math.floor(SCRIPT_COL_WIDTH_MM / charWidthMm))
}

function estimateRowHeightMm(script: string, paddingPx: number): number {
  const lines = Math.max(1, Math.ceil(script.length / charsPerLine()))
  const scriptHeight = lines * CUE_SHEET_SCRIPT_PT * CUE_SHEET_LINE_HEIGHT * 0.352778
  return scriptHeight + pxToMm(paddingPx) * 2
}

function totalHeightMm(rows: CueSheetDisplayRow[], paddingPx: number): number {
  return rows.reduce((sum, row) => sum + estimateRowHeightMm(row.script, paddingPx), 0)
}

/**
 * 신부 입장까지 1페이지, 맞절부터 2페이지가 되도록
 * 행 상하 padding(4–14px)을 추정합니다. 폰트 크기는 고정입니다.
 */
export function computeCueSheetRowSpacing(rows: CueSheetDisplayRow[]): CueSheetSpacing {
  const brideIndex = rows.findIndex((row) => row.orderTitle === '신부 입장')
  if (brideIndex < 0) {
    return { rowPaddingPx: 6 }
  }

  const budgetMm = A4_PRINTABLE_HEIGHT_MM - HEADER_HEIGHT_MM - TABLE_HEAD_MM
  const firstPageRows = rows.slice(0, brideIndex + 1)
  const hasNextPageRow = brideIndex + 1 < rows.length

  for (let paddingPx = CUE_ROW_PADDING_MAX_PX; paddingPx >= CUE_ROW_PADDING_MIN_PX; paddingPx--) {
    const firstPageHeight = totalHeightMm(firstPageRows, paddingPx)
    const withNextRowHeight = hasNextPageRow
      ? totalHeightMm(rows.slice(0, brideIndex + 2), paddingPx)
      : firstPageHeight + 1

    if (firstPageHeight <= budgetMm && withNextRowHeight > budgetMm) {
      return { rowPaddingPx: paddingPx }
    }
  }

  if (totalHeightMm(firstPageRows, CUE_ROW_PADDING_MIN_PX) > budgetMm) {
    return { rowPaddingPx: CUE_ROW_PADDING_MIN_PX }
  }

  return { rowPaddingPx: CUE_ROW_PADDING_MAX_PX }
}
