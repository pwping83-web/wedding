/**
 * Figma Make 채팅에 붙여 넣을 디자인 리파인 지시문.
 * `pnpm figma:refine-prompt` 로 콘솔 출력도 가능합니다.
 */

import { buildFigmaLandingRefinementPrompt } from './landingRefinementPrompt.ts'

export const FIGMA_DESIGN_REFINEMENT_GOAL =
  '한국어 ENX 웨딩 MC용 「AI 자동 식순 큐시트」 앱입니다. guidelines/Guidelines.md 톤에 맞게 **현재 코드 베이스**를 더 세련되게 다듬되, 레이아웃·기능·한국어 카피는 유지합니다. **1단계는 랜딩만** — `buildFigmaLandingRefinementPrompt()` / `pnpm figma:refine-landing-prompt` 내용을 먼저 따르세요.'

export const FIGMA_DESIGN_CONSTRAINTS = [
  '**UI 텍스트는 전부 한국어** (버튼·라벨·플레이스홀더·타임라인). 영문 Wedding Cue Sheet / Dinner service / Set as current 등 서양식 카피·UX로 바꾸지 말 것',
  '**베이스라인 = 지금 repo의 Landing.tsx 프리뷰**. Figma가 새로 그린 영문 타임라인 화면은 폐기하고, 미세 refinement만',
  '모바일 셸 너비 430px, `.mobile-shell-scaler` / `.mobile-shell` 구조 유지',
  '@media print 및 `.cue-sheet` 인쇄용 큐시트 스타일은 깨지지 않게 유지',
  '새 npm 의존성은 꼭 필요할 때만 추가',
  '과한 그라데이션·글래스모피즘·3D·네온 등 트렌디 과장은 금지 — 따뜻하고 절제된 고급 웨딩 톤',
  '정보 위계: 시간 → 제목 → 멘트 (가독성 최우선)',
]

export const FIGMA_TOKEN_ALIGNMENT = [
  'guidelines/Guidelines.md: 배경 #F5F2EE, Primary Lavender #8B7FC7, Secondary Sage #7E9478, Lora(제목) + Nunito(본문)',
  '현재 src/index.css: Inter 단일 폰트, bg #F4F3F0, primary 버튼이 charcoal 중심 — 가이드와 정렬·세련화 필요',
  '카드 radius 13–14px, 버튼/입력 10px, 칩 pill — Guidelines Shape & Radius 준수',
  '카드: 1px #E2DDD6 border, shadow 0 2px 8px rgba(0,0,0,0.06)',
]

export const FIGMA_SCREEN_TARGETS: {
  id: string
  path: string
  focus: string
}[] = [
  {
    id: 'landing',
    path: 'src/screens/Landing.tsx, src/components/LandingDecor.tsx, src/index.css (.landing-*)',
    focus:
      '히어로 타이포 계층, floral/bokeh 장식 절제, CTA 대비·호버, 마케팅 섹션 리듬과 여백',
  },
  {
    id: 'flow-screens',
    path: 'src/screens/BasicInfo.tsx ~ AtmosphereSelect.tsx, src/components/mobile/*',
    focus:
      'StepBar·PageHeader·Field·Btn·Card 통일, 포커스 링, secondary/ghost 버튼, 폼 카드 패딩 20–24px',
  },
  {
    id: 'preview-output',
    path: 'src/screens/Preview.tsx, FinalOutput.tsx, src/components/CueSheetDocument.tsx',
    focus: '미리보기와 최종 출력 화면의 신뢰감·정돈된 레이아웃 (인쇄본은 별도 .cue-sheet 규칙 유지)',
  },
  {
    id: 'marketing',
    path: 'src/screens/McPage.tsx, VideoPage.tsx, src/components/LandingMarketingSections.tsx',
    focus: '랜딩과 동일한 톤으로 MC·영상 랜딩 페이지 정렬',
  },
]

export const FIGMA_ANNOTATION_HINTS = [
  '랜딩: 제목·서브카피 letter-spacing과 line-height를 Lora 느낌의 세리프 display로, 본문은 Nunito 계열 sans로',
  'Primary CTA: Guidelines lavender fill (#8B7FC7), white text, 10px radius — charcoal 단색만 쓰지 말 것',
  'StepBar: 현재 단계 강조를 lavender-pale + lavender marker로 부드럽게',
  'ChipSelect / Atmosphere 카드: 선택 상태가 sage/lavender pale로 명확하되 과하지 않게',
  'BottomBar 고정 영역: 그림자·배경을 surface와 구분, safe-area 반영',
]

export function buildFigmaDesignRefinementPrompt(): string {
  const lines: string[] = [
    FIGMA_DESIGN_REFINEMENT_GOAL,
    '',
    '---',
    '',
    buildFigmaLandingRefinementPrompt(),
    '',
    '---',
    '',
    '## (2단계 이후) 전체 앱',
    '',
    '## 반드시 지킬 것',
    ...FIGMA_DESIGN_CONSTRAINTS.map((c) => `- ${c}`),
    '',
    '## 토큰·타이포 정렬 (Guidelines vs 현재 코드)',
    ...FIGMA_TOKEN_ALIGNMENT.map((c) => `- ${c}`),
    '',
    '## 화면별 작업 범위',
    ...FIGMA_SCREEN_TARGETS.map((s) => `- **${s.id}** (${s.path}): ${s.focus}`),
    '',
    '## 세부 디자인 노트 (Annotate for agent에 그대로 써도 됨)',
    ...FIGMA_ANNOTATION_HINTS.map((c) => `- ${c}`),
    '',
    '## 작업 방식',
    '- Plan mode가 가능하면 먼저 `src/index.css` @theme·font·공통 컴포넌트(Btn, Card, Field, StepBar) 순으로 계획을 세운 뒤 Build',
    '- `src/figma/stories/*.stories.tsx` kit 프리뷰로 화면별 결과 확인',
    '- 한 번에 전 화면을 갈아엎지 말고, 토큰 → 공통 컴포넌트 → Landing → 플로우 화면 순으로 점진 적용',
    '- 변경 후 dev 프리뷰(430px)에서 스크롤·하단 바·터치 타겟(최소 44px) 확인',
  ]
  return lines.join('\n')
}

/** Figma Make Annotate / 일괄 적용용 JSON */
export function buildFigmaAnnotationPayload() {
  return {
    goal: FIGMA_DESIGN_REFINEMENT_GOAL,
    constraints: FIGMA_DESIGN_CONSTRAINTS,
    screens: FIGMA_SCREEN_TARGETS,
    annotations: FIGMA_ANNOTATION_HINTS.map((instruction, index) => ({
      id: `refine-${index + 1}`,
      instruction,
    })),
    fullPrompt: buildFigmaDesignRefinementPrompt(),
  }
}
