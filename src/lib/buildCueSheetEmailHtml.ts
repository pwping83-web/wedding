import type { AppData } from '../data'
import { buildCueSheetEmailHtml as buildEmailHtml } from './buildCueSheetDocumentHtml'

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
  return `[ENX 웨딩 · MC] ${groom} · ${bride}${date ? ` — ${date}` : ''}`
}

/** 이메일 열기 → 메일 내 「인쇄」 시 A4 큐시트 출력 */
export function buildCueSheetEmailHtml(data: AppData): string {
  return buildEmailHtml(data, 'mc')
}
