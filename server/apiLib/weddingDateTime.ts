/** 예식 일·시각 파싱 (관리자 목록 정렬·지난 예식 판별 공용) */
export function parseWeddingDateTime(weddingDate: string, weddingTime: string): Date | null {
  const date = weddingDate.trim()
  if (!date) return null

  const time = weddingTime.trim()
  if (!time) {
    const endOfDay = new Date(`${date}T23:59:59`)
    return Number.isNaN(endOfDay.getTime()) ? null : endOfDay
  }

  const match = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (match) {
    const h = match[1].padStart(2, '0')
    const m = match[2]
    const s = match[3] ?? '00'
    const parsed = new Date(`${date}T${h}:${m}:${s}`)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const fallback = new Date(`${date}T${time}`)
  return Number.isNaN(fallback.getTime()) ? null : fallback
}

export function isWeddingPast(weddingDate: string, weddingTime: string, now = new Date()): boolean {
  const when = parseWeddingDateTime(weddingDate, weddingTime)
  if (!when) return false
  return when.getTime() < now.getTime()
}

export type WeddingScheduleFields = { weddingDate: string; weddingTime: string }

/** 다가오는 예식 먼저, 각 그룹은 일시 오름차순 */
export function compareWeddingSchedule(a: WeddingScheduleFields, b: WeddingScheduleFields, now = new Date()): number {
  const pastA = isWeddingPast(a.weddingDate, a.weddingTime, now)
  const pastB = isWeddingPast(b.weddingDate, b.weddingTime, now)
  if (pastA !== pastB) return pastA ? 1 : -1

  const whenA = parseWeddingDateTime(a.weddingDate, a.weddingTime)
  const whenB = parseWeddingDateTime(b.weddingDate, b.weddingTime)
  const tA = whenA?.getTime() ?? Number.MAX_SAFE_INTEGER
  const tB = whenB?.getTime() ?? Number.MAX_SAFE_INTEGER
  return tA - tB
}

export function sortByWeddingSchedule<T extends WeddingScheduleFields>(items: T[], now = new Date()): T[] {
  return [...items].sort((a, b) => compareWeddingSchedule(a, b, now))
}
