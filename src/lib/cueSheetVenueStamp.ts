import type { AppData } from '../data'

function formatStampDate(date: string): string {
  if (!date.trim()) return ''
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date.trim()

  const month = parsed.getMonth() + 1
  const day = parsed.getDate()
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][parsed.getDay()]
  return `${month}/${day}(${weekday})`
}

export function formatCueSheetVenueStamp(data: Pick<AppData, 'venue' | 'time' | 'date'>): string {
  const venue = data.venue?.trim() ?? ''
  const time = data.time?.trim() ?? ''
  const date = formatStampDate(data.date ?? '')

  const schedule = [date, time].filter(Boolean).join(' ')
  const parts = [venue, schedule].filter(Boolean)

  return parts.join(' · ')
}

const STAMP_INLINE_STYLE =
  'position:absolute;top:50%;right:6px;transform:translateY(-50%);max-width:38%;margin:0;padding:0;text-align:right;font-size:6pt;line-height:1.3;font-weight:500;color:#9A9590;word-break:keep-all;overflow-wrap:break-word;pointer-events:none;'

export function renderCueSheetVenueStampHtml(data: Pick<AppData, 'venue' | 'time' | 'date'>): string {
  const text = formatCueSheetVenueStamp(data)
  if (!text) return ''

  return `<span class="wcm-venue-stamp cue-sheet-venue-stamp" style="${STAMP_INLINE_STYLE}">${escapeHtml(text)}</span>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
