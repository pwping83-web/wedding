import type { AppData, OrderItem } from '../data'
import { getPersonIntroScript, roleLabels } from '../data'
import {
  addMinutesLabel,
  buildOrderItemsWithTime,
  entranceTypeForTitle,
  getEntranceCueMeta,
  getItemScriptForCueSheet,
  type CueSheetVariant,
} from './cueSheetUtils'
import { ENTRANCE_AUDIO_TIMING_ENABLED } from '../config/features'

export type CueSheetDisplayRow = {
  id: string
  orderTitle: string
  labelMain: string
  labelSub?: string
  timeLabel: string
  script: string
  personNote?: string
  audioNote?: string
  timingNote?: string
}

/** 웨딩홀 양식과 동일한 좌측 라벨 */
export function getCueSheetRowLabel(title: string): { main: string; sub?: string } {
  switch (title) {
    case '신랑 입장':
      return { main: '신랑입장' }
    case '신부 입장':
      return { main: '신부입장' }
    case '신랑신부 맞절':
      return { main: '맞절' }
    case '신랑신부 혼인서약서 낭독':
      return { main: '혼인서약서 낭독' }
    case '부모님과 하객분들께 인사':
      return { main: '부모님과 하객분들께 인사' }
    case '행진':
      return { main: '행진' }
    case '폐식사':
      return { main: '폐식사' }
    default:
      return { main: title }
  }
}

export function getRowFlexWeight(script: string): number {
  return Math.max(1, Math.round(script.length / 90))
}

function findPersonForItem(item: OrderItem, data: AppData) {
  return data.persons.find((person) => {
    if (item.title === '축가') return person.role === 'vocalist'
    if (item.title === '축사') return person.role === 'speaker'
    return false
  })
}

export function buildCueSheetDisplayRows(
  data: AppData,
  variant: CueSheetVariant,
): CueSheetDisplayRow[] {
  const items = buildOrderItemsWithTime(data)

  return items.map((item) => {
    const { main, sub } = getCueSheetRowLabel(item.title)
    const script = getItemScriptForCueSheet(item, data)
    const entranceType = entranceTypeForTitle(item.title)
    const entranceMeta =
      ENTRANCE_AUDIO_TIMING_ENABLED && entranceType
        ? getEntranceCueMeta(data, entranceType)
        : null
    const person = findPersonForItem(item, data)

    let personNote: string | undefined
    if (person && variant === 'mc') {
      personNote = `${roleLabels[person.role]} ${person.name} (${person.relationship}) — ${getPersonIntroScript(person)}`
    }

    return {
      id: item.id,
      orderTitle: item.title,
      labelMain: main,
      labelSub: sub,
      timeLabel: addMinutesLabel(data.time, item.startMin),
      script,
      personNote,
      audioNote: entranceMeta?.audioTitle ?? undefined,
      timingNote: entranceMeta?.timingLabel,
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
