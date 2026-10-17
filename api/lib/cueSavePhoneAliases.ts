/** 식순 불러오기 — 전화번호로 연결할 신랑·신부 (DB에 cueSavePhone 없을 때) */
export const CUE_SAVE_PHONE_ALIASES: Record<string, { groomName: string; brideName: string }> = {
  '01096228025': { groomName: '김성환', brideName: '심미영' },
}

export function coupleForSavePhone(normalizedPhone: string) {
  return CUE_SAVE_PHONE_ALIASES[normalizedPhone] ?? null
}
