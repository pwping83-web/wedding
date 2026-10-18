/** 식순 불러오기 — 전화번호로 연결할 신랑·신부 (DB에 cueSavePhone 없을 때) */
export const CUE_SAVE_PHONE_ALIASES: Record<string, { groomName: string; brideName: string }> = {
  '01096228025': { groomName: '김성환', brideName: '심미영' },
  '01044941754': { groomName: '김성환', brideName: '심미영' },
  '01076723370': { groomName: '조기철', brideName: '김민선' },
  '01098768716': { groomName: '조기철', brideName: '김민선' },
  '01080196543': { groomName: '최인호', brideName: '김동미' },
  '01048696543': { groomName: '최인호', brideName: '김동미' },
}

export function coupleForSavePhone(normalizedPhone: string) {
  return CUE_SAVE_PHONE_ALIASES[normalizedPhone] ?? null
}
