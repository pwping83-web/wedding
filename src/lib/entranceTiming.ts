import type { AppData, Marker, SetData } from '../data'
import type { EntranceAudioSignalMode, EntranceKind } from './entranceAudioSignal'
import {
  resolveEntranceAudioSignalPhrase,
} from './entranceAudioSignal'

export function entranceMarkerKey(type: 'groom' | 'bride'): 'groomMarkers' | 'brideMarkers' {
  return type === 'groom' ? 'groomMarkers' : 'brideMarkers'
}

export function entranceTrackTitleKey(
  type: 'groom' | 'bride',
): 'groomEntranceTrackTitle' | 'brideEntranceTrackTitle' {
  return type === 'groom' ? 'groomEntranceTrackTitle' : 'brideEntranceTrackTitle'
}

export function entranceTimingEnabledKey(
  type: 'groom' | 'bride',
): 'groomEntranceTimingEnabled' | 'brideEntranceTimingEnabled' {
  return type === 'groom' ? 'groomEntranceTimingEnabled' : 'brideEntranceTimingEnabled'
}

export function isEntranceTimingEnabled(data: AppData, type: 'groom' | 'bride'): boolean {
  return data[entranceTimingEnabledKey(type)] ?? false
}

export function getEntranceMarker(
  data: AppData,
  type: 'groom' | 'bride',
): Marker | null {
  return data[entranceMarkerKey(type)][0] ?? null
}

export function getEntranceTrackTitle(data: AppData, type: 'groom' | 'bride'): string {
  return data[entranceTrackTitleKey(type)].trim()
}

export function parseEntranceSeconds(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return null
  const seconds = parseInt(digits, 10)
  if (Number.isNaN(seconds) || seconds <= 0) return null
  return Math.min(seconds, 300)
}

export function hasEntranceTiming(data: AppData, type: 'groom' | 'bride'): boolean {
  if (!isEntranceTimingEnabled(data, type)) return false
  const marker = getEntranceMarker(data, type)
  return marker != null && marker.time > 0
}

export function hasEntranceTimingConfig(data: AppData, type: 'groom' | 'bride'): boolean {
  return isEntranceTimingEnabled(data, type)
}

export function isMarchEntranceTimingEnabled(data: AppData): boolean {
  return data.marchEntranceTimingEnabled ?? false
}

export function getMarchEntranceTrackTitle(data: AppData): string {
  return data.marchEntranceTrackTitle.trim()
}

export function isKindEntranceTimingEnabled(data: AppData, kind: EntranceKind): boolean {
  if (kind === 'march') return isMarchEntranceTimingEnabled(data)
  return isEntranceTimingEnabled(data, kind)
}

export function getKindEntranceTrackTitle(data: AppData, kind: EntranceKind): string {
  if (kind === 'march') return getMarchEntranceTrackTitle(data)
  return getEntranceTrackTitle(data, kind)
}

export function getEntranceAudioSignalMode(
  data: AppData,
  kind: EntranceKind,
): EntranceAudioSignalMode {
  if (kind === 'march') {
    return data.marchAudioSignalMode === 'custom' ? 'custom' : 'preset'
  }
  const marker = getEntranceMarker(data, kind)
  return marker?.audioSignalMode === 'custom' ? 'custom' : 'preset'
}

export function getEntranceAudioSignalCustom(data: AppData, kind: EntranceKind): string {
  if (kind === 'march') return data.marchAudioSignalCustom ?? ''
  return getEntranceMarker(data, kind)?.audioSignalCustom ?? ''
}

export function getEntranceAudioSignalPhrase(data: AppData, kind: EntranceKind): string {
  return resolveEntranceAudioSignalPhrase(
    kind,
    getEntranceAudioSignalMode(data, kind),
    getEntranceAudioSignalCustom(data, kind),
  )
}

export function hasKindEntranceTimingConfig(data: AppData, kind: EntranceKind): boolean {
  return isKindEntranceTimingEnabled(data, kind)
}

export function setMarchEntranceTimingEnabled(setData: SetData, enabled: boolean) {
  setData((prev) => {
    if (enabled) return { ...prev, marchEntranceTimingEnabled: true }
    return {
      ...prev,
      marchEntranceTimingEnabled: false,
      marchEntranceTrackTitle: '',
      marchAudioSignalMode: 'preset',
      marchAudioSignalCustom: '',
    }
  })
}

export function setMarchEntranceTrackTitle(setData: SetData, title: string) {
  setData((prev) => ({ ...prev, marchEntranceTrackTitle: title }))
}

export function setMarchEntranceAudioSignal(
  setData: SetData,
  mode: EntranceAudioSignalMode,
  custom?: string,
) {
  setData((prev) => ({
    ...prev,
    marchAudioSignalMode: mode,
    marchAudioSignalCustom: mode === 'custom' ? (custom ?? prev.marchAudioSignalCustom) : '',
  }))
}

export function setEntranceAudioSignal(
  setData: SetData,
  type: 'groom' | 'bride',
  mode: EntranceAudioSignalMode,
  custom?: string,
) {
  const key = entranceMarkerKey(type)
  setData((prev) => {
    const existing = prev[key][0]
    const marker: Marker = existing
      ? {
          ...existing,
          audioSignalMode: mode,
          audioSignalCustom: mode === 'custom' ? (custom ?? existing.audioSignalCustom ?? '') : undefined,
        }
      : {
          id: `${type}-timing`,
          time: 0,
          scriptVariant: 0,
          audioSignalMode: mode,
          audioSignalCustom: mode === 'custom' ? (custom ?? '') : undefined,
        }
    return { ...prev, [key]: [marker] }
  })
}

export function setKindEntranceTimingEnabled(
  setData: SetData,
  kind: EntranceKind,
  enabled: boolean,
) {
  if (kind === 'march') {
    setMarchEntranceTimingEnabled(setData, enabled)
    return
  }
  setEntranceTimingEnabled(setData, kind, enabled)
}

export function setKindEntranceTrackTitle(
  setData: SetData,
  kind: EntranceKind,
  title: string,
) {
  if (kind === 'march') {
    setMarchEntranceTrackTitle(setData, title)
    return
  }
  setEntranceTrackTitle(setData, kind, title)
}

export function setKindEntranceAudioSignal(
  setData: SetData,
  kind: EntranceKind,
  mode: EntranceAudioSignalMode,
  custom?: string,
) {
  if (kind === 'march') {
    setMarchEntranceAudioSignal(setData, mode, custom)
    return
  }
  setEntranceAudioSignal(setData, kind, mode, custom)
}

export function setEntranceTimingEnabled(
  setData: SetData,
  type: 'groom' | 'bride',
  enabled: boolean,
) {
  const enabledKey = entranceTimingEnabledKey(type)
  const markerKey = entranceMarkerKey(type)
  const trackKey = entranceTrackTitleKey(type)
  const orderTitle = type === 'groom' ? '신랑 입장' : '신부 입장'

  setData((prev) => {
    if (enabled) {
      return { ...prev, [enabledKey]: true }
    }
    return {
      ...prev,
      [enabledKey]: false,
      [markerKey]: [],
      [trackKey]: '',
      orderItems: prev.orderItems.map((item) =>
        item.title === orderTitle ? { ...item, customScript: undefined } : item,
      ),
    }
  })
}

export function setEntranceTrackTitle(
  setData: SetData,
  type: 'groom' | 'bride',
  title: string,
) {
  const key = entranceTrackTitleKey(type)
  setData((prev) => ({ ...prev, [key]: title }))
}

export function setEntranceTimingSeconds(
  setData: SetData,
  type: 'groom' | 'bride',
  seconds: number | null,
) {
  const key = entranceMarkerKey(type)
  const orderTitle = type === 'groom' ? '신랑 입장' : '신부 입장'

  setData((prev) => {
    if (seconds == null) {
      return {
        ...prev,
        [key]: [],
        orderItems: prev.orderItems.map((item) =>
          item.title === orderTitle ? { ...item, customScript: undefined } : item,
        ),
      }
    }

    const existing = prev[key][0]
    const marker: Marker = existing
      ? { ...existing, time: seconds, customScript: undefined }
      : { id: `${type}-timing`, time: seconds, scriptVariant: 0 }

    return {
      ...prev,
      [key]: [marker],
      orderItems: prev.orderItems.map((item) =>
        item.title === orderTitle ? { ...item, customScript: undefined } : item,
      ),
    }
  })
}
