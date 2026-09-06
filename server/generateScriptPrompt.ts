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

const HUMAN_MC_QUALITY_RULES = [
  '실제 예식장에서 사회자가 그대로 읽어도 어색하지 않은 완성 대본으로 작성',
  '로봇 같은 요약문 금지: "안내드립니다", "진행하겠습니다"만 반복하지 말 것',
  '문장은 짧고 길게 섞어 낭독 리듬을 만들 것. 쉼표와 문장부호를 자연스럽게 사용',
  '하객에게 실제 행동을 안내해야 하는 순간에는 박수, 기립, 주목, 이동 안내를 명확히 포함',
  '감성 문구는 한두 문장만. 과장된 시, 광고 카피, 뻔한 AI식 미사여구는 금지',
  '반드시 변수 표기는 {신랑이름}, {신부이름}, {사회자이름}, {축가자이름}, {축사자이름}, {예식시각}, {예식장} 형태 유지',
  '따옴표, 제목, 번호, 마크다운, "사회자:" 같은 접두어 없이 멘트 본문만 출력',
]

const ORDER_GUIDES: Record<string, string[]> = {
  '안내멘트(10분전)': [
    '구성: 예식 예정 안내 -> 착석 안내 -> 휴대폰 진동 안내 -> 축복에 대한 감사',
    '톤: 차분하고 명확한 방송 안내. 감성 과다 금지.',
  ],
  '안내멘트(5분전)': [
    '구성: 곧 시작 안내 -> 자리 정돈 -> 휴대폰 진동 -> 예식 집중 요청',
    '톤: 10분 전 안내보다 짧고 단정하게.',
  ],
  개식사: [
    '구성: 개식 선언 -> 하객 감사 -> 사회자 소개 -> 주례 없는 예식이면 그 취지 안내',
    '실제 멘트 예시 톤: "지금부터 신랑 {신랑이름} 군과 신부 {신부이름} 양의 결혼식을 시작하겠습니다."',
  ],
  '화촉점화 안내': [
    '구성: 양가 어머님 입장 안내 -> 박수 요청 -> 화촉점화 진행 -> 맞절/내빈 인사 -> 착석 안내',
    '현장 큐는 괄호로 짧게 표시 가능: (점화 후), (인사 후), (착석 확인)',
  ],
  '신랑 입장': [
    '구성: 신랑 소개 -> 인생의 새 출발 서사 -> 축복과 박수 요청 -> "신랑 입장!"',
    '톤 예시: "다음은 신랑입장이 있겠습니다. 오늘의 주인공, 이제 이 자리에 섭니다. 늘 성실하고 반듯했던 사람, 이제 한 여자의 남편으로 새 인생을 시작하려 합니다. 신랑 입장!"',
  ],
  '신부 입장': [
    '구성: 아름다운 걸음/주인공 소개 -> 인생의 선물/반쪽 서사 -> 축복과 박수 요청 -> "신부 입장!"',
    '톤 예시: "세상에서 가장 사랑스럽고 아름다운 걸음이 시작됩니다. 오늘, 한 남자에게 인생의 가장 소중한 선물이 되어줄 사람입니다. 지금까지와는 또 다른 새로운 인생을 향해 걸어 나오는 신부에게 우리 모두의 축복과 박수를 보내주시기 바랍니다. 신부 입장!"',
  ],
  '신랑신부 맞절': [
    '구성: 두 사람 마주 보기 안내 -> 증인과 가족 앞의 예 예고 -> "신랑, 신부 맞절" 큐 -> 내빈 방향 안내',
    '설명보다 동작 큐가 중요. 길게 감성문으로 늘리지 말 것.',
  ],
  '신랑신부 혼인서약서 낭독': [
    '구성: 혼인서약 의미 한 문장 -> 낭독자 안내 -> 경청 요청 -> (혼인서약서 낭독)',
    '직접 서약의 진정성을 살리되 과장하지 말 것.',
  ],
  성혼선언문: [
    '구성: 성혼선언 의미 -> 낭독자 안내 -> 박수/경청 요청 -> (성혼선언문 낭독)',
    '아버님/사회자 등 낭독자를 임의로 바꾸지 말고 기존 멘트의 정보를 유지.',
  ],
  축가: [
    '구성: 축가 순서 안내 -> 축가자 소개 -> 관계가 있으면 자연스럽게 언급 -> 큰 박수 요청',
    '축가 제목을 모르면 지어내지 말 것.',
  ],
  축사: [
    '구성: 축사 순서 안내 -> 축사자 소개 -> 두 사람을 향한 축복의 말씀을 청함 -> 박수 요청',
    '축사 내용을 대신 말하지 말 것.',
  ],
  '부모님과 하객분들께 인사': [
    '구성: 부모님 감사 의미 -> 신부측 부모님 인사 -> 신랑측 부모님 인사 -> 내빈 인사',
    '현장 이동 큐와 인사 큐를 명확히 넣을 것.',
  ],
  행진: [
    '구성: 예식 마무리 -> 부부의 첫걸음 의미 -> 큰 박수와 축복 요청 -> "신랑신부 행진!"',
    '가장 힘 있게 마무리. 지나치게 장황하지 않게.',
  ],
  폐식사: [
    '구성: 폐식 선언 -> 참석 감사 -> 사진 촬영/이동 안내 -> 마무리 인사',
    '실제 현장 안내를 놓치지 말 것.',
  ],
}

function estimateEntranceScriptChars(seconds: number): number {
  return Math.max(32, Math.round(seconds * 5.8))
}

function entranceTimingPromptLines(
  entranceType: 'groom' | 'bride',
  seconds: number,
): string[] {
  const sec = Math.max(5, Math.round(seconds))
  const role = entranceType === 'groom' ? '신랑' : '신부'
  const charTarget = estimateEntranceScriptChars(sec)

  return [
    `입장 구분: ${role} 입장`,
    `분량: MC 보통 속도로 읽었을 때 낭독 시간이 ${sec}초(±2초)가 되도록 작성. 약 ${charTarget}자 내외.`,
    `${sec <= 12 ? '1~2문장' : sec <= 20 ? '2~4문장' : '3~5문장'}으로 작성하되, 반드시 ${sec}초 낭독 분량에 맞출 것.`,
    `멘트 말미에 "${role} 입장!" 큐로 마무리.`,
    '구성: 주인공 소개 -> 인생의 새 출발/반쪽/선물 같은 짧은 서사 -> 하객의 축복과 박수 요청 -> 입장 큐.',
    '신부 톤 예시: "세상에서 가장 사랑스럽고 아름다운 걸음이 시작됩니다. 오늘, 한 남자에게 인생의 가장 소중한 선물이 되어줄 사람, 그리고 오늘부로 한 가정의 든든한 반쪽이 될 사람입니다. 지금까지와는 또 다른 새로운 인생을 향해 걸어 나오는 신부에게 우리 모두의 축복과 박수를 보내주시기 바랍니다. 신부 입장!"',
    '신랑 톤 예시: "다음은 신랑입장이 있겠습니다. 오늘의 주인공, 이제 이 자리에 섭니다. 늘 성실하고 반듯했던 사람, 이제 한 여자의 남편으로 새 인생을 시작하려 합니다. 신랑 입장!"',
    '절대 금지: 멘트 본문에 "N초", "초 후", "음악이 시작", "입장 음악", "타이밍", "기다려 주세요" 등 초·음원·입장 시점·대기 안내를 직접 언급하지 말 것. 타이밍은 큐시트 별도 표기.',
    '금지 톤: 짧고 건조한 안내문, 대기 안내, 장난스러운 말투, "잠시만 기다려 주세요"류 필러.',
    '입장 큐 직전까지 주인공을 소개하고 분위기를 채우는 이야기만 작성. 긴 식순 설명이나 다른 순서 언급 금지.',
  ]
}

export function buildGenerateSystemPrompt(kind: GenerateScriptKind): string {
  if (kind === 'entrance') {
    return [
      '당신은 10년 차 한국 웨딩 전문 사회자 대본 작가입니다.',
      '입장 멘트는 실제 예식장에서 바로 읽을 수 있는 품질이어야 합니다.',
      '로봇 같은 안내문, 짧은 요약, 타이밍 설명은 실패입니다.',
    ].join('\n')
  }
  return [
    '당신은 10년 차 한국 웨딩 전문 사회자 대본 작가입니다.',
    '출력은 실제 예식장에서 사회자가 그대로 읽을 수 있는 완성 MC 멘트여야 합니다.',
    '로봇 같은 안내문, 짧은 요약, 블로그 설명문, 제목/번호/마크다운은 실패입니다.',
  ].join('\n')
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
    base.push(...HUMAN_MC_QUALITY_RULES.map((rule) => `- ${rule}`))
    base.push(...entranceTimingPromptLines(entranceType, seconds))
  } else {
    base.push('규칙:')
    base.push(...HUMAN_MC_QUALITY_RULES.map((rule) => `- ${rule}`))
    base.push('- 한 줄짜리 짧은 멘트 금지. 보통 4~8문장, 긴 진행 항목은 문단을 나누어 작성')
    base.push('- 박수/맞절/입장/착석/이동 등 현장 진행 큐를 자연스럽게 포함')
    base.push('- 신랑·신부에 대한 정보가 없으면 구체적 직업, 성격, 사연을 지어내지 말고 보편적인 예식 표현으로 작성')
  }

  if (input.kind === 'order') {
    base.push(`식순 항목: ${input.title}`)
    const guides = input.title ? ORDER_GUIDES[input.title] : undefined
    if (guides) {
      base.push('식순별 작성 가이드:')
      base.push(...guides.map((guide) => `- ${guide}`))
    }
    base.push('해당 순서에서 사회자가 하객에게 실제로 읽을 최종 멘트를 작성하세요.')
  } else if (input.kind === 'intro') {
    base.push(`소개 대상: ${input.relationship} 관계의 인물`)
    base.push('구성: 다음 순서 안내 -> 소개 대상과 신랑신부의 관계 -> 준비해 준 마음에 대한 감사 -> 큰 박수 요청')
    base.push('소개 대상의 직업, 성격, 에피소드는 입력에 없으면 지어내지 말 것.')
    base.push('축가/축사 등에서 사회자가 해당 인물을 소개하는 실제 낭독 멘트를 작성하세요.')
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
