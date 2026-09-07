import type { AppData } from '../data'

export function formatCueSheetVenueStamp(data: Pick<AppData, 'venue' | 'time'>): string {
  const venue = data.venue?.trim() ?? ''
  const time = data.time?.trim() ?? ''
  if (!venue && !time) return ''
  if (venue && time) return `${venue} · ${time}`
  return venue || time
}

const STAMP_INLINE_STYLE =
  'position:absolute;top:50%;right:6px;transform:translateY(-50%);max-width:38%;margin:0;padding:0;text-align:right;font-size:6pt;line-height:1.3;font-weight:500;color:#9A9590;word-break:keep-all;overflow-wrap:break-word;pointer-events:none;'

export function renderCueSheetVenueStampHtml(data: Pick<AppData, 'venue' | 'time'>): string {
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
