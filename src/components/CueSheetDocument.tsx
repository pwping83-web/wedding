import type { AppData } from '../data'
import { moodLabels } from '../data'
import {
  getEntranceCueMeta,
  type CueSheetVariant,
} from '../lib/cueSheetUtils'
import { ENTRANCE_AUDIO_TIMING_ENABLED } from '../config/features'
import { buildCueSheetDisplayRows } from '../lib/cueSheetRows'
import FormatMcScript from '../lib/formatMcScript'

interface Props {
  data: AppData
  variant: CueSheetVariant
}

export default function CueSheetDocument({ data, variant }: Props) {
  const rows = buildCueSheetDisplayRows(data, variant)
  const brideEntranceIndex = rows.findIndex((row) => row.labelMain === '신부 입장')
  const firstPageRows =
    brideEntranceIndex >= 0 ? rows.slice(0, brideEntranceIndex + 1) : rows
  const secondPageRows = brideEntranceIndex >= 0 ? rows.slice(brideEntranceIndex + 1) : []
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

  const headerTitle =
    variant === 'mc'
      ? `${data.groomName || '신랑'} · ${data.brideName || '신부'} 결혼 예식 — 사회자 큐시트`
      : `${data.groomName || '신랑'} · ${data.brideName || '신부'} 결혼 예식`

  const renderTable = (pageRows: typeof rows) => (
    <table className="cue-sheet-table">
      <thead>
        <tr>
          <th className="cue-sheet-table__label-col">순서</th>
          <th className="cue-sheet-table__script-col">MC 대본</th>
        </tr>
      </thead>
      <tbody>
        {pageRows.map((row) => (
          <tr key={row.id} className="cue-sheet-table__row">
            <td className="cue-sheet-table__label">
              <div className="cue-sheet-label-main">{row.labelMain}</div>
              {row.labelSub && <div className="cue-sheet-label-sub">{row.labelSub}</div>}
            </td>
            <td className="cue-sheet-table__script">
              {(row.audioNote || row.timingNote) && (
                <p className="cue-sheet-meta-line">
                  {row.audioNote && <span>🎵 {row.audioNote}</span>}
                  {row.timingNote && <span>{row.timingNote}</span>}
                </p>
              )}
              {row.personNote && <p className="cue-sheet-person-line">{row.personNote}</p>}
              <div className="cue-sheet-script-text">
                <FormatMcScript text={row.script} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <article className="cue-sheet">
      <section className="cue-sheet-page cue-sheet-page--first">
        <header className="cue-sheet-header">
        <p className="cue-sheet-header__eyebrow">WEDDING CEREMONY CUE SHEET</p>
        <h1 className="cue-sheet-header__title">{headerTitle}</h1>
        <p className="cue-sheet-header__meta">
          {[dateStr, data.venue].filter(Boolean).join(' · ')}
        </p>
        <p className="cue-sheet-header__mood">분위기: {moodLabels[data.mood]}</p>
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

        <div className="cue-sheet-page__body">{renderTable(firstPageRows)}</div>

        <footer className="cue-sheet-footer">
          AI 자동 식순 큐시트 · 사회자 전달용
        </footer>
      </section>

      {secondPageRows.length > 0 && (
        <section className="cue-sheet-page cue-sheet-page--continued">
          <div className="cue-sheet-page__body">{renderTable(secondPageRows)}</div>
          <footer className="cue-sheet-footer">
            AI 자동 식순 큐시트 · 사회자 전달용
          </footer>
        </section>
      )}
    </article>
  )
}
