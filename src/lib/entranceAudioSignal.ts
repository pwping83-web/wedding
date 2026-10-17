export type EntranceKind = 'groom' | 'bride' | 'march'

export type EntranceAudioSignalMode = 'preset' | 'custom'

/** 예식장 음향 — MC 멘트 종료 시점 */
export const ENTRANCE_AUDIO_PLAY_CUE = '이 말이 끝나면 노래를 틀어주세요'

export const ENTRANCE_SIGNAL_PRESET: Record<EntranceKind, string> = {
  groom: '다음은 신랑 입장이 있겠습니다.',
  bride: '다음은 신부 입장이 있겠습니다.',
  march: '다음은 행진이 있겠습니다.',
}

export function entranceKindForTitle(title: string): EntranceKind | null {
  if (title === '신랑 입장') return 'groom'
  if (title === '신부 입장') return 'bride'
  if (title === '행진') return 'march'
  return null
}

function normalizeSignalPhrase(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return trimmed
  if (/[.!?]$/.test(trimmed)) return trimmed
  return `${trimmed}.`
}

export function resolveEntranceAudioSignalPhrase(
  kind: EntranceKind,
  mode: EntranceAudioSignalMode | undefined,
  custom: string | undefined,
): string {
  if (mode === 'custom') {
    const customPhrase = custom?.trim()
    if (customPhrase) return normalizeSignalPhrase(customPhrase)
  }
  return ENTRANCE_SIGNAL_PRESET[kind]
}

/** 큐시트 가로(멘트) 칸 — 예식장이 읽는 입장 타이밍 신호 */
export function formatEntranceAudioSignalBlock(signalPhrase: string): string {
  return `입장 타이밍 신호 — ${signalPhrase} (${ENTRANCE_AUDIO_PLAY_CUE})`
}
