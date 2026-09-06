import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { AppData } from '../data'
import { moodLabels } from '../data'
import {
  getEntranceCueMeta,
  type CueSheetVariant,
} from '../lib/cueSheetUtils'
import { ENTRANCE_AUDIO_TIMING_ENABLED } from '../config/features'
import { buildCueSheetDisplayRows, type CueSheetDisplayRow } from '../lib/cueSheetRows'
import { computeCueSheetRowSpacing } from '../lib/cueSheetSpacing'
import FormatMcScript from '../lib/formatMcScript'

interface Props {
  data: AppData
  variant: CueSheetVariant
}

function renderTable(
  pageRows: CueSheetDisplayRow[],
  groomName: string,
  brideName: string,
) {
  return (
    <table className="cue-sheet-table">
      <colgroup>
        <col className="cue-sheet-table__col-label" />
        <col className="cue-sheet-table__col-script" />
      </colgroup>
      <thead>
        <tr>
          <th className="cue-sheet-table__head">구분</th>
          <th className="cue-sheet-table__head">사회자 멘트</th>
        </tr>
      </thead>
      <tbody>
        {pageRows.map((row) => (
          <tr
            key={row.id}
            className="cue-sheet-table__row"
            data-order-title={row.orderTitle}
          >
            <td className="cue-sheet-table__label">{row.labelMain}</td>
            <td className="cue-sheet-table__script">
              <div className="cue-sheet-script-text">
                <FormatMcScript text={row.script} groomName={groomName} brideName={brideName} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function CueSheetDocument({ data, variant }: Props) {
  const rows = buildCueSheetDisplayRows(data, variant)
  const spacing = useMemo(() => computeCueSheetRowSpacing(rows), [rows])
  const groomMeta = getEntranceCueMeta(data, 'groom')
  const brideMeta = getEntranceCueMeta(data, 'bride')

  const dateStr = data.date
    ? new Date(`${data.date}T00:00:00`).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : ''

  const headerTitle = `${data.groomName || '신랑'} · ${data.brideName || '신부'}`

  const spacingStyle = {
    '--cue-row-padding-y': `${spacing.rowPaddingPx}px`,
  } as CSSProperties

  return (
    <article className="cue-sheet" style={spacingStyle}>
      <section className="cue-sheet-page">
        <header className="cue-sheet-header">
          <p className="cue-sheet-header__eyebrow">WEDDING CEREMONY CUE SHEET</p>
          <h1 className="cue-sheet-header__title">{headerTitle}</h1>
          <p className="cue-sheet-header__meta">
            {[dateStr, data.time, data.venue, `분위기: ${moodLabels[data.mood]}`]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </header>

        {ENTRANCE_AUDIO_TIMING_ENABLED && variant === 'mc' && (groomMeta || brideMeta) && (
          <div className="cue-sheet-audio-summary">
            <strong>입장 음원 · 타이밍</strong>
            {groomMeta && (
              <span>
                신랑 {groomMeta.audioTitle ?? '음원 없음'} · {groomMeta.timingLabel}
              </span>
            )}
            {brideMeta && (
              <span>
                신부 {brideMeta.audioTitle ?? '음원 없음'} · {brideMeta.timingLabel}
              </span>
            )}
          </div>
        )}

        {renderTable(rows, data.groomName, data.brideName)}
      </section>
    </article>
  )
}
