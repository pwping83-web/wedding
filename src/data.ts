import type { Dispatch, SetStateAction } from 'react'
import { getItemScript } from './cueScripts'

export type Style = 'classic' | 'casual' | 'modern' | 'fun'
export type Mood = 'bright' | 'solemn' | 'formal' | 'warm'
export type PersonRole = 'mc' | 'officiant' | 'vocalist' | 'speaker'

export interface Marker {
  id: string
  time: number
  scriptVariant: number
  customScript?: string
}

export interface OrderItem {
  id: string
  title: string
  duration: number
  scriptVariant: number
  customScript?: string
}

export interface Person {
  id: string
  name: string
  role: PersonRole
  relationship: string
  introVariant: number
  customIntro?: string
}

export interface EntranceAudio {
  fileName: string
  url: string
  duration: number
  waveform: number[]
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
  groomAudio: EntranceAudio | null
  brideAudio: EntranceAudio | null
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
  { id: '1', title: '안내멘트(10분전)', duration: 1, scriptVariant: 0 },
  { id: '2', title: '안내멘트(5분전)', duration: 1, scriptVariant: 0 },
  { id: '3', title: '개식사', duration: 2, scriptVariant: 0 },
  { id: '4', title: '화촉점화 안내', duration: 3, scriptVariant: 0 },
  { id: '5', title: '신랑 입장', duration: 1, scriptVariant: 0 },
  { id: '6', title: '신부 입장', duration: 1, scriptVariant: 0 },
  { id: '7', title: '신랑신부 맞절', duration: 1, scriptVariant: 0 },
  { id: '8', title: '신랑신부 혼인서약서 낭독', duration: 2, scriptVariant: 0 },
  { id: '9', title: '성혼선언문', duration: 2, scriptVariant: 0 },
  { id: '10', title: '축가', duration: 5, scriptVariant: 0 },
  { id: '11', title: '부모님과 하객분들께 인사', duration: 3, scriptVariant: 0 },
  { id: '12', title: '행진', duration: 1, scriptVariant: 0 },
  { id: '13', title: '폐식사', duration: 2, scriptVariant: 0 },
]

export { getItemScript, itemScripts, buildScriptContext, applyScriptVars } from './cueScripts'

export function getOrderItemScript(
  item: OrderItem,
  mood: Mood,
  data: AppData,
): string {
  if (item.customScript?.trim()) return item.customScript
  return getItemScript(item.title, mood, item.scriptVariant, data)
}

export function getPersonIntroScript(person: Person): string {
  if (person.customIntro?.trim()) return person.customIntro
  return getIntroScript(person.relationship, person.introVariant)
}

export function getMarkerEntranceScript(
  type: 'groom' | 'bride',
  style: Style,
  marker: Marker,
  name: string,
): string {
  if (marker.customScript?.trim()) return marker.customScript
  return getEntranceScript(type, style, marker.scriptVariant, name)
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

export const groomEntranceScripts: Record<Style, string[]> = {
  classic: [
    '이제 오늘의 주인공 신랑 {name}님이 입장하시겠습니다. 따뜻한 박수로 맞이해 주시기 바랍니다.',
    '신랑 {name}님의 입장이 있겠습니다. 정중한 박수로 환영해 주십시오.',
    '지금부터 신랑 {name}님이 입장합니다. 박수로 맞이해 주시기 바랍니다.',
  ],
  casual: [
    '자, 이제 신랑 {name}님 등장! 오늘 가장 멋진 남자, 박수 부탁드려요!',
    '드디어 신랑 {name}님이 나오십니다! 힘차게 박수 보내주세요~',
    '신랑 입장! {name}님, 뜨거운 환영 박수로 맞이해 주세요!',
  ],
  modern: [
    'Now, please welcome the groom, {name}.',
    '신랑 {name}님, 입장해 주십시오. 박수로 함께해 주세요.',
    "The moment we've all been waiting for — groom {name} is entering.",
  ],
  fun: [
    '쿵쿵! 신랑 {name}님 입장! 오늘 주인공 등장이에요, 박수 박수!',
    '여러분 손뼉 준비! 멋진 신랑 {name}님이 등장합니다!',
    '신랑 {name}님 입장! 자리에서 일어나 환호해 주셔도 좋아요!',
  ],
}

export const brideEntranceScripts: Record<Style, string[]> = {
  classic: [
    '이제 신부 {name}님이 입장하시겠습니다. 아름다운 신부를 박수로 맞이해 주시기 바랍니다.',
    '신부 {name}님의 입장이 있겠습니다. 정중한 박수로 환영해 주십시오.',
    '지금부터 신부 {name}님이 입장합니다. 따뜻한 박수를 보내주세요.',
  ],
  casual: [
    '드디어! 신부 {name}님 등장! 오늘 가장 아름다운 분, 박수 부탁드려요~',
    '신부 입장! {name}님, 설레는 순간 함께해 주세요!',
    '자, 이제 {name} 신부님이 나오십니다! 큰 박수로 맞이해 주세요!',
  ],
  modern: [
    'Please welcome the bride, {name}.',
    '신부 {name}님, 입장해 주십시오. 박수로 함께해 주세요.',
    'The bride, {name}, is now entering.',
  ],
  fun: [
    '반짝반짝! 신부 {name}님 입장! 오늘의 여왕 등장이에요!',
    '여러분 박수 크게! 아름다운 신부 {name}님이 등장합니다!',
    '신부 {name}님 입장! 환호와 박수로 축복해 주세요!',
  ],
}

export function getEntranceScript(
  type: 'groom' | 'bride',
  style: Style,
  variant: number,
  name: string,
): string {
  const templates = type === 'groom' ? groomEntranceScripts[style] : brideEntranceScripts[style]
  const displayName = name.trim() || (type === 'groom' ? '신랑' : '신부')
  return templates[variant % templates.length].replace(/\{name\}/g, displayName)
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
  groomAudio: null,
  brideAudio: null,
  orderItems: defaultOrderItems,
  persons: [],
  mood: 'warm',
  email: '',
}
