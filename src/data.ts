import type { Dispatch, SetStateAction } from 'react'

export type Style = 'classic' | 'casual' | 'modern' | 'fun'
export type Mood = 'bright' | 'solemn' | 'formal' | 'warm'
export type PersonRole = 'mc' | 'officiant' | 'vocalist' | 'speaker'

export interface Marker {
  id: string
  time: number
  script: string
}

export interface OrderItem {
  id: string
  title: string
  duration: number
  scriptVariant: number
}

export interface Person {
  id: string
  name: string
  role: PersonRole
  relationship: string
  introVariant: number
}

export interface AppData {
  groomName: string
  brideName: string
  date: string
  time: string
  venue: string
  style: Style
  groomMarkers: Marker[]
  brideMarkers: Marker[]
  orderItems: OrderItem[]
  persons: Person[]
  mood: Mood
  email: string
}

export type SetData = Dispatch<SetStateAction<AppData>>

export const roleLabels: Record<PersonRole, string> = {
  mc: '사회자',
  officiant: '주례',
  vocalist: '축가자',
  speaker: '축사자',
}

export const styleLabels: Record<Style, string> = {
  classic: '클래식',
  casual: '캐주얼',
  modern: '모던',
  fun: '유쾌발랄',
}

export const moodLabels: Record<Mood, string> = {
  bright: '밝고 경쾌하게',
  solemn: '경건하고 차분하게',
  formal: '무게 있고 격식 있게',
  warm: '따뜻하고 감성적으로',
}

export const moodDescriptions: Record<Mood, string> = {
  bright: '활기차고 즐거운 분위기, 하객이 함께 즐기는 예식',
  solemn: '차분하고 경건한 분위기의 진중한 예식',
  formal: '격식과 품위를 갖춘 전통적인 예식',
  warm: '따뜻한 감성으로 감동을 전하는 예식',
}

export const moodEmojis: Record<Mood, string> = {
  bright: '🎉',
  solemn: '🕊️',
  formal: '🎩',
  warm: '🌸',
}

export const defaultOrderItems: OrderItem[] = [
  { id: '1', title: '개식사', duration: 2, scriptVariant: 0 },
  { id: '2', title: '신랑 입장', duration: 3, scriptVariant: 0 },
  { id: '3', title: '신부 입장', duration: 4, scriptVariant: 0 },
  { id: '4', title: '성혼 선언문', duration: 5, scriptVariant: 0 },
  { id: '5', title: '주례사', duration: 10, scriptVariant: 0 },
  { id: '6', title: '축가', duration: 5, scriptVariant: 0 },
  { id: '7', title: '신랑신부 인사', duration: 3, scriptVariant: 0 },
  { id: '8', title: '폐식사', duration: 2, scriptVariant: 0 },
]

export const itemScripts: Record<string, Record<Mood, string[]>> = {
  '개식사': {
    bright: [
      '자, 이제 특별한 두 분의 예식을 시작하겠습니다! 오늘 이 기쁜 자리에 함께해 주신 모든 분들께 진심으로 감사드립니다!',
      '안녕하세요! 오늘 정말 행복한 날이죠? 두 분의 특별한 예식이 지금 시작됩니다!',
      '드디어 기다리고 기다리던 그날이 왔습니다! 두 분의 예식, 지금 바로 시작합니다!',
    ],
    solemn: [
      '잠시 후 두 분의 소중한 예식이 시작됩니다. 오늘 이 자리를 함께해 주신 하객 여러분께 감사의 말씀을 드립니다.',
      '이제 두 분의 예식을 시작하겠습니다. 오늘 이 아름다운 자리를 빛내주신 여러분께 감사드립니다.',
      '성스러운 오늘, 두 분의 예식이 시작됩니다. 함께해 주신 모든 분들께 깊이 감사드립니다.',
    ],
    formal: [
      '이제 예식을 거행하겠습니다. 양가 내외분과 하객 여러분의 경청을 부탁드립니다.',
      '예식을 시작하겠습니다. 하객 여러분의 협조를 부탁드립니다.',
      '지금부터 두 분의 혼인 예식을 거행하겠습니다.',
    ],
    warm: [
      '오늘 이 특별한 날, 두 사람의 사랑 이야기가 새로운 장을 열게 됩니다. 함께해 주셔서 진심으로 감사합니다.',
      '두 사람의 소중한 인연이 오늘 아름다운 결실을 맺습니다. 함께해 주셔서 고맙습니다.',
      '오늘 이 행복한 날, 두 분의 사랑을 축복해 주시기 위해 모여주신 여러분께 감사드립니다.',
    ],
  },
  '신랑 입장': {
    bright: [
      '먼저 오늘의 주인공 신랑이 입장하겠습니다! 멋진 신랑님을 박수로 맞이해 주세요!',
      '신랑 입장! 오늘 가장 멋진 남자, 뜨거운 박수 부탁드립니다!',
      '자, 이제 신랑님이 등장하십니다! 최고의 박수로 환영해 주세요!',
    ],
    solemn: [
      '신랑이 입장하겠습니다. 박수로 맞이해 주시기 바랍니다.',
      '이제 신랑이 입장합니다.',
      '신랑 입장이 있겠습니다.',
    ],
    formal: [
      '신랑이 입장합니다.',
      '신랑께서 입장하시겠습니다.',
      '신랑 입장.',
    ],
    warm: [
      '이제 오늘의 주인공 신랑이 입장합니다. 따뜻한 박수로 맞이해 주세요.',
      '기다리고 기다리던 그분이 오십니다. 신랑 입장입니다.',
      '사랑하는 마음을 가득 담아 신랑이 입장합니다.',
    ],
  },
  '신부 입장': {
    bright: [
      '이제 기다리고 기다리던 신부가 입장하겠습니다! 오늘 가장 아름다운 신부에게 뜨거운 박수를 보내주세요!',
      '신부 등장! 오늘 정말 아름답죠? 박수 부탁드립니다!',
      '드디어! 신부님이 입장하십니다! 자리에서 일어나 환영해 주셔도 좋습니다!',
    ],
    solemn: [
      '이제 신부가 입장하겠습니다. 아름다운 신부를 박수로 맞이해 주십시오.',
      '신부 입장이 있겠습니다.',
      '신부가 입장합니다.',
    ],
    formal: [
      '신부가 입장합니다.',
      '신부께서 입장하시겠습니다.',
      '신부 입장.',
    ],
    warm: [
      '드디어 신부가 입장합니다. 오늘 가장 아름다운 신부에게 따뜻한 박수를 보내주세요.',
      '세상에서 가장 아름다운 이가 옵니다. 신부 입장입니다.',
      '사랑과 설렘을 가득 담고, 신부가 입장합니다.',
    ],
  },
  '성혼 선언문': {
    bright: [
      '이제 두 분이 평생 함께할 것을 약속하는 성혼 선언문을 낭독하겠습니다! 두 분의 영원한 사랑을 함께 응원해 주세요!',
      '드디어 성혼 선언! 두 분의 가슴 벅찬 약속을 함께 들어 주세요!',
      '두 분이 서로에게 건네는 평생의 약속! 성혼 선언문 낭독이 있겠습니다!',
    ],
    solemn: [
      '이제 두 분의 성혼 선언이 있겠습니다.',
      '성혼 선언문 낭독이 있겠습니다.',
      '두 분이 서로에게 영원한 사랑을 약속하는 시간을 갖겠습니다.',
    ],
    formal: [
      '성혼 선언문을 낭독하겠습니다.',
      '성혼 선언이 있겠습니다.',
      '이제 성혼 선언문 낭독이 있겠습니다.',
    ],
    warm: [
      '두 분이 서로에게 영원한 사랑을 약속하는 소중한 시간을 갖겠습니다.',
      '이 순간을 위해 두 분이 함께 달려왔습니다. 성혼 선언문 낭독이 있겠습니다.',
      '두 분의 사랑이 오늘 영원한 약속이 됩니다. 성혼 선언문을 낭독하겠습니다.',
    ],
  },
  '주례사': {
    bright: [
      '이제 두 분께 특별한 말씀을 전해주실 주례 선생님의 말씀이 있겠습니다. 귀 기울여 주세요!',
      '주례 선생님의 사랑 가득한 말씀이 이어집니다!',
      '두 분의 미래를 위한 소중한 말씀! 주례사가 있겠습니다.',
    ],
    solemn: [
      '주례사가 있겠습니다.',
      '주례 선생님의 말씀이 있겠습니다.',
      '이제 주례사가 있겠습니다. 경청해 주시기 바랍니다.',
    ],
    formal: [
      '주례사가 있겠습니다.',
      '이제 주례 말씀이 있겠습니다.',
      '주례 선생님의 말씀을 경청하겠습니다.',
    ],
    warm: [
      '두 분의 인생 여정에 아름다운 조언을 전해주실 주례 선생님의 말씀이 있겠습니다.',
      '주례 선생님께서 두 분에게 소중한 말씀을 전해주시겠습니다.',
      '이제 주례사가 있겠습니다.',
    ],
  },
  '축가': {
    bright: [
      '두 분의 사랑을 음악으로 축하해 드릴 특별한 무대가 이어집니다! 큰 박수 부탁드립니다!',
      '아름다운 선물이 준비되어 있습니다! 축가 무대를 함께 즐겨주세요!',
      '이제 특별한 축가가 준비되어 있습니다! 박수로 맞이해 주세요!',
    ],
    solemn: [
      '축가가 있겠습니다.',
      '이제 축가가 있겠습니다. 감상해 주시기 바랍니다.',
      '소중한 축가 무대가 이어지겠습니다.',
    ],
    formal: [
      '축가가 있겠습니다.',
      '이제 축가 순서입니다.',
      '축가를 듣겠습니다.',
    ],
    warm: [
      '두 분의 사랑을 노래로 전해드릴 특별한 축가가 준비되어 있습니다.',
      '음악으로 두 분의 행복을 축복해 드릴 시간입니다. 축가가 있겠습니다.',
      '마음을 담은 아름다운 축가 무대가 이어집니다.',
    ],
  },
  '신랑신부 인사': {
    bright: [
      '이제 오늘의 주인공 두 분이 여러분께 직접 인사 말씀을 드리겠습니다! 따뜻한 박수 부탁드립니다!',
      '신랑신부님의 설레는 인사 시간입니다! 함께 들어봐요!',
      '드디어 두 분의 인사! 오늘 가장 행복한 두 분의 말씀을 들어 주세요!',
    ],
    solemn: [
      '신랑신부 인사가 있겠습니다.',
      '이제 두 분이 인사 말씀을 드리겠습니다.',
      '신랑신부님의 인사가 있겠습니다.',
    ],
    formal: [
      '신랑신부 인사가 있겠습니다.',
      '이제 신랑신부 인사 순서입니다.',
      '신랑신부님이 인사 말씀을 드리겠습니다.',
    ],
    warm: [
      '오늘 가장 행복한 두 분이 여러분께 감사의 인사를 전하겠습니다.',
      '이제 두 분이 직접 여러분께 마음을 전하는 시간입니다.',
      '신랑신부님의 진심 어린 인사가 있겠습니다.',
    ],
  },
  '폐식사': {
    bright: [
      '이것으로 두 분의 아름다운 예식을 모두 마칩니다! 두 분의 새로운 출발을 힘차게 응원해 주시고, 피로연장에서 축하를 이어가요!',
      '예식이 마무리되었습니다! 두 분의 행복한 미래를 함께 응원해요! 피로연으로 이동해 주세요!',
      '오늘 정말 아름다운 예식이었죠? 두 분의 행복을 빌며, 이것으로 예식을 마칩니다!',
    ],
    solemn: [
      '이것으로 두 분의 예식을 마치겠습니다. 오늘 함께해 주신 모든 분들께 감사드립니다.',
      '예식을 마치겠습니다. 두 분의 앞날에 행복이 가득하길 바랍니다.',
      '이것으로 예식을 마칩니다. 감사합니다.',
    ],
    formal: [
      '이것으로 예식을 마치겠습니다.',
      '예식을 마칩니다.',
      '이상으로 두 분의 예식을 마치겠습니다.',
    ],
    warm: [
      '두 분의 아름다운 여정이 지금 시작됩니다. 오늘 함께해 주신 모든 분들께 진심으로 감사드립니다.',
      '이것으로 따뜻하고 행복한 예식을 마칩니다. 두 분의 영원한 행복을 빌겠습니다.',
      '오늘 이 자리를 함께해 주신 모든 분들께 감사드리며, 예식을 마치겠습니다.',
    ],
  },
}

export const introScriptTemplates: Record<string, string[]> = {
  '고등학교 동창': [
    '학창시절부터 지금까지 변함없는 우정으로 함께해온 소중한 친구입니다. 교복을 입고 함께 걷던 그 길에서 시작된 인연이 오늘도 이어집니다.',
    '풋풋했던 고등학교 시절부터 지금까지, 기쁨과 슬픔을 함께 나눈 오랜 친구입니다.',
    '학교 복도에서 처음 만나 인생의 가장 중요한 순간을 함께하게 된 특별한 인연입니다.',
  ],
  '대학교 동창': [
    '대학 시절 같은 꿈을 꾸며 함께 성장한 소중한 친구입니다. 청춘의 가장 빛나는 시간을 함께했습니다.',
    '캠퍼스에서 만나 지금까지 깊은 인연을 이어온 대학 시절 동기입니다.',
    '함께 밤새워 공부하고, 함께 웃고 울었던 대학 동기이자 평생의 친구입니다.',
  ],
  '직장 동료': [
    '같은 꿈을 향해 함께 달려온 소중한 직장 동료입니다. 일터에서 시작된 인연이 평생의 우정이 되었습니다.',
    '업무의 고비를 함께 넘어온 믿음직한 동료이자 특별한 친구입니다.',
    '매일 함께 일하며 쌓아온 신뢰와 우정이 오늘 이 자리에서 빛납니다.',
  ],
  '군대 전우': [
    '나라를 위해 함께 땀 흘렸던 전우이자 평생의 형제입니다. 군 시절 동고동락하며 깊은 우정을 나눴습니다.',
    '가장 힘든 시간을 함께 견뎌낸 전우, 이제 가장 행복한 자리에서 다시 만납니다.',
    '함께 구호를 외쳤던 그 시절부터 지금까지, 변치 않는 우정을 이어온 전우입니다.',
  ],
  '친구': [
    '오랜 세월 한결같은 우정으로 함께해 온 소중한 친구입니다. 언제나 곁에서 힘이 되어주었습니다.',
    '기쁨도 슬픔도 함께 나눈 든든한 친구로, 오늘 이 특별한 자리를 함께합니다.',
    '인생의 가장 소중한 순간마다 함께해 온 평생 친구입니다.',
  ],
  '가족': [
    '신랑/신부의 삶을 가장 가까이에서 함께해 온 소중한 가족입니다. 언제나 옆에서 힘이 되어주었습니다.',
    '기쁨도 슬픔도 함께 나눈 든든한 가족으로, 오늘 이 특별한 자리를 더욱 빛내줍니다.',
    '가장 가까운 곳에서 사랑을 전해온 소중한 가족입니다.',
  ],
}

export function getIntroScript(relationship: string, variant: number): string {
  const templates = introScriptTemplates[relationship] ?? introScriptTemplates['친구']
  return templates[variant % templates.length]
}

export function getItemScript(title: string, mood: Mood, variant: number): string {
  const scripts = itemScripts[title]
  if (!scripts) return `${title} 순서가 진행됩니다.`
  const moodScripts = scripts[mood]
  return moodScripts[variant % moodScripts.length]
}

export const WAVEFORM_HEIGHTS = [
  8, 14, 22, 18, 30, 25, 12, 35, 28, 20, 15, 32, 28, 18, 24,
  30, 22, 16, 28, 35, 22, 18, 12, 25, 30, 28, 20, 16, 32, 25,
  18, 30, 22, 28, 35, 20, 15, 28, 25, 32, 18, 22, 30, 28, 15,
  20, 35, 28, 22, 30, 25, 18, 32, 28, 22, 16, 30, 25, 18, 32,
  28, 20, 15, 25, 30, 22, 18, 28, 35, 20, 15, 28, 25, 30, 22, 14,
]

export const initialData: AppData = {
  groomName: '',
  brideName: '',
  date: '',
  time: '',
  venue: '',
  style: 'classic',
  groomMarkers: [],
  brideMarkers: [],
  orderItems: defaultOrderItems,
  persons: [],
  mood: 'warm',
  email: '',
}
