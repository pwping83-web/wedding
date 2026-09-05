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
  labelMain: string
  labelSub?: string
  timeLabel: string
  script: string
  personNote?: string
  audioNote?: string
  timingNote?: string
}

export function getCueSheetRowLabel(title: string): { main: string; sub?: string } {
  if (title === '안내멘트(10분전)') return { main: '예식 시작', sub: '10분 전' }
  if (title === '안내멘트(5분전)') return { main: '예식 시작', sub: '5분 전' }
  if (title === '부모님과 하객분들께 인사') return { main: '부모님과\n하객분들께\n인사' }
  if (title === '신랑신부 혼인서약서 낭독') return { main: '혼인서약서\n낭독' }
  return { main: title }
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
