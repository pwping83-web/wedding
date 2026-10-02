/**
 * Figma Make — 1단계: 랜딩만 세련화 (한국어·현재 구현 기준)
 * `pnpm figma:refine-landing-prompt`
 */

export const FIGMA_LANDING_BASELINE_RULES = [
  '지금 저장소의 `src/screens/Landing.tsx` + `LandingDecor.tsx` + `index.css`의 `.landing-*` 가 **정답 베이스라인**입니다. 레이아웃·섹션 순서·기능은 유지하고, 색·간격·타이포·장식만 미세하게 다듬으세요.',
  'Figma가 만든 영문 타임라인(5:30 PM, Dinner service, Set as current, Edit, Host controls 등)은 **이 프로젝트가 아닙니다**. 그런 화면으로 교체·추가하지 마세요.',
  '**모든 사용자-facing 텍스트는 한국어**입니다. 버튼·라벨·체크리스트·링크·섹션 제목에 영어 문장을 넣지 마세요. (브랜드 "(ENX 웨딩 · MC)" 정도만 허용)',
  '랜딩만 수정하세요. BasicInfo 이후 플로우·Preview·Admin·MC/Video 페이지는 이번 턴에서 건드리지 마세요.',
  '세련함 = 절제입니다. 새 컴포넌트 남발, 레이아웃 전면 재배치, 글래스/네온/과한 일러스트 금지.',
]

/** Landing.tsx에 있는 카피 — Figma가 임의로 바꾸지 말 것 */
export const FIGMA_LANDING_COPY = {
  eyebrow: '예식 큐시트',
  title: 'AI 자동 식순 큐시트',
  subtitle: '(ENX 웨딩 · MC)',
  description: '예식 정보 · 식순 · 멘트까지\n사회자에게 바로 전달하세요.',
  features: ['5단계 간편 입력', 'AI 멘트 자동 생성', '사회자 이메일 전달 · 인쇄'],
  ctaPrimary: '시작하기',
  ctaSecondary: '↓ MC 진행 영상 · 식전영상 무료 제작',
  marketingSection1Title: '식순을 만든 MC가\n직접 진행합니다',
  marketingSection1Button: 'MC 소개 보기',
  marketingSection2Button: '자세히 보기',
} as const

export const FIGMA_LANDING_LAYOUT_SPEC = [
  '430px 모바일 셸, 세로 스크롤. 상단 히어로는 거의 한 화면 높이(`min-h-[calc(100dvh-3.25rem)]`), CTA는 히어로 하단 고정 느낌.',
  '위→아래 순서: (장식 SVG 상단) → MC 로고(`LandingMcLogo`) → eyebrow(작은 캡션) → h1 → ENX 부제 → 설명 2줄 → 기능 3줄 카드(`landing-card`) → **시작하기** 버튼 → MC/식전영상 링크 → 아래 `LandingMarketingSections` (유튜브 2블록 + secondary 버튼).',
  '배경: warm cream (`landing-bg`), bokeh 3개, 좌우 floral corner — **지금 톤 유지**, 채도만 살짝 정리 가능.',
  '기능 카드: 중앙 정렬 리스트, 체크(`landing-check`) + 한 줄 기능명. 카드는 흰 surface + 얇은 border + 부드러운 shadow.',
  'Primary CTA: 넓은 pill형 버튼(`Btn`), 지금처럼 charcoal fill도 가능 — lavender로 바꿀 경우 Guidelines #8B7FC7, **문구는 반드시 「시작하기」**.',
  '하단 마케팅: `landing-card` 반복, 제목 17px semibold 가운데, 본문 13px, `[word-break:keep-all]` 유지.',
]

export const FIGMA_LANDING_POLISH_TARGETS = [
  'eyebrow: 한국어 「예식 큐시트」, letter-spacing 약간, rose-gold 또는 muted lavender — **Wedding Cue Sheet 영문 사용 금지**',
  'h1 「AI 자동 식순 큐시트」: display serif(Lora 권장) + 본문 sans(Nunito 권장) — Inter만 쓰지 말 것',
  '로고·floral·bokeh와 텍스트 z-index: `landing-content`가 장식 위에 읽히게',
  '기능 카드·버튼 좌우 max-width 300px 전후 정렬 통일',
  'secondary 링크: 12px muted, hover underline — 카피 그대로',
]

export function buildFigmaLandingRefinementPrompt(): string {
  const lines: string[] = [
    '# Figma Make — 1단계: 랜딩 페이지만 (한국어 · 현재 UI 기준 미세 개선)',
    '',
    '이전에 만든 영문/서양식 웨딩 타임라인 UI는 **완전히 무시**하고, 아래 스펙대로 **한국어 랜딩만** 다듬어 주세요. 지금 프리뷰(크림 배경, GM 로고, 「AI 자동 식순 큐시트」, 「시작하기」)가 맞는 방향입니다.',
    '',
    '## 절대 규칙',
    ...FIGMA_LANDING_BASELINE_RULES.map((c) => `- ${c}`),
    '',
    '## 고정 카피 (한 글자도 영어로 바꾸지 말 것)',
    `- eyebrow: ${FIGMA_LANDING_COPY.eyebrow}`,
    `- 제목: ${FIGMA_LANDING_COPY.title}`,
    `- 부제: ${FIGMA_LANDING_COPY.subtitle}`,
    `- 설명: ${FIGMA_LANDING_COPY.description.replace('\n', ' / ')}`,
    `- 기능: ${FIGMA_LANDING_COPY.features.join(' · ')}`,
    `- 버튼: ${FIGMA_LANDING_COPY.ctaPrimary}`,
    `- 링크: ${FIGMA_LANDING_COPY.ctaSecondary}`,
    '',
    '## 레이아웃 (Landing.tsx 구조)',
    ...FIGMA_LANDING_LAYOUT_SPEC.map((c) => `- ${c}`),
    '',
    '## 세련화 포인트 (이것만 손대기)',
    ...FIGMA_LANDING_POLISH_TARGETS.map((c) => `- ${c}`),
    '',
    '## 수정 파일',
    '- `src/screens/Landing.tsx`',
    '- `src/components/LandingDecor.tsx`',
    '- `src/components/LandingMarketingSections.tsx` (카피 유지, spacing/타이po만)',
    '- `src/index.css` (`.landing-*`, `@theme` 폰트)',
    '- 필요 시 `src/components/mobile/Btn.tsx` (랜딩 CTA만, 다른 화면은 다음 단계)',
    '',
    '## 완료 기준',
    '- `src/figma/stories/landing.stories.tsx` kit / dev 프리뷰에서 **전부 한국어**로 보임',
    '- 히어로 구조·버튼 동작(onStart, 스크롤 링크) 동일',
    '- “지금보다 이상해짐” 없음: 간격·폰트·색만 5~15% 수준의 정 refinement',
    '- OK 받은 뒤에만 2단계( BasicInfo~ ) 진행',
  ]
  return lines.join('\n')
}
