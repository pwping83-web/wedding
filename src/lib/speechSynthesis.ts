let activeId: string | null = null

function pickKoreanVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === 'ko-KR') ??
    voices.find((v) => v.lang.startsWith('ko')) ??
    null
  )
}

export function speakText(
  text: string,
  itemId: string,
  onStateChange?: (speakingId: string | null) => void,
): boolean {
  if (!('speechSynthesis' in window)) return false

  if (activeId === itemId && speechSynthesis.speaking) {
    speechSynthesis.cancel()
    activeId = null
    onStateChange?.(null)
    return true
  }

  speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ko-KR'
  utterance.rate = 0.92
  utterance.pitch = 1

  const voice = pickKoreanVoice()
  if (voice) utterance.voice = voice

  utterance.onend = () => {
    activeId = null
    onStateChange?.(null)
  }
  utterance.onerror = () => {
    activeId = null
    onStateChange?.(null)
  }

  activeId = itemId
  onStateChange?.(itemId)
  speechSynthesis.speak(utterance)
  return true
}

export function stopSpeaking(onStateChange?: (speakingId: string | null) => void) {
  if ('speechSynthesis' in window) speechSynthesis.cancel()
  activeId = null
  onStateChange?.(null)
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// Chrome loads voices asynchronously
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynthesis.getVoices()
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices()
}
