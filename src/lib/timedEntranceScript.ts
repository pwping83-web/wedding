import type { AppData, Mood } from '../data'
import { applyScriptVars, buildScriptContext } from '../data'

/** MC 보통 속도(분당 약 270자) 기준 낭독 글자 수 */
export function estimateEntranceScriptChars(seconds: number): number {
  return Math.max(28, Math.round(seconds * 4.5))
}

function padToTarget(text: string, target: number, filler: string): string {
  let result = text
  while (result.length < target - 8) {
    result += filler
  }
  return result
}

const timedBodies: Record<
  Mood,
  Record<'groom' | 'bride', (sec: number) => string>
> = {
  formal: {
    groom: (sec) =>
      `지금부터 신랑 입장 음악이 시작됩니다. 약 ${sec}초 후, {신랑이름}님께서 입장하시겠습니다. 하객 여러분께서는 정중한 박수로 맞이해 주시기 바랍니다.`,
    bride: (sec) =>
      `지금부터 신부 입장 음악이 시작됩니다. 약 ${sec}초 후, {신부이름}님께서 입장하시겠습니다. 오늘 가장 아름다운 주인공을 따뜻한 박수로 환영해 주시기 바랍니다.`,
  },
  bright: {
    groom: (sec) =>
      `자, 음악 주세요! ${sec}초 뒤 신랑 {신랑이름}님 입장! 오늘 가장 멋진 남자, 박수 준비해 주세요!`,
    bride: (sec) =>
      `드디어! ${sec}초 뒤 신부 {신부이름}님 입장! 오늘 가장 아름다운 분, 크게 박수 부탁드려요!`,
  },
  solemn: {
    groom: (sec) =>
      `잠시 고요히, 신랑 입장 음악을 시작하겠습니다. ${sec}초 후 {신랑이름}님께서 입장하십니다. 경건한 마음으로 함께 맞이해 주시기 바랍니다.`,
    bride: (sec) =>
      `신부 입장 음악을 시작합니다. ${sec}초 후 {신부이름}님께서 입장하십니다. 조용히, 따뜻한 마음으로 함께해 주시기 바랍니다.`,
  },
  warm: {
    groom: (sec) =>
      `따뜻한 음악과 함께, ${sec}초 뒤 신랑 {신랑이름}님이 입장하십니다. 오늘 이 특별한 순간, 함께 기다려 주시고 박수로 응원해 주세요.`,
    bride: (sec) =>
      `감성적인 음악과 함께, ${sec}초 뒤 신부 {신부이름}님이 입장하십니다. 오늘 가장 빛나는 순간, 마음을 담아 박수로 축복해 주세요.`,
  },
}

const longFillers: Record<Mood, string> = {
  formal: ' 잠시만 기다려 주시면, 곧 입장이 이어집니다.',
  bright: ' 조금만 기다려 주세요, 곧 등장합니다!',
  solemn: ' 잠시만, 곧 입장이 시작됩니다.',
  warm: ' 잠시만, 설레는 순간이 다가오고 있습니다.',
}

export function getTimedEntranceScript(
  type: 'groom' | 'bride',
  data: AppData,
  seconds: number,
): string {
  const sec = Math.max(5, Math.round(seconds))
  const ctx = buildScriptContext(data)
  const target = estimateEntranceScriptChars(sec)
  let raw = timedBodies[data.mood][type](sec)

  if (sec >= 14) raw = padToTarget(raw, target, longFillers[data.mood])
  if (sec >= 20) {
    raw = padToTarget(
      raw,
      target,
      type === 'groom'
        ? ' 신랑님의 멋진 입장을 함께 기다려 주세요.'
        : ' 신부님의 아름다운 입장을 함께 기다려 주세요.',
    )
  }

  return applyScriptVars(raw.trim(), ctx)
}
