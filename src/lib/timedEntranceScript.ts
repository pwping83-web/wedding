import type { AppData } from '../data'
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

/** 타이밍·음원 시작 언급 없이 N초 낭독을 채우는 짧은 입장 멘트 */
const shortBases: Record<'groom' | 'bride', Record<AppData['mood'], string>> = {
  groom: {
    formal:
      '다음은 신랑 입장이 있겠습니다. 하객 여러분, 정중한 박수로 맞이해 주시기 바랍니다. 신랑 입장',
    bright: '자, 이제 신랑 입장이 있겠습니다! 하객 여러분, 힘찬 박수로 맞이해 주세요! 신랑 입장',
    solemn:
      '다음은 신랑 입장 순서입니다. 고요히, 따뜻한 박수로 맞이해 주시기 바랍니다. 신랑 입장',
    warm: '이제 신랑 입장이 있겠습니다. 하객 여러분, 따뜻한 박수로 응원해 주세요. 신랑 입장',
  },
  bride: {
    formal:
      '이제 오늘의 주인공, 신부 입장이 있겠습니다. 하객 여러분, 정중한 박수 부탁드립니다. 신부 입장',
    bright: '드디어 신부 입장! 하객 여러분, 크게 박수 쳐 주세요! 신부 입장',
    solemn:
      '다음은 신부 입장 순서입니다. 마음을 모아 따뜻하게 맞이해 주시기 바랍니다. 신부 입장',
    warm: '이제 아름다운 신부님이 등장합니다. 하객 여러분, 설레는 박수로 맞이해 주세요. 신부 입장',
  },
}

const longFillers: Record<AppData['mood'], string> = {
  formal: ' 잠시만, 하객 여러분께서는 자리에서 편히 기다려 주시기 바랍니다.',
  bright: ' 조금만 더 설레는 마음으로 함께해 주세요!',
  solemn: ' 잠시 고요히, 마음을 모아 주시기 바랍니다.',
  warm: ' 잠시만, 따뜻한 마음으로 함께해 주세요.',
}

const extraFillers: Record<'groom' | 'bride', Record<AppData['mood'], string>> = {
  groom: {
    formal: ' 오늘의 주인공을 향한 기대감이 점점 높아지고 있습니다.',
    bright: ' 멋진 신랑님, 곧 눈앞에 펼쳐집니다!',
    solemn: ' 경건한 마음으로 함께해 주시기 바랍니다.',
    warm: ' 설레는 순간, 함께 기다려 주세요.',
  },
  bride: {
    formal: ' 오늘 가장 아름다운 순간을 향해 마음을 모아 주시기 바랍니다.',
    bright: ' 아름다운 신부님, 곧 등장합니다!',
    solemn: ' 조용히, 따뜻한 시선으로 함께해 주세요.',
    warm: ' 감동의 순간이 다가오고 있습니다.',
  },
}

/**
 * 입장 타이밍용 MC 멘트 — 본문에 "N초 후", "음악 시작" 등 절대 포함하지 않음.
 * 타이밍은 큐시트 곡명 옆 별도 표기.
 */
export function getTimedEntranceScript(
  type: 'groom' | 'bride',
  data: AppData,
  seconds: number,
): string {
  const sec = Math.max(5, Math.round(seconds))
  const ctx = buildScriptContext(data)
  const target = estimateEntranceScriptChars(sec)

  let raw = applyScriptVars(shortBases[type][data.mood], ctx)

  if (sec >= 10) raw = padToTarget(raw, target, longFillers[data.mood])
  if (sec >= 18) raw = padToTarget(raw, target, extraFillers[type][data.mood])

  return raw.trim()
}
