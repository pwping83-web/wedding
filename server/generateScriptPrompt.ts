export type GenerateScriptKind = 'order' | 'intro' | 'entrance'

export type GenerateScriptInput = {
  kind: GenerateScriptKind
  mood: string
  moodLabel: string
  title?: string
  relationship?: string
  entranceType?: 'groom' | 'bride'
  entranceDelaySeconds?: number
  groomName: string
  brideName: string
  mcName?: string
  vocalistName?: string
  speakerName?: string
  ceremonyTime?: string
  venue?: string
  currentScript?: string
}

const MOOD_GUIDE: Record<string, string> = {
  bright: '밝고 경쾌하고 하객의 리액션을 자연스럽게 이끄는 캐주얼한 MC 톤',
  solemn: '경건하고 차분하며 절제된 어투. 종교색은 배제',
  formal: '무게 있고 격식 있는 전통 예식 MC 톤. 존댓말과 경어',
  warm: '따뜻하고 감성적인 톤. 짧은 감정선과 진심 어린 표현',
}

function estimateEntranceScriptChars(seconds: number): number {
  return Math.max(28, Math.round(seconds * 4.5))
}

function entranceTimingPromptLines(
  entranceType: 'groom' | 'bride',
  seconds: number,
): string[] {
  const sec = Math.max(5, Math.round(seconds))
  const role = entranceType === 'groom' ? '신랑' : '신부'
  const charTarget = estimateEntranceScriptChars(sec)
  const nameVar = entranceType === 'groom' ? '{신랑이름}' : '{신부이름}'

  return [
    `입장 구분: ${role} 입장`,
    `타이밍: 입장 음악 시작 직후 MC가 멘트를 시작하고, 멘트가 끝나는 시점에 정확히 ${sec}초가 되어 ${role}이 입장해야 합니다.`,
    `분량: MC 보통 속도로 읽었을 때 낭독 시간이 ${sec}초(±2초)가 되도록 작성. 약 ${charTarget}자 내외.`,
    `${sec <= 12 ? '1~2문장' : sec <= 20 ? '2~4문장' : '3~5문장'}으로 작성하되, 반드시 ${sec}초 낭독 분량에 맞출 것.`,
    `멘트 말미에 "${role} 입장!" 또는 "${role} ${nameVar}님 입장!" 큐로 마무리.`,
    '음악이 흐르는 동안 하객을 안내하고 기다림을 채우는 입장 전 MC 멘트입니다.',
    '긴 식순 설명이나 다른 순서 언급 금지. 입장 타이밍에 맞는 멘트만 작성.',
  ]
}

export function buildGenerateSystemPrompt(kind: GenerateScriptKind): string {
  if (kind === 'entrance') {
    return '한국어 웨딩 사회자 입장 타이밍 MC 멘트만 작성합니다. 지정된 초(낭독 시간)에 정확히 맞는 분량만 출력합니다.'
  }
  return '한국어 웨딩 사회자 큐시트만 작성합니다. 짧은 한 줄 답변은 절대 하지 않습니다.'
}

export function buildGeneratePrompt(input: GenerateScriptInput): string {
  const moodGuide = MOOD_GUIDE[input.mood] ?? MOOD_GUIDE.formal
  const names = `신랑 ${input.groomName}, 신부 ${input.brideName}, 사회자 ${input.mcName ?? '사회자'}`
  const base = [
    '당신은 한국 웨딩 MC 큐시트 전문 작가입니다.',
    `분위기: ${input.moodLabel} (${moodGuide})`,
    `예식 정보: ${names}, 예식시각 ${input.ceremonyTime ?? '미정'}, 장소 ${input.venue ?? '미정'}`,
  ]

  if (input.kind === 'entrance') {
    const entranceType = input.entranceType ?? 'groom'
    const seconds = Math.max(5, Math.round(input.entranceDelaySeconds ?? 15))
    base.push('규칙:')
    base.push('- 이름은 {신랑이름}, {신부이름}, {사회자이름}, {예식시각}, {예식장} 변수 형태로 작성')
    base.push('- 따옴표, 제목, 번호, 마크다운 없이 멘트 본문만 출력')
    base.push(...entranceTimingPromptLines(entranceType, seconds))
  } else {
    base.push('규칙:')
    base.push('- 한 줄짜리 짧은 멘트 금지. 최소 3문장, 보통 4~8문장의 실제 사회자 낭독용 큐시트')
    base.push('- 박수/맞절/입장 등 현장 진행 큐(예: "신랑 입장!")를 자연스럽게 포함')
    base.push('- 이름은 {신랑이름}, {신부이름}, {사회자이름}, {축가자이름}, {축사자이름}, {예식시각}, {예식장} 변수 형태로 작성')
    base.push('- 따옴표, 제목, 번호, 마크다운 없이 멘트 본문만 출력')
  }

  if (input.kind === 'order') {
    base.push(`식순 항목: ${input.title}`)
    base.push('해당 순서에서 사회자가 하객에게 읽을 멘트를 작성하세요.')
  } else if (input.kind === 'intro') {
    base.push(`소개 대상: ${input.relationship} 관계의 인물`)
    base.push('축가/축사 등에서 사회자가 해당 인물을 소개하는 멘트를 작성하세요.')
  }

  if (input.currentScript?.trim()) {
    if (input.kind === 'entrance') {
      const seconds = Math.max(5, Math.round(input.entranceDelaySeconds ?? 15))
      base.push(
        `아래는 기존 멘트입니다. 낭독 시간 ${seconds}초 분량을 유지하되 표현을 새로 작성하세요:`,
      )
    } else {
      base.push('아래는 기존 멘트입니다. 같은 정보량과 길이를 유지하되 표현을 새로 작성하세요:')
    }
    base.push(input.currentScript.trim())
  }

  return base.join('\n')
}

export function maxCompletionTokens(kind: GenerateScriptKind): number {
  return kind === 'entrance' ? 400 : 1200
}
