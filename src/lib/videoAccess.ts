const SESSION_KEY = 'wedding-video-access-code'

/** 사회 맡긴 고객 연락처 뒤 4자리 — 배포 전 고객별로 추가 */
export const VIDEO_ACCESS_CODES = ['2673'] as const

export function normalizeVideoAccessCode(input: string): string {
  return input.replace(/\D/g, '').slice(-4)
}

export function isValidVideoAccessCode(input: string): boolean {
  const code = normalizeVideoAccessCode(input)
  if (code.length !== 4) return false
  return (VIDEO_ACCESS_CODES as readonly string[]).includes(code)
}

export function unlockVideoAccess(code: string): boolean {
  if (!isValidVideoAccessCode(code)) return false
  try {
    sessionStorage.setItem(SESSION_KEY, normalizeVideoAccessCode(code))
  } catch {
    /* ignore */
  }
  return true
}

export function isVideoAccessUnlocked(): boolean {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    return Boolean(stored && isValidVideoAccessCode(stored))
  } catch {
    return false
  }
}

export function clearVideoAccess() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}
