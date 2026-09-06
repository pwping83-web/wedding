import type { AppData, OrderItem } from '../data'
import { roleLabels } from '../data'
import {
  buildOrderItemsWithTime,
  entranceTypeForTitle,
  getEntranceCueMeta,
  getItemScriptForCueSheet,
  type CueSheetVariant,
} from './cueSheetUtils'

export type CueSheetDisplayRow = {
  id: string
  orderTitle: string
  labelMain: string
  script: string
  notes: string
  durationMin: number
}

/** 웨딩홀 양식과 동일한 좌측 라벨 */
export function getCueSheetRowLabel(title: string): string {
  switch (title) {
    case '신랑 입장':
      return '신랑입장'
    case '신부 입장':
      return '신부입장'
    case '신랑신부 맞절':
      return '맞절'
    case '신랑신부 혼인서약서 낭독':
      return '혼인서약서 낭독'
    case '부모님과 하객분들께 인사':
      return '부모님과 하객분들께 인사'
    case '행진':
      return '행진'
    case '폐식사':
      return '폐식사'
    default:
      return title.replace(/(\S)\(/g, '$1 (')
  }
}

function findPersonForItem(item: OrderItem, data: AppData) {
  return data.persons.find((person) => {
    if (item.title === '축가') return person.role === 'vocalist'
    if (item.title === '축사') return person.role === 'speaker'
    return false
  })
}

function buildRowNotes(
  item: OrderItem,
  variant: CueSheetVariant,
  person: ReturnType<typeof findPersonForItem>,
  entranceMeta: ReturnType<typeof getEntranceCueMeta>,
): string {
  const lines: string[] = []

  if (person && variant === 'mc') {
    lines.push(`${roleLabels[person.role]} ${person.name} (${person.relationship})`)
  }
  if (entranceMeta?.audioTitle) {
    lines.push(`곡: ${entranceMeta.audioTitle}`)
  }
  if (entranceMeta?.timingLabel) {
    lines.push(entranceMeta.timingLabel)
  }

  return lines.join('\n')
}

function buildCueSheetRowScript(item: OrderItem, data: AppData): string {
  const entranceType = entranceTypeForTitle(item.title)
  const entranceMeta = entranceType ? getEntranceCueMeta(data, entranceType) : null
  const script = getItemScriptForCueSheet(item, data)
  if (!entranceMeta) return script

  const parts: string[] = []
  if (entranceMeta.audioTitle) parts.push(`곡: ${entranceMeta.audioTitle}`)
  parts.push(script)
  if (entranceMeta.timingLabel) parts.push(entranceMeta.timingLabel)

  return parts.join('\n\n')
}

export function buildCueSheetDisplayRows(
  data: AppData,
  variant: CueSheetVariant,
): CueSheetDisplayRow[] {
  const items = buildOrderItemsWithTime(data)

  return items.map((item) => {
    const entranceType = entranceTypeForTitle(item.title)
    const entranceMeta = entranceType ? getEntranceCueMeta(data, entranceType) : null
    const person = findPersonForItem(item, data)

    return {
      id: item.id,
      orderTitle: item.title,
      labelMain: getCueSheetRowLabel(item.title),
      script: buildCueSheetRowScript(item, data),
      notes: buildRowNotes(item, variant, person, entranceMeta),
      durationMin: item.duration,
    }
  })
}

export function splitCueSheetPages(rows: CueSheetDisplayRow[]) {
  const brideEntranceIndex = rows.findIndex((row) => row.orderTitle === '신부 입장')
  if (brideEntranceIndex < 0) {
    return { firstPageRows: rows, secondPageRows: [] as CueSheetDisplayRow[] }
  }
  return {
    firstPageRows: rows.slice(0, brideEntranceIndex + 1),
    secondPageRows: rows.slice(brideEntranceIndex + 1),
  }
}
