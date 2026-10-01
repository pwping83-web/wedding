/** 추천 문구 풀 — "추천 문구" 버튼으로 순환 */

export type DualLineSuggestion = {
  line1: string
  line2: string
}

/** 줄당 7자, 두 줄 */
export const SUGGESTIONS_7x2: DualLineSuggestion[] = [
  { line1: '좋아해', line2: '처음부터' },
  { line1: '너라서', line2: '다 좋아' },
  { line1: '첫눈에', line2: '반했어' },
  { line1: '매일이', line2: '데이트' },
  { line1: '싸워도', line2: '결국 너' },
  { line1: '미안해', line2: '사랑해' },
  { line1: '평생', line2: '함께해' },
  { line1: '이제', line2: '우리 가족' },
  { line1: '처음 만난 날', line2: '모든 게 시작됐어' },
  { line1: '1,000일의', line2: '기록' },
  { line1: '싸워도 금방', line2: '다시 웃던 우리' },
]

/** 줄당 12자, 두 줄 */
export const SUGGESTIONS_12x2: DualLineSuggestion[] = [
  { line1: '행복한 시간', line2: '늘 너와 함께' },
  { line1: '우리가 함께해 온', line2: '수많은 계절들' },
  { line1: '이제는 평생', line2: '함께하려 해요' },
  { line1: '그날 네가 웃어줘서', line2: '지금의 우리가 있어' },
  { line1: '별일 없는 하루도', line2: '너랑이면 특별해' },
  { line1: '용기 내서 했던 말', line2: '"우리 만나볼래?"' },
  { line1: '같이 먹고 같이 걷고', line2: '같이 웃었던 날들' },
  { line1: '낯선 곳에서도', line2: '네 손만 잡으면 집이었어' },
  { line1: '서운했던 날도', line2: '서로를 알아가는 시간' },
  { line1: '남은 모든 날을', line2: '너와 함께하고 싶어' },
  { line1: '받은 사랑만큼', line2: '잘 살겠습니다' },
]

/** 한 줄 10자 */
export const SUGGESTIONS_10: string[] = [
  '너와 나의 1일',
  '우리의 이야기',
  'OUR STORY',
  '우리 결혼합니다',
  '와주셔서 고마워요',
  '나랑 결혼해줄래?',
]

/** 엔딩 P11 전용 */
export const SUGGESTIONS_P11: string[] = [
  '나랑 결혼해줄래?',
  '와주셔서 고마워요',
  '우리 결혼합니다',
  '함께해 주세요',
]
