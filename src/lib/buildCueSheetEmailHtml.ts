import type { AppData } from '../data'
import { getPersonIntroScript, moodLabels, roleLabels } from '../data'
import {
  addMinutesLabel,
  buildOrderItemsWithTime,
  entranceTypeForTitle,
  getEntranceCueMeta,
  getItemScriptForCueSheet,
} from './cueSheetUtils'
import { ENTRANCE_AUDIO_TIMING_ENABLED } from '../config/features'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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
  return `[웨딩 큐시트] ${groom} · ${bride}${date ? ` — ${date}` : ''}`
}

export function buildCueSheetEmailHtml(data: AppData): string {
  const groom = escapeHtml(data.groomName || '신랑')
  const bride = escapeHtml(data.brideName || '신부')
  const dateLabel = escapeHtml(formatDateLabel(data.date))
  const timeLabel = escapeHtml(data.time || '')
  const venueLabel = escapeHtml(data.venue || '예식장')
  const moodLabel = escapeHtml(moodLabels[data.mood])
  const groomMeta = getEntranceCueMeta(data, 'groom')
  const brideMeta = getEntranceCueMeta(data, 'bride')
  const items = buildOrderItemsWithTime(data)

  const personsHtml =
    data.persons.length > 0
      ? `
      <tr><td style="padding:24px 28px 8px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#7B6FA8;letter-spacing:0.04em;">참석 인물</p>
        ${data.persons
          .map((person) => {
            const intro = escapeHtml(getPersonIntroScript(person))
            return `
          <div style="margin-bottom:12px;padding:12px 14px;background:#FAFAF8;border-radius:10px;border:1px solid #ECE8E3;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1A1A1A;">
              ${escapeHtml(roleLabels[person.role])} ${escapeHtml(person.name)}
              <span style="font-weight:400;color:#8A8580;">(${escapeHtml(person.relationship)})</span>
            </p>
            <p style="margin:0;font-size:13px;line-height:1.65;color:#444;">${intro}</p>
          </div>`
          })
          .join('')}
      </td></tr>`
      : ''

  const entranceHtml =
    ENTRANCE_AUDIO_TIMING_ENABLED && (groomMeta || brideMeta)
      ? `
      <tr><td style="padding:8px 28px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F0EB;border-radius:12px;border:1px solid #E8E5E0;">
          <tr><td style="padding:16px 18px;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1A1A1A;">입장 음원 · 타이밍</p>
            ${
              groomMeta
                ? `<p style="margin:0 0 6px;font-size:13px;color:#333;">
                    <strong>신랑</strong> · ${escapeHtml(groomMeta.audioTitle ?? '음원 없음')}
                    · <span style="color:#5A8F6A;font-weight:600;">${escapeHtml(groomMeta.timingLabel)}</span>
                  </p>`
                : ''
            }
            ${
              brideMeta
                ? `<p style="margin:0;font-size:13px;color:#333;">
                    <strong>신부</strong> · ${escapeHtml(brideMeta.audioTitle ?? '음원 없음')}
                    · <span style="color:#5A8F6A;font-weight:600;">${escapeHtml(brideMeta.timingLabel)}</span>
                  </p>`
                : ''
            }
          </td></tr>
        </table>
      </td></tr>`
      : ''

  const orderHtml = items
    .map((item, index) => {
      const script = escapeHtml(getItemScriptForCueSheet(item, data)).replace(/\n/g, '<br/>')
      const entranceType = entranceTypeForTitle(item.title)
      const entranceMeta = entranceType ? getEntranceCueMeta(data, entranceType) : null
      const person = data.persons.find((p) => {
        if (item.title === '축가') return p.role === 'vocalist'
        if (item.title === '축사') return p.role === 'speaker'
        return false
      })
      const timeLabel = addMinutesLabel(data.time, item.startMin)

      return `
      <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #ECE8E3;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:15px;font-weight:700;color:#1A1A1A;padding-bottom:6px;">
              ${index + 1}. ${escapeHtml(item.title)}
            </td>
            <td align="right" style="font-size:12px;color:#8A8580;white-space:nowrap;padding-bottom:6px;">
              ${escapeHtml(timeLabel)} · ${item.duration}분
            </td>
          </tr>
        </table>
        ${
          ENTRANCE_AUDIO_TIMING_ENABLED && entranceMeta
            ? `<p style="margin:0 0 6px;font-size:12px;color:#5A8F6A;">
                ${entranceMeta.audioTitle ? `🎵 ${escapeHtml(entranceMeta.audioTitle)} · ` : ''}
                ${escapeHtml(entranceMeta.timingLabel)}
              </p>`
            : ''
        }
        ${
          person
            ? `<p style="margin:0 0 8px;font-size:12px;color:#7B6FA8;">
                👤 ${escapeHtml(person.name)} (${escapeHtml(person.relationship)})
              </p>`
            : ''
        }
        <div style="padding:12px 14px;background:#FFFFFF;border-radius:10px;border:1px solid #ECE8E3;">
          <p style="margin:0;font-size:13px;line-height:1.75;color:#333;">${script}</p>
        </div>
      </div>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>웨딩 큐시트</title>
</head>
<body style="margin:0;padding:0;background:#F0EDE8;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#1A1A1A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDE8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E8E5E0;box-shadow:0 8px 32px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:28px 28px 22px;background:linear-gradient(135deg,#F7F2FA 0%,#FAF0ED 100%);text-align:center;border-bottom:1px solid #ECE8E3;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#7B6FA8;letter-spacing:0.08em;">WEDDING CUE SHEET</p>
              <h1 style="margin:0 0 10px;font-size:24px;font-weight:700;color:#1A1A1A;line-height:1.35;">
                ${groom} · ${bride}
              </h1>
              <p style="margin:0;font-size:14px;color:#666;line-height:1.6;">
                ${dateLabel}${dateLabel && timeLabel ? ' · ' : ''}${timeLabel}${(dateLabel || timeLabel) && venueLabel ? '<br/>' : ''}${venueLabel}
              </p>
              <p style="margin:10px 0 0;font-size:12px;color:#8A8580;">분위기: ${moodLabel}</p>
            </td>
          </tr>
          ${entranceHtml}
          ${personsHtml}
          <tr>
            <td style="padding:16px 28px 28px;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#7B6FA8;letter-spacing:0.04em;">식순 · MC 멘트</p>
              ${orderHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;background:#FAFAF8;border-top:1px solid #ECE8E3;text-align:center;">
              <p style="margin:0;font-size:12px;color:#8A8580;line-height:1.6;">
                AI 자동 식순 큐시트 · 사회자 전달용<br/>
                문의: tseizou@naver.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
