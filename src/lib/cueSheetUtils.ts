import type { AppData, OrderItem } from '../data'
import {
  applyScriptVars,
  buildScriptContext,
  getOrderItemScript,
  getPersonIntroScript,
  moodLabels,
  roleLabels,
} from '../data'
import { ENTRANCE_AUDIO_TIMING_ENABLED } from '../config/features'
import {
  formatEntranceAudioSignalBlock,
  type EntranceKind,
} from './entranceAudioSignal'
import {
  getEntranceAudioSignalPhrase,
  getKindEntranceTrackTitle,
  isEntranceTimingEnabled,
  isKindEntranceTimingEnabled,
  isMarchEntranceTimingEnabled,
} from './entranceTiming'
import { getTimedEntranceScript } from './timedEntranceScript'

export type CueSheetVariant = 'mc' | 'couple'

export type EntranceCueMeta = {
  audioTitle: string | null
  timingLabel: string
  signalPhrase: string
  signalBlock: string
  script: string
  audioUrl: string | null
}

export function formatEntranceTiming(type: 'groom' | 'bride', seconds: number): string {
  const role = type === 'groom' ? '신랑' : '신부'
  return `${role} ${seconds}초 후 입장`
}

/** 큐시트 곡명 옆 인라인 표기 — "7초 후 입장" */
export function formatEntranceTimingInline(seconds: number): string {
  return `${seconds}초 후 입장`
}

export function getEntranceAudioTitle(
  audio: { fileName: string; trackTitle?: string } | null | undefined,
): string {
  if (!audio) return '없음'
  const title = audio.trackTitle?.trim() || audio.fileName.trim()
  return title || '없음'
}

function buildEntranceCueMetaForKind(
  data: AppData,
  kind: EntranceKind,
): EntranceCueMeta | null {
  if (!isKindEntranceTimingEnabled(data, kind)) return null

  const marker = kind === 'groom' ? data.groomMarkers[0] : kind === 'bride' ? data.brideMarkers[0] : null
  const seconds = marker?.time ?? 0
  const manualTitle = getKindEntranceTrackTitle(data, kind)
  const audio = kind === 'groom' ? data.groomAudio : kind === 'bride' ? data.brideAudio : null
  const audioTitle =
    manualTitle ||
    (ENTRANCE_AUDIO_TIMING_ENABLED && audio ? getEntranceAudioTitle(audio) : '') ||
    null

  const signalPhrase = getEntranceAudioSignalPhrase(data, kind)
  const signalBlock = formatEntranceAudioSignalBlock(signalPhrase)

  return {
    audioTitle,
    timingLabel:
      kind !== 'march' && seconds > 0 ? formatEntranceTiming(kind, seconds) : '',
    signalPhrase,
    signalBlock,
    script: kind === 'march' ? '' : getEntranceDisplayScript(kind, data),
    audioUrl: ENTRANCE_AUDIO_TIMING_ENABLED ? (audio?.url ?? null) : null,
  }
}

export function getEntranceCueMeta(
  data: AppData,
  type: 'groom' | 'bride',
): EntranceCueMeta | null {
  return buildEntranceCueMetaForKind(data, type)
}

export function getEntranceKindCueMeta(
  data: AppData,
  kind: EntranceKind,
): EntranceCueMeta | null {
  return buildEntranceCueMetaForKind(data, kind)
}

export function entranceTypeForTitle(title: string): 'groom' | 'bride' | null {
  if (title === '신랑 입장') return 'groom'
  if (title === '신부 입장') return 'bride'
  return null
}

export { entranceKindForTitle } from './entranceAudioSignal'

export function getEntranceDisplayScript(
  type: 'groom' | 'bride',
  data: AppData,
): string {
  const marker = type === 'groom' ? data.groomMarkers[0] : data.brideMarkers[0]
  const title = type === 'groom' ? '신랑 입장' : '신부 입장'
  const item = data.orderItems.find((orderItem) => orderItem.title === title)
  const ctx = buildScriptContext(data)

  if (marker?.customScript?.trim()) return applyScriptVars(marker.customScript, ctx)
  if (item?.customScript?.trim()) return applyScriptVars(item.customScript, ctx)

  if (marker && marker.time > 0 && isEntranceTimingEnabled(data, type)) {
    return getTimedEntranceScript(type, data, marker.time)
  }

  if (item) return getOrderItemScript(item, data.mood, data)
  return ''
}

export function getItemScriptForCueSheet(
  item: OrderItem,
  data: AppData,
): string {
  const entranceType = entranceTypeForTitle(item.title)
  if (entranceType) {
    const script = getEntranceDisplayScript(entranceType, data)
    if (script) return script
  }
  return getOrderItemScript(item, data.mood, data)
}

function addMinutes(base: string, mins: number) {
  if (!base) return '--:--'
  const [h, m] = base.split(':').map(Number)
  const total = h * 60 + m + mins
  const dh = Math.floor(total / 60) % 24
  const dm = total % 60
  return `${dh.toString().padStart(2, '0')}:${dm.toString().padStart(2, '0')}`
}

export function buildCueSheetPlainText(data: AppData, variant: CueSheetVariant): string {
  const lines: string[] = []
  const headerLabel = variant === 'mc' ? '사회자 큐시트' : '신랑·신부용 큐시트'

  lines.push(`${data.groomName || '신랑'} · ${data.brideName || '신부'} 결혼 예식`)
  lines.push(`${headerLabel}`)
  lines.push(`분위기: ${moodLabels[data.mood]}`)
  if (data.date) lines.push(`날짜: ${data.date}`)
  if (data.time) lines.push(`시간: ${data.time}`)
  if (data.venue) lines.push(`장소: ${data.venue}`)
  lines.push('')

  if (data.persons.length > 0) {
    lines.push('[ 참석 인물 ]')
    for (const person of data.persons) {
      lines.push(`- ${roleLabels[person.role]} ${person.name} (${person.relationship})`)
      if (variant === 'mc') {
        lines.push(`  소개: ${getPersonIntroScript(person)}`)
      }
    }
    lines.push('')
  }

  if (variant === 'mc') {
    const groomMeta = isEntranceTimingEnabled(data, 'groom')
      ? getEntranceCueMeta(data, 'groom')
      : null
    const brideMeta = isEntranceTimingEnabled(data, 'bride')
      ? getEntranceCueMeta(data, 'bride')
      : null
    const marchMeta = isMarchEntranceTimingEnabled(data)
      ? getEntranceKindCueMeta(data, 'march')
      : null
    if (groomMeta || brideMeta || marchMeta) {
      lines.push('[ 입장 타이밍 · 음악 시작 신호 ]')
      const pushKind = (label: string, meta: EntranceCueMeta) => {
        lines.push(`- ${label}: ${meta.signalBlock}`)
        if (meta.audioTitle) lines.push(`  곡: ${meta.audioTitle}`)
        if (meta.timingLabel) lines.push(`  ${meta.timingLabel}`)
      }
      if (groomMeta) pushKind('신랑', groomMeta)
      if (brideMeta) pushKind('신부', brideMeta)
      if (marchMeta) pushKind('행진', marchMeta)
      lines.push('')
    }
  }

  lines.push('[ 식순 ]')
  let cumulative = 0
  data.orderItems.forEach((item, index) => {
    const startMin = cumulative
    cumulative += item.duration
    const entranceKind =
      entranceTypeForTitle(item.title) ??
      (item.title === '행진' ? ('march' as const) : null)
    const entranceMeta = entranceKind ? getEntranceKindCueMeta(data, entranceKind) : null
    const script = getItemScriptForCueSheet(item, data)

    lines.push(`${index + 1}. ${item.title} (${addMinutes(data.time, startMin)} / ${item.duration}분)`)

    if (entranceMeta) {
      lines.push(`   🎬 ${entranceMeta.signalBlock}`)
      if (entranceMeta.audioTitle) lines.push(`   🎵 ${entranceMeta.audioTitle}`)
      if (entranceMeta.timingLabel) lines.push(`   ⏱ ${entranceMeta.timingLabel}`)
    }

    const person = data.persons.find((p) => {
      if (item.title === '축가') return p.role === 'vocalist'
      if (item.title === '축사') return p.role === 'speaker'
      return false
    })
    if (person) lines.push(`   👤 ${person.name} (${person.relationship})`)

    lines.push(`   ${script}`)
    lines.push('')
  })

  return lines.join('\n').trim()
}

export function buildOrderItemsWithTime(data: AppData) {
  let cumulative = 0
  return data.orderItems.map((item) => {
    const startMin = cumulative
    cumulative += item.duration
    return { ...item, startMin }
  })
}

export function addMinutesLabel(base: string, mins: number) {
  return addMinutes(base, mins)
}
