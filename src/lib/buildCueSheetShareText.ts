import type { AppData } from '../data'
import { moodLabels } from '../data'
import { buildCueSheetDisplayRows } from './cueSheetRows'

function formatDateLabel(date: string): string {
  if (!date) return ''
  return new Date(`${date}T00:00:00`).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

/** 카카오톡·메신저 공유용 플레인 텍스트 큐시트 */
export function buildCueSheetShareText(data: AppData): string {
  const groom = data.groomName || '신랑'
  const bride = data.brideName || '신부'
  const dateLabel = formatDateLabel(data.date)
  const meta = [dateLabel, data.time, data.venue, `분위기: ${moodLabels[data.mood]}`]
    .filter(Boolean)
    .join(' · ')

  const lines: string[] = ['📋 예식 큐시트', `${groom} · ${bride}`]
  if (meta) lines.push(meta)
  lines.push('', '─── 식순 ───', '')

  const rows = buildCueSheetDisplayRows(data, 'mc')
  for (const row of rows) {
    lines.push(`【${row.labelMain}】`)
    lines.push(row.script.trim())
    lines.push('')
  }

  return lines.join('\n').trimEnd()
}
