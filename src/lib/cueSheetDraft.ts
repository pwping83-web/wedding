import type { AppData } from '../data'
import { initialData, withFixedMc } from '../data'

const STORAGE_PREFIX = 'wedding-cue-draft:'

export type StoredCueSheetDraft = {
  savedAt: string
  data: AppData
}

export function draftStorageKey(groomName: string, brideName: string): string {
  return `${STORAGE_PREFIX}${groomName.trim()}::${brideName.trim()}`
}

export function normalizeLoadedAppData(raw: Partial<AppData> | null | undefined): AppData | null {
  if (!raw || typeof raw !== 'object') return null
  if (!Array.isArray(raw.orderItems) || raw.orderItems.length === 0) return null

  return {
    ...initialData,
    ...raw,
    groomName: raw.groomName?.trim() ?? '',
    brideName: raw.brideName?.trim() ?? '',
    date: raw.date ?? '',
    time: raw.time ?? '',
    venue: raw.venue ?? '',
    style: raw.style ?? initialData.style,
    mood: raw.mood ?? initialData.mood,
    marriageDeclarationReader: raw.marriageDeclarationReader ?? initialData.marriageDeclarationReader,
    orderItems: raw.orderItems,
    persons: withFixedMc(Array.isArray(raw.persons) ? raw.persons : []),
    groomMarkers: Array.isArray(raw.groomMarkers) ? raw.groomMarkers : [],
    brideMarkers: Array.isArray(raw.brideMarkers) ? raw.brideMarkers : [],
    groomAudio: raw.groomAudio ?? null,
    brideAudio: raw.brideAudio ?? null,
    groomEntranceTimingEnabled: Boolean(raw.groomEntranceTimingEnabled),
    brideEntranceTimingEnabled: Boolean(raw.brideEntranceTimingEnabled),
    groomEntranceTrackTitle: raw.groomEntranceTrackTitle ?? '',
    brideEntranceTrackTitle: raw.brideEntranceTrackTitle ?? '',
    email: raw.email ?? '',
    coupleEmail: raw.coupleEmail ?? '',
  }
}

export function hasRestorableCueSheetData(data: Partial<AppData> | null | undefined): boolean {
  if (!data) return false
  return Boolean(
    data.groomName?.trim() &&
      data.brideName?.trim() &&
      data.date?.trim() &&
      data.time?.trim() &&
      data.venue?.trim() &&
      Array.isArray(data.orderItems) &&
      data.orderItems.length > 0,
  )
}

function scoreRestorableCueSheetData(data: Partial<AppData> | null | undefined): number {
  if (!hasRestorableCueSheetData(data)) return 0

  const items = Array.isArray(data?.orderItems) ? data.orderItems : []
  const customItems = items.filter((item) => {
    const id = item.id ?? ''
    return !/^(1|2|3|4|5|6|7|8|9|10|11|12|13)$/.test(id)
  }).length
  const scriptedItems = items.filter((item) => item.customScript?.trim()).length
  const people = Array.isArray(data?.persons) ? data.persons.length : 0

  return 100 + items.length + customItems * 20 + scriptedItems * 5 + people * 2
}

export function saveCueSheetDraft(data: AppData): void {
  const groomName = data.groomName.trim()
  const brideName = data.brideName.trim()
  if (!groomName || !brideName) return
  if (!hasRestorableCueSheetData(data)) return

  const payload: StoredCueSheetDraft = {
    savedAt: new Date().toISOString(),
    data,
  }

  try {
    localStorage.setItem(draftStorageKey(groomName, brideName), JSON.stringify(payload))
  } catch {
    // ignore quota / private mode errors
  }
}

export function loadCueSheetDraft(groomName: string, brideName: string): StoredCueSheetDraft | null {
  const groom = groomName.trim()
  const bride = brideName.trim()
  if (!groom || !bride) return null

  try {
    const raw = localStorage.getItem(draftStorageKey(groom, bride))
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredCueSheetDraft
    const data = normalizeLoadedAppData(parsed.data)
    if (!hasRestorableCueSheetData(data)) return null
    if (!data) return null
    return { savedAt: parsed.savedAt ?? new Date().toISOString(), data }
  } catch {
    return null
  }
}

export async function persistCueSheetDraftToServer(data: AppData): Promise<void> {
  const groomName = data.groomName.trim()
  const brideName = data.brideName.trim()
  if (!groomName || !brideName) return
  if (!hasRestorableCueSheetData(data)) return

  const response = await fetch(saveDraftApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  })

  if (!response.ok && response.status !== 503) {
    const result = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(result.error ?? '식순 자동 저장에 실패했습니다.')
  }
}

function draftApiBase() {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}api`.replace(/([^:]\/)\/+/g, '$1')
}

function loadApiUrl() {
  return `${draftApiBase()}/load-cue-sheet`
}

function saveDraftApiUrl() {
  return `${draftApiBase()}/save-cue-sheet-draft`
}

export async function fetchSavedCueSheetDraft(
  groomName: string,
  brideName: string,
): Promise<StoredCueSheetDraft | null> {
  const groom = groomName.trim()
  const bride = brideName.trim()
  if (!groom || !bride) return null

  const query = new URLSearchParams({ groomName: groom, brideName: bride })
  const response = await fetch(`${loadApiUrl()}?${query}`)
  if (response.status === 404) return null
  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(result.error ?? '저장된 식순을 불러오지 못했습니다.')
  }

  const result = (await response.json()) as { savedAt?: string; data?: Partial<AppData> }
  const data = normalizeLoadedAppData(result.data)
  if (!data) return null

  return {
    savedAt: result.savedAt ?? new Date().toISOString(),
    data,
  }
}

export async function resolveSavedCueSheetDraft(
  groomName: string,
  brideName: string,
): Promise<StoredCueSheetDraft | null> {
  const [remote, local] = await Promise.all([
    fetchSavedCueSheetDraft(groomName, brideName).catch(() => null),
    Promise.resolve(loadCueSheetDraft(groomName, brideName)),
  ])

  if (!remote && !local) return null
  if (!remote) return local
  if (!local) return remote

  const remoteScore = scoreRestorableCueSheetData(remote.data)
  const localScore = scoreRestorableCueSheetData(local.data)
  if (remoteScore !== localScore) return remoteScore > localScore ? remote : local

  return new Date(remote.savedAt).getTime() >= new Date(local.savedAt).getTime() ? remote : local
}
