/** 예식 일시가 현재보다 이전인지 (관리자 목록·모달 구분용) */
export function isWeddingPast(weddingDate: string, weddingTime: string, now = new Date()): boolean {
  const when = parseWeddingDateTime(weddingDate, weddingTime)
  if (!when) return false
  return when.getTime() < now.getTime()
}

function parseWeddingDateTime(weddingDate: string, weddingTime: string): Date | null {
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
