import type { AppData } from '../data'
import { buildCueSheetDocumentHtml } from './buildCueSheetDocumentHtml'

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

/** 인쇄용 CueSheetDocument 와 동일한 HTML */
export function buildCueSheetEmailHtml(data: AppData): string {
  return buildCueSheetDocumentHtml(data, 'mc')
}
