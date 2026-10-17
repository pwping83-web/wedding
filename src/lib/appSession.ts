import { ENTRANCE_AUDIO_TIMING_ENABLED, FLOW_STEP_COUNT } from '../config/features'
import type { AppData } from '../data'
import { initialData, withFixedMc } from '../data'
import { normalizeLoadedAppData } from './cueSheetDraft'

/** landing·admin 제외 — 저장·복원 대상 화면 */
export type FlowScreen =
  | 'basic'
  | 'entrance'
  | 'order'
  | 'persons'
  | 'atmosphere'
  | 'preview'
  | 'output'

export type StoredAppSession = {
  savedAt: string
  screen: FlowScreen
  data: AppData
}

const SESSION_KEY = 'wedding-cue-app-session-v1'

export const FLOW_INPUT_STEP_COUNT = FLOW_STEP_COUNT

const SCREEN_LABELS: Record<FlowScreen, string> = {
  basic: '기본 정보',
  entrance: '입장·음원',
  order: '식순 편집',
  persons: '등록자',
  atmosphere: '분위기',
  preview: '미리보기',
  output: '전달·완성',
}

export function getFlowScreens(): FlowScreen[] {
  if (ENTRANCE_AUDIO_TIMING_ENABLED) {
    return ['basic', 'entrance', 'order', 'persons', 'atmosphere', 'preview', 'output']
  }
  return ['basic', 'order', 'persons', 'atmosphere', 'preview', 'output']
}

export function getScreenLabel(screen: FlowScreen): string {
  return SCREEN_LABELS[screen]
}

/** 1-based 입력 단계 (output는 FLOW_STEP_COUNT와 동일 취급) */
export function getFlowStepNumber(screen: FlowScreen): number {
  if (screen === 'output') return FLOW_STEP_COUNT
  if (ENTRANCE_AUDIO_TIMING_ENABLED) {
    const map: Record<FlowScreen, number> = {
      basic: 1,
      entrance: 2,
      order: 3,
      persons: 4,
      atmosphere: 5,
      preview: 6,
      output: 6,
    }
    return Math.min(map[screen], FLOW_STEP_COUNT)
  }
  const map: Record<FlowScreen, number> = {
    basic: 1,
    entrance: 1,
    order: 2,
    persons: 3,
    atmosphere: 4,
    preview: 5,
    output: 5,
  }
  return map[screen]
}

export function countRemainingFlowSteps(screen: FlowScreen): number {
  const step = getFlowStepNumber(screen)
  return Math.max(0, FLOW_STEP_COUNT - step + 1)
}

function normalizeSessionScreen(screen: string): FlowScreen | null {
  const allowed = new Set(getFlowScreens())
  if (screen === 'entrance' && !ENTRANCE_AUDIO_TIMING_ENABLED) return 'order'
  if (!allowed.has(screen as FlowScreen)) return null
  return screen as FlowScreen
}

/** QCT·서버 복원 시 마지막 화면 */
export function coerceFlowScreen(raw: string | undefined | null): FlowScreen {
  return normalizeSessionScreen(String(raw ?? 'basic').trim()) ?? 'basic'
}

export function hasSaveableProgress(data: AppData, screen: FlowScreen | 'landing'): boolean {
  if (screen !== 'landing') return true
  return Boolean(
    data.groomName.trim() ||
      data.brideName.trim() ||
      data.date ||
      data.time ||
      data.venue.trim() ||
      data.email.trim() ||
      data.coupleEmail.trim() ||
      data.cueSavePhone.trim(),
  )
}

export function saveAppSession(screen: FlowScreen | 'landing', data: AppData): void {
  if (screen === 'landing' && !hasSaveableProgress(data, 'landing')) return
  const flowScreen = screen === 'landing' ? ('basic' as FlowScreen) : screen
  const normalized = normalizeLoadedAppData(data) ?? { ...initialData, ...data, persons: withFixedMc(data.persons ?? []) }

  const payload: StoredAppSession = {
    savedAt: new Date().toISOString(),
    screen: flowScreen,
    data: normalized,
  }

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

export function loadAppSession(): StoredAppSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAppSession
    const screen = normalizeSessionScreen(parsed.screen)
    const data = normalizeLoadedAppData(parsed.data)
    if (!screen || !data) return null
    if (!hasSaveableProgress(data, screen)) return null
    return {
      savedAt: parsed.savedAt ?? new Date().toISOString(),
      screen,
      data,
    }
  } catch {
    return null
  }
}

export function clearAppSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export function formatSessionSavedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
