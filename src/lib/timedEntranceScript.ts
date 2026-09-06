import type { AppData } from '../data'
import { applyScriptVars, buildScriptContext } from '../data'

/** 입장 낭독 — MC가 여유 있게 읽는 속도 기준(초당 약 5.8자) */
export function estimateEntranceScriptChars(seconds: number): number {
  return Math.max(32, Math.round(seconds * 5.8))
}

const ENTRANCE_CUE = {
  groom: '신랑 입장!',
  bride: '신부 입장!',
} as const

/**
 * 웨딩홀 MC 실제 입장 멘트 — 순서대로 이어 붙임.
 * 타이밍·음악·기다림 언급 없이, 큐 직전까지 자연스럽게 시간을 채움.
 */
const bodyParts: Record<
  'groom' | 'bride',
  Record<AppData['mood'], string[]>
> = {
  groom: {
    formal: [
      '다음은 신랑입장이 있겠습니다.',
      '오늘의 주인공, 이제 이 자리에 섭니다.',
      '늘 성실하고 반듯했던 사람, 이제 한 여자의 남편으로 새 인생을 시작하려 합니다.',
      '지금까지와는 또 다른 새로운 인생을 향해 걸어 나오는 신랑에게 우리 모두의 축복과 박수를 보내주시기 바랍니다.',
      '사랑하는 신부 {신부이름} 양의 든든한 반쪽이 될 신랑 {신랑이름} 군입니다.',
    ],
    bright: [
      '자, 다음은 신랑입장이 있겠습니다!',
      '오늘의 주인공, 이제 이 자리에 섭니다.',
      '늘 유쾌하고 든든했던 사람, 이제 한 여자의 남편으로 새 인생을 시작하려 합니다.',
      '신랑 {신랑이름} 군의 힘찬 첫걸음에 큰 축복과 박수 부탁드립니다!',
    ],
    solemn: [
      '다음은 신랑입장이 있겠습니다.',
      '오늘의 주인공, 이제 이 자리에 섭니다.',
      '묵묵히 자신의 길을 걸어온 사람, 이제 한 여자의 남편으로 새 인생을 시작하려 합니다.',
      '신랑 {신랑이름} 군의 첫걸음에 따뜻한 축복과 박수를 보내주시기 바랍니다.',
    ],
    warm: [
      '이제 신랑입장이 있겠습니다.',
      '오늘의 주인공, 이제 이 자리에 섭니다.',
      '늘 성실하고 따뜻했던 사람, 이제 한 여자의 남편으로 새 인생을 시작하려 합니다.',
      '사랑하는 신부의 든든한 반쪽이 될 신랑에게 우리 모두의 축복과 박수를 보내주시기 바랍니다.',
    ],
  },
  bride: {
    formal: [
      '세상에서 가장 사랑스럽고 아름다운 걸음이 시작됩니다.',
      '오늘, 한 남자에게 인생의 가장 소중한 선물이 되어줄 사람, 그리고 오늘부로 한 가정의 든든한 반쪽이 될 사람입니다.',
      '지금까지와는 또 다른 새로운 인생을 향해 걸어 나오는 신부에게 우리 모두의 축복과 박수를 보내주시기 바랍니다.',
      '오늘 가장 빛나는 주인공, 신부 {신부이름} 양입니다.',
    ],
    bright: [
      '자, 세상에서 가장 사랑스럽고 아름다운 걸음이 시작됩니다!',
      '오늘 한 남자에게 인생의 가장 소중한 선물이 되어줄 사람입니다.',
      '새로운 인생을 향해 걸어 나오는 신부에게 큰 축복과 박수를 보내주세요!',
      '오늘 가장 빛나는 주인공, 신부 {신부이름} 양입니다.',
    ],
    solemn: [
      '다음은 신부입장이 있겠습니다.',
      '세상에서 가장 곱고 아름다운 걸음이 시작됩니다.',
      '한 남자의 평생 반려가 될 사람, 지금까지와는 다른 새로운 삶을 향해 걸어 나오는 신부에게 따뜻한 축복과 박수를 보내주시기 바랍니다.',
      '오늘의 주인공, 신부 {신부이름} 양입니다.',
    ],
    warm: [
      '이제 신부입장이 있겠습니다.',
      '세상에서 가장 사랑스럽고 아름다운 걸음이 시작됩니다.',
      '오늘, 한 남자에게 인생의 가장 소중한 선물이 되어줄 사람입니다.',
      '지금까지와는 또 다른 새로운 인생을 향해 걸어 나오는 신부에게 우리 모두의 축복과 박수를 보내주시기 바랍니다.',
      '사랑스러운 신부 {신부이름} 양입니다.',
    ],
  },
}

/** 본문이 짧을 때만 큐 앞에 추가 */
const bridgeFillers: Record<
  'groom' | 'bride',
  Record<AppData['mood'], string[]>
> = {
  groom: {
    formal: ['사랑하는 사람을 향한 신랑의 걸음에 마음을 모아 주시기 바랍니다.'],
    bright: ['오늘 가장 멋진 주인공의 걸음에 힘찬 환호를 더해 주세요!'],
    solemn: ['두 사람의 새 출발을 경건한 마음으로 함께해 주시기 바랍니다.'],
    warm: ['사랑하는 사람을 향한 신랑의 걸음에 따뜻한 마음을 더해 주세요.'],
  },
  bride: {
    formal: ['오늘 가장 빛나는 순간에 따뜻한 마음을 더해 주시기 바랍니다.'],
    bright: ['오늘 가장 아름다운 주인공에게 환한 박수를 더해 주세요!'],
    solemn: ['고요히, 두 사람의 새 출발을 마음 깊이 축복해 주시기 바랍니다.'],
    warm: ['따뜻한 마음으로, 신부의 첫걸음을 함께 축복해 주시기 바랍니다.'],
  },
}

/** 초 수에 따라 붙일 문장 수 — 14초면 보통 3문장(웨딩홀 실제 분량) */
function partCountForSeconds(seconds: number, totalParts: number): number {
  if (seconds <= 6) return Math.min(1, totalParts)
  if (seconds <= 10) return Math.min(2, totalParts)
  if (seconds <= 16) return Math.min(3, totalParts)
  if (seconds <= 22) return Math.min(4, totalParts)
  return totalParts
}

function assembleTimedScript(
  type: 'groom' | 'bride',
  mood: AppData['mood'],
  ctx: ReturnType<typeof buildScriptContext>,
  seconds: number,
): string {
  const cue = ENTRANCE_CUE[type]
  const parts = bodyParts[type][mood].map((part) => applyScriptVars(part, ctx))
  const count = partCountForSeconds(seconds, parts.length)
  let body = parts.slice(0, count).join(' ')

  const target = estimateEntranceScriptChars(seconds)
  const minBody = target - cue.length - 1
  const bridges = bridgeFillers[type][mood]
  let bridgeIdx = 0
  while (body.length < minBody && bridgeIdx < bridges.length && count >= parts.length) {
    body = `${body} ${bridges[bridgeIdx]}`
    bridgeIdx += 1
  }

  return `${body} ${cue}`.trim()
}

/**
 * 입장 타이밍용 MC 멘트 — 본문에 "N초 후", "음악 시작" 등 절대 포함하지 않음.
 * 타이밍은 큐시트 곡명 옆 별도 표기. 입장 큐는 항상 맨 마지막.
 */
export function getTimedEntranceScript(
  type: 'groom' | 'bride',
  data: AppData,
  seconds: number,
): string {
  const sec = Math.max(5, Math.round(seconds))
  const ctx = buildScriptContext(data)
  return assembleTimedScript(type, data.mood, ctx, sec)
}
