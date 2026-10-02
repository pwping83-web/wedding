# Figma Make — 1단계: 랜딩만 (한국어 · 지금 UI 기준)

**이 파일 전체를 Make 채팅에 붙여 넣으세요.**  
(`pnpm figma:refine-landing-prompt` 와 동일)

---

이전에 생성된 **영문 타임라인**(5:30 PM, Dinner service, Set as current, Edit 등)은 이 프로젝트가 **아닙니다**. 버리고, 오른쪽 프리뷰처럼 **한국어 랜딩**만 미세하게 다듬어 주세요.

## 절대 규칙

- **베이스라인** = `src/screens/Landing.tsx` 현재 구조 (크림 배경, GM 로고, floral/bokeh, 기능 카드, 「시작하기」)
- **모든 UI 문구는 한국어** (영문 헤드라인·버튼·라벨 금지). `(ENX 웨딩 · MC)` 브랜드만 예외
- **랜딩만** 수정. 입력 플로우·Preview·Admin·MC/Video 페이지는 이번에 건드리지 않음
- 세련함 = **5~15% 수준**의 색·간격·폰트 정리. 레이아웃 전면 재설계 금지

## 고정 카피 (바꾸지 말 것)

| 위치 | 문구 |
|------|------|
| 캡션 | 예식 큐시트 |
| 제목 | AI 자동 식순 큐시트 |
| 부제 | (ENX 웨딩 · MC) |
| 설명 | 예식 정보 · 식순 · 멘트까지 / 사회자에게 바로 전달하세요. |
| 기능 3줄 | 5단계 간편 입력 · AI 멘트 자동 생성 · 사회자 이메일 전달 · 인쇄 |
| CTA | 시작하기 |
| 링크 | ↓ MC 진행 영상 · 식전영상 무료 제작 |
| 마케팅1 제목 | 식순을 만든 MC가 / 직접 진행합니다 |
| 버튼 | MC 소개 보기 · 자세히 보기 |

## 화면 구조 (위 → 아래)

1. 상단 floral SVG 장식 (`LandingFloralTop`, 좌우 corner)
2. **MC 로고** (`LandingMcLogo`)
3. 캡션 → **제목 h1** → ENX 부제 → 설명 2줄
4. **기능 카드** (`landing-card`, 체크 3줄, 가운데 정렬)
5. **시작하기** (Primary `Btn`, full width ~300px)
6. MC/식전영상 스크롤 링크
7. 아래 **LandingMarketingSections** (유튜브 2개 + secondary 버튼)

## 세련화만 허용하는 것

- 폰트: 제목 Lora(또는 유사 serif), 본문 Nunito(또는 유사 sans) — `index.css` + Google Fonts
- eyebrow **「예식 큐시트」** — ~~Wedding Cue Sheet~~ 영문 금지
- 카드 border/shadow, bokeh·floral 채도, CTA 대비 (charcoal 유지 또는 Guidelines lavender #8B7FC7)
- `landing-content` z-index로 텍스트 가독성

## 수정 파일

`Landing.tsx`, `LandingDecor.tsx`, `LandingMarketingSections.tsx`, `index.css` (`.landing-*`)

## 완료 확인

- kit: `src/figma/stories/landing.stories.tsx`
- 전부 한국어, 「시작하기」 동작 유지, **지금보다 덜 어색**할 것
