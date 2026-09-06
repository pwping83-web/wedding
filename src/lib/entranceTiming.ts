import type { AppData, Marker, SetData } from '../data'

export function entranceMarkerKey(type: 'groom' | 'bride'): 'groomMarkers' | 'brideMarkers' {
  return type === 'groom' ? 'groomMarkers' : 'brideMarkers'
}

export function entranceTrackTitleKey(
  type: 'groom' | 'bride',
): 'groomEntranceTrackTitle' | 'brideEntranceTrackTitle' {
  return type === 'groom' ? 'groomEntranceTrackTitle' : 'brideEntranceTrackTitle'
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
  if (!data.entranceTimingEnabled) return false
  const marker = getEntranceMarker(data, type)
  return marker != null && marker.time > 0
}

export function hasEntranceTimingConfig(data: AppData, type: 'groom' | 'bride'): boolean {
  if (!data.entranceTimingEnabled) return false
  return hasEntranceTiming(data, type) || getEntranceTrackTitle(data, type).length > 0
}

export function clearAllEntranceTiming(setData: SetData) {
  setData((prev) => ({
    ...prev,
    entranceTimingEnabled: false,
    groomMarkers: [],
    brideMarkers: [],
    groomEntranceTrackTitle: '',
    brideEntranceTrackTitle: '',
    orderItems: prev.orderItems.map((item) =>
      item.title === '신랑 입장' || item.title === '신부 입장'
        ? { ...item, customScript: undefined }
        : item,
    ),
  }))
}

export function enableEntranceTiming(setData: SetData) {
  setData((prev) => ({ ...prev, entranceTimingEnabled: true }))
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
