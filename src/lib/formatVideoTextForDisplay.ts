import { VIDEO_FORM_FIELDS } from '../constants/videoFormFields'

export function formatVideoTextForDisplay(payload: Record<string, string>): string {
  const lines: string[] = []
  for (const field of VIDEO_FORM_FIELDS) {
    if (field.kind === 'names') {
      lines.push(
        `${field.timeLabel} ${field.label}: ${payload[field.exportKeys[0]] ?? ''} · ${payload[field.exportKeys[1]] ?? ''}`,
      )
      continue
    }
    if (field.kind === 'single') {
      lines.push(`${field.timeLabel} ${field.label}: ${payload[field.exportKeys[0]] ?? ''}`)
      continue
    }
    const parts = field.exportKeys.map((key, index) => `${index + 1}줄 ${payload[key] ?? ''}`)
    lines.push(`${field.timeLabel} ${field.label}: ${parts.join(' / ')}`)
  }
  return lines.join('\n')
}
