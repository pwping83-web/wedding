import type { CSSProperties } from 'react'
import type { AppData } from '../data'
import { moodLabels } from '../data'
import {
  getEntranceCueMeta,
  type CueSheetVariant,
} from '../lib/cueSheetUtils'
import { ENTRANCE_AUDIO_TIMING_ENABLED } from '../config/features'
import {
  buildCueSheetDisplayRows,
  getRowFlexWeight,
  splitCueSheetPages,
  type CueSheetDisplayRow,
} from '../lib/cueSheetRows'
import FormatMcScript from '../lib/formatMcScript'

interface Props {
  data: AppData
  variant: CueSheetVariant
}

function renderGrid(
  pageRows: CueSheetDisplayRow[],
  fillPage: boolean,
  groomName: string,
  brideName: string,
) {
  return (
    <div className={`cue-sheet-grid${fillPage ? ' cue-sheet-grid--fill' : ''}`}>
      {pageRows.map((row) => {
        const weight = getRowFlexWeight(row.script)
        return (
          <div
            key={row.id}
            className="cue-sheet-grid__row"
            style={{ flex: `${weight} 1 auto` } as CSSProperties}
          >
            <div className="cue-sheet-grid__label">
              <div className="cue-sheet-label-main">{row.labelMain}</div>
              {row.labelSub && <div className="cue-sheet-label-sub">{row.labelSub}</div>}
            </div>
            <div className="cue-sheet-grid__script">
              {row.personNote && <p className="cue-sheet-person-line">{row.personNote}</p>}
              <div className="cue-sheet-script-text">
                <FormatMcScript text={row.script} groomName={groomName} brideName={brideName} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function CueSheetDocument({ data, variant }: Props) {
  const rows = buildCueSheetDisplayRows(data, variant)
  const { firstPageRows, secondPageRows } = splitCueSheetPages(rows)
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

  return (
    <article className="cue-sheet">
      <section className="cue-sheet-page cue-sheet-page--first">
        <header className="cue-sheet-header">
          <p className="cue-sheet-header__eyebrow">WEDDING CEREMONY CUE SHEET</p>
          <h1 className="cue-sheet-header__title">{headerTitle}</h1>
          <p className="cue-sheet-header__meta">
            {[dateStr, data.venue, `분위기: ${moodLabels[data.mood]}`].filter(Boolean).join(' · ')}
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

        <div className="cue-sheet-page__body">
          {renderGrid(firstPageRows, true, data.groomName, data.brideName)}
        </div>
      </section>

      {secondPageRows.length > 0 && (
        <section className="cue-sheet-page cue-sheet-page--continued">
          <div className="cue-sheet-page__body">
            {renderGrid(secondPageRows, true, data.groomName, data.brideName)}
          </div>
        </section>
      )}
    </article>
  )
}
