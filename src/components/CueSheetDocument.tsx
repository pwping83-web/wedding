import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { AppData } from '../data'
import type { CueSheetVariant } from '../lib/cueSheetUtils'
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

  const spacingStyle = {
    '--cue-row-padding-y': `${spacing.rowPaddingPx}px`,
  } as CSSProperties

  return (
    <article className="cue-sheet" style={spacingStyle}>
      <section className="cue-sheet-page">
        {renderTable(rows, data.groomName, data.brideName)}
      </section>
    </article>
  )
}
