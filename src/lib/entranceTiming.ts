import type { AppData, Marker, SetData } from '../data'

/** 미리보기에서 선택 가능한 입장 타이밍(음악 시작 후 초) */
export const ENTRANCE_TIMING_PRESETS = [10, 15, 20, 30, 45, 60] as const

export type EntranceTimingPreset = (typeof ENTRANCE_TIMING_PRESETS)[number]

export function entranceMarkerKey(type: 'groom' | 'bride'): 'groomMarkers' | 'brideMarkers' {
  return type === 'groom' ? 'groomMarkers' : 'brideMarkers'
}

export function getEntranceMarker(
  data: AppData,
  type: 'groom' | 'bride',
): Marker | null {
  return data[entranceMarkerKey(type)][0] ?? null
}

export function hasEntranceTiming(data: AppData, type: 'groom' | 'bride'): boolean {
  const marker = getEntranceMarker(data, type)
  return marker != null && marker.time > 0
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
