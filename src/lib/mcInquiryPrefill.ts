import type { AppData } from '../data'

const STORAGE_KEY = 'wedding-mc-inquiry-prefill'

export type McInquiryPrefill = {
  groomName: string
  brideName: string
  date: string
  time: string
  venue: string
  savedAt: string
}

export function buildMcInquiryPrefill(data: AppData): McInquiryPrefill {
  return {
    groomName: data.groomName.trim(),
    brideName: data.brideName.trim(),
    date: data.date.trim(),
    time: data.time.trim(),
    venue: data.venue.trim(),
    savedAt: new Date().toISOString(),
  }
}

export function saveMcInquiryPrefill(data: AppData): McInquiryPrefill {
  const payload = buildMcInquiryPrefill(data)
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore quota */
  }
  return payload
}

export function loadMcInquiryPrefill(): McInquiryPrefill | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as McInquiryPrefill
    if (!parsed.groomName && !parsed.brideName && !parsed.venue) return null
    return parsed
  } catch {
    return null
  }
}

export function clearMcInquiryPrefill() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function hasMcInquiryPrefill(payload: McInquiryPrefill | null): boolean {
  if (!payload) return false
  return Boolean(
    payload.groomName || payload.brideName || payload.date || payload.venue,
  )
}
