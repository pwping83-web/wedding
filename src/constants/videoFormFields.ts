import {
  SUGGESTIONS_10,
  SUGGESTIONS_12x2,
  SUGGESTIONS_7x2,
  SUGGESTIONS_P11,
  type DualLineSuggestion,
} from './videoFormSuggestions'

export type VideoFieldKind = 'names' | 'single' | 'dual'

export type VideoFormFieldDef = {
  id: string
  timeLabel: string
  kind: VideoFieldKind
  /** single: 한 줄 최대 글자 / names: 신랑·신부 각각 */
  maxChars: number
  defaults: string[]
  /** dual: 줄당 maxChars */
  dualMaxChars?: number
  suggestionsSingle?: string[]
  suggestionsDual?: DualLineSuggestion[]
  /** AE·내보내기 JSON 키 */
  exportKeys: string[]
  label: string
}

export const VIDEO_FORM_FIELDS: VideoFormFieldDef[] = [
  {
    id: 'P01',
    timeLabel: '0:02',
    kind: 'names',
    maxChars: 4,
    defaults: ['신랑', '신부'],
    exportKeys: ['P01_groom', 'P01_bride'],
    label: '신랑 · 신부 이름',
  },
  {
    id: 'P02',
    timeLabel: '0:05',
    kind: 'single',
    maxChars: 10,
    defaults: ['너와 나의 1일'],
    suggestionsSingle: SUGGESTIONS_10,
    exportKeys: ['P02'],
    label: '태그 문구',
  },
  {
    id: 'P03',
    timeLabel: '0:08',
    kind: 'dual',
    maxChars: 7,
    dualMaxChars: 7,
    defaults: ['처음 만난 날', '모든 게 시작됐어'],
    suggestionsDual: SUGGESTIONS_7x2,
    exportKeys: ['P03_1', 'P03_2'],
    label: 'P03',
  },
  {
    id: 'P04',
    timeLabel: '0:12',
    kind: 'dual',
    maxChars: 12,
    dualMaxChars: 12,
    defaults: ['행복한 시간', '늘 너와 함께'],
    suggestionsDual: SUGGESTIONS_12x2,
    exportKeys: ['P04_1', 'P04_2'],
    label: 'P04',
  },
  {
    id: 'P05',
    timeLabel: '0:15',
    kind: 'dual',
    maxChars: 12,
    dualMaxChars: 12,
    defaults: ['우리가 함께해 온', '수많은 계절들'],
    suggestionsDual: SUGGESTIONS_12x2,
    exportKeys: ['P05_1', 'P05_2'],
    label: 'P05',
  },
  {
    id: 'P06',
    timeLabel: '0:17',
    kind: 'dual',
    maxChars: 12,
    dualMaxChars: 12,
    defaults: ['이제는 평생', '함께하려 해요'],
    suggestionsDual: SUGGESTIONS_12x2,
    exportKeys: ['P06_1', 'P06_2'],
    label: 'P06',
  },
  {
    id: 'P07',
    timeLabel: '0:19',
    kind: 'dual',
    maxChars: 7,
    dualMaxChars: 7,
    defaults: ['1,000일의', '기록'],
    suggestionsDual: SUGGESTIONS_7x2,
    exportKeys: ['P07_1', 'P07_2'],
    label: 'P07',
  },
  {
    id: 'P08',
    timeLabel: '0:27',
    kind: 'dual',
    maxChars: 7,
    dualMaxChars: 7,
    defaults: ['싸워도 금방', '다시 웃던 우리'],
    suggestionsDual: SUGGESTIONS_7x2,
    exportKeys: ['P08_1', 'P08_2'],
    label: 'P08',
  },
  {
    id: 'P09',
    timeLabel: '0:31',
    kind: 'dual',
    maxChars: 12,
    dualMaxChars: 12,
    defaults: ['그날 네가 웃어줘서', '지금의 우리가 있어'],
    suggestionsDual: SUGGESTIONS_12x2,
    exportKeys: ['P09_1', 'P09_2'],
    label: 'P09',
  },
  {
    id: 'P10',
    timeLabel: '0:33',
    kind: 'dual',
    maxChars: 12,
    dualMaxChars: 12,
    defaults: ['별일 없는 하루도', '너랑이면 특별해'],
    suggestionsDual: SUGGESTIONS_12x2,
    exportKeys: ['P10_1', 'P10_2'],
    label: 'P10',
  },
  {
    id: 'P11',
    timeLabel: '0:35',
    kind: 'single',
    maxChars: 10,
    defaults: ['나랑 결혼해줄래?'],
    suggestionsSingle: SUGGESTIONS_P11,
    exportKeys: ['P11'],
    label: '엔딩',
  },
]

export type VideoFormValues = Record<string, string>

export function buildDefaultVideoFormValues(
  groomName = '',
  brideName = '',
): VideoFormValues {
  const values: VideoFormValues = {}
  for (const field of VIDEO_FORM_FIELDS) {
    if (field.id === 'P01') {
      const g = groomName.trim().slice(0, field.maxChars) || field.defaults[0]
      const b = brideName.trim().slice(0, field.maxChars) || field.defaults[1]
      values[field.exportKeys[0]] = g
      values[field.exportKeys[1]] = b
      continue
    }
    field.exportKeys.forEach((key, index) => {
      values[key] = field.defaults[index] ?? ''
    })
  }
  return values
}

/** 비어 있으면 기본값으로 채운 뒤 AE용 JSON 객체 생성 */
export function buildVideoExportPayload(
  values: VideoFormValues,
  groomName = '',
  brideName = '',
): Record<string, string> {
  const merged = { ...buildDefaultVideoFormValues(groomName, brideName), ...values }
  const out: Record<string, string> = {}
  for (const field of VIDEO_FORM_FIELDS) {
    for (let i = 0; i < field.exportKeys.length; i++) {
      const key = field.exportKeys[i]
      const raw = merged[key]?.trim()
      if (raw) {
        out[key] = raw
        continue
      }
      if (field.kind === 'names') {
        out[key] = field.defaults[i] ?? ''
      } else if (field.kind === 'single') {
        out[key] = field.defaults[0] ?? ''
      } else {
        out[key] = field.defaults[i] ?? ''
      }
    }
  }
  return out
}

export function countChars(text: string): number {
  return [...text].length
}

export function clampToMaxChars(text: string, max: number): string {
  const chars = [...text]
  if (chars.length <= max) return text
  return chars.slice(0, max).join('')
}
