export type GenerateScriptKind = 'order' | 'intro' | 'entrance'

export type GenerateScriptInput = {
  kind: GenerateScriptKind
  mood: string
  moodLabel: string
  title?: string
  relationship?: string
  entranceType?: 'groom' | 'bride'
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

function buildPrompt(input: GenerateScriptInput): string {
  const moodGuide = MOOD_GUIDE[input.mood] ?? MOOD_GUIDE.formal
  const names = `신랑 ${input.groomName}, 신부 ${input.brideName}, 사회자 ${input.mcName ?? '사회자'}`
  const base = [
    '당신은 한국 웨딩 MC 큐시트 전문 작가입니다.',
    `분위기: ${input.moodLabel} (${moodGuide})`,
    `예식 정보: ${names}, 예식시각 ${input.ceremonyTime ?? '미정'}, 장소 ${input.venue ?? '미정'}`,
    '규칙:',
    '- 한 줄짜리 짧은 멘트 금지. 최소 3문장, 보통 4~8문장의 실제 사회자 낭독용 큐시트',
    '- 박수/맞절/입장 등 현장 진행 큐(예: "신랑 입장!")를 자연스럽게 포함',
    '- 이름은 {신랑이름}, {신부이름}, {사회자이름}, {축가자이름}, {축사자이름}, {예식시각}, {예식장} 변수 형태로 작성',
    '- 따옴표, 제목, 번호, 마크다운 없이 멘트 본문만 출력',
  ]

  if (input.kind === 'order') {
    base.push(`식순 항목: ${input.title}`)
    base.push('해당 순서에서 사회자가 하객에게 읽을 멘트를 작성하세요.')
  } else if (input.kind === 'intro') {
    base.push(`소개 대상: ${input.relationship} 관계의 인물`)
    base.push('축가/축사 등에서 사회자가 해당 인물을 소개하는 멘트를 작성하세요.')
  } else {
    base.push(`입장 구분: ${input.entranceType === 'groom' ? '신랑' : '신부'} 입장 직전 MC 멘트`)
    base.push('음악 타임라인 위 특정 시점에 읽은 뒤 입장이 이어지는 멘트입니다.')
  }

  if (input.currentScript?.trim()) {
    base.push('아래는 기존 멘트입니다. 같은 정보량과 길이를 유지하되 표현을 새로 작성하세요:')
    base.push(input.currentScript.trim())
  }

  return base.join('\n')
}

export async function generateScriptText(
  input: GenerateScriptInput,
  apiKey: string,
): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      temperature: 0.85,
      max_completion_tokens: 1200,
      messages: [
        {
          role: 'system',
          content:
            '한국어 웨딩 사회자 큐시트만 작성합니다. 짧은 한 줄 답변은 절대 하지 않습니다.',
        },
        { role: 'user', content: buildPrompt(input) },
      ],
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Groq API error (${response.status}): ${detail}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = payload.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('Groq returned empty script')
  return text
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T
}
