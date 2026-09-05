/** 입장 음원 업로드 · 타이밍 조절 기능 (false = UI·이메일·큐시트에서 숨김) */
export const ENTRANCE_AUDIO_TIMING_ENABLED = false

export const FLOW_STEP_COUNT = ENTRANCE_AUDIO_TIMING_ENABLED ? 6 : 5

export function flowStep(screen: 'basic' | 'order' | 'persons' | 'atmosphere' | 'preview'): number {
  if (ENTRANCE_AUDIO_TIMING_ENABLED) {
    return { basic: 1, order: 3, persons: 4, atmosphere: 5, preview: 6 }[screen]
  }
  return { basic: 1, order: 2, persons: 3, atmosphere: 4, preview: 5 }[screen]
}
