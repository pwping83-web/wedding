/** QCT(큐시트) 클라우드 저장·불러오기용 — 숫자만 키 */
export function normalizeCueSavePhone(raw: string): string {
  return raw.replace(/\D/g, '')
}

export function isValidCueSavePhone(normalized: string): boolean {
  return /^01[016789]\d{7,8}$/.test(normalized)
}

export function formatCueSavePhoneDisplay(normalized: string): string {
  const digits = normalizeCueSavePhone(normalized)
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return digits
}
