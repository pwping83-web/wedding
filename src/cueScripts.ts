import type { AppData, MarriageDeclarationReader, Mood } from './data'

export type ScriptContext = {
  groomName: string
  brideName: string
  mcName: string
  vocalistName: string
  speakerName: string
  ceremonyTime: string
  venue: string
}

export const TITLE_ALIASES: Record<string, string> = {
  '성혼 선언문': '성혼선언문',
  '양가 부모님과 내빈께 인사': '부모님과 하객분들께 인사',
  '클로징(폐식사)': '폐식사',
  '양가 어머님 입장': '화촉점화 안내',
}

export function buildScriptContext(data: AppData): ScriptContext {
  return {
    groomName: data.groomName.trim() || '신랑',
    brideName: data.brideName.trim() || '신부',
    mcName: data.persons.find((p) => p.role === 'mc')?.name.trim() || '사회자',
    vocalistName: data.persons.find((p) => p.role === 'vocalist')?.name.trim() || '축가자',
    speakerName: data.persons.find((p) => p.role === 'speaker')?.name.trim() || '축사자',
    ceremonyTime: data.time.trim() || '예식 시간',
    venue: data.venue.trim() || '예식장',
  }
}

export function applyScriptVars(text: string, ctx: Partial<ScriptContext>): string {
  return text
    .replace(/\{신랑이름\}/g, ctx.groomName ?? '신랑')
    .replace(/\{신부이름\}/g, ctx.brideName ?? '신부')
    .replace(/\{사회자이름\}/g, ctx.mcName ?? '사회자')
    .replace(/\{축가자이름\}/g, ctx.vocalistName ?? '축가자')
    .replace(/\{축사자이름\}/g, ctx.speakerName ?? '축사자')
    .replace(/\{예식시각\}/g, ctx.ceremonyTime ?? '예식 시간')
    .replace(/\{예식장\}/g, ctx.venue ?? '예식장')
}

type MoodScripts = Record<Mood, string[]>

function s(formal: string[], bright: string[], solemn: string[], warm: string[]): MoodScripts {
  return { formal, bright, solemn, warm }
}

/** 웨딩홀 기본 큐시트 멘트 — 4분위기 공통 */
function hall(primary: string, alternate?: string): MoodScripts {
  const secondary = alternate ?? primary
  return {
    formal: [primary, secondary],
    bright: [primary, secondary],
    solemn: [primary, secondary],
    warm: [primary, secondary],
  }
}

export const itemScripts: Record<string, MoodScripts> = {
  '안내멘트(10분전)': hall(
    '하객 여러분께 잠시 안내 말씀 드리겠습니다. 잠시 후 신랑 {신랑이름} 군과 신부 {신부이름} 양의 결혼식이 진행될 예정이오니, 참석하신 하객께서는 식장 안에 마련된 좌석에 착석해 주시기 바랍니다. 아울러 원활한 결혼식 진행을 위해 소지하신 휴대폰은 진동 모드로 해 주시면 감사하겠습니다.',
  ),

  '안내멘트(5분전)': hall(
    '다시 한번 안내 드리겠습니다. 잠시 후 신랑 {신랑이름} 군과 신부 {신부이름} 양의 결혼식이 진행될 예정이오니, 참석하신 하객께서는 자리를 정돈해 주시면 감사하겠습니다.',
  ),

  '개식사': hall(
    '지금부터 신랑 {신랑이름} 군과 신부 {신부이름} 양의 결혼식을 시작하겠습니다. 먼저 이렇게 바쁘신 와중에도 불구하고 두 사람을 축복하기 위해 참석해 주신 하객 여러분께 양가를 대신해 진심으로 감사의 말씀을 드립니다. 식전에 앞서서 저는 오늘 사회를 맡게 된 {사회자이름}이라고 합니다. 잘 부탁드립니다. 감사합니다.\n\n오늘 예식은 조금 특별하게 주례가 없이 진행이 됩니다. 주례가 없는 만큼 신랑 신부님이 더욱 예식을 정성스럽게 준비했으니까 끝까지 함께해 주시기 바라겠습니다.',
  ),

  '화촉점화 안내': hall(
    '자, 첫 번째 순서는 양가 어머님 입장이 있겠습니다. 여러분 뒤쪽을 한번 봐 주시면 양가 어머님이 입장을 준비하고 계십니다. 제가 양가 어머님 입장이라고 하면 여러분 큰 박수로 양가 어머님을 맞이해 주시기 바랍니다. "양가 어머님 입장!"\n\n다음은 화촉점화 순서가 이어지겠습니다. (계단 오르신 후) 양가 어머님들께서는 단상에 마련된 화촉에 점화를 해 주시길 바랍니다. (불 밝히시는 중) 신랑 신부의 미래가 환하게 밝아지고 있습니다. (여러분 뜨거운 박수 부탁드립니다.) 한 쌍의 촛불처럼 따뜻하고 멋진 미래로 가는 부부가 되기를 간절히 바래 봅니다. (점화 끝)\n\n다음은 양가 어머님의 맞절 순서가 있겠습니다. (양가 어머님은 서로 마주 보시고 서 주시기 바라겠습니다.) "양가 어머님 맞절" (여러분 다시 한번 큰 박수 부탁드립니다.) 양가 어머님들께서는 내빈을 향해 바라봐 주시기 바랍니다. 오늘 찾아주신 내빈 여러분께 "양가 어머님 인사!" (여러분 다시 한번 큰 박수 부탁드립니다.) 양가 어머님들께서는 자리에 착석해 주시기 바랍니다.',
  ),

  '신랑 입장': hall(
    '다음은 신랑 입장이 있겠습니다. 신부는 언제나 차분하게 자신을 지지해 주는 신랑의 든든함에 반해 결혼을 결심했다고 합니다. 오늘부터는 사랑하는 신부의 영원한 내 편으로 함께 할 신랑 {신랑이름} 군이 입장합니다. 하객 여러분의 힘찬 박수 부탁드립니다. 신랑 입장',
  ),

  '신부 입장': hall(
    '이제 오늘의 주인공인 신부 입장이 있겠습니다. 신랑이 평생 곁을 지키겠다고 약속했다면, 신부는 신랑이 그런 약속을 하게 만든 단 한 사람이었습니다. 오늘의 주인공이자 사랑스러운 신부가 입장하겠습니다. 신부 입장',
  ),

  '신랑신부 맞절': hall(
    '다음은 신랑신부 맞절 순서가 있겠습니다. 신랑신부님은 서로 마주 보고 서 주시길 바라겠습니다. (서로의 눈을 바라봐 주시고요) 여러 증인과 가족 앞에서 서로에 대한 존경의 마음을 담아 "신랑, 신부 맞절" 이후 (신랑신부님은 내빈을 향해서 바라봐 주시겠습니다.)',
  ),

  '신랑신부 혼인서약서 낭독': hall(
    '다음은 신랑신부 혼인서약서 낭독 순서가 있겠습니다. (혼인서약서 낭독)',
  ),

  '성혼선언문': hall(
    '다음은 두 사람의 결혼을 선언하는 성혼선언문 낭독이 있겠습니다. 성혼 선언은 신랑 아버님께서 진행해 주시겠습니다. 큰 박수로 맞이하여 주시기 바랍니다. (성혼선언문 낭독) 신랑 아버님께 다시 한번 큰 박수',
  ),

  '축가': hall(
    '(시작 전) 다음은 두 사람의 결혼을 축하하는 축가 순서가 이어지겠습니다. 오늘의 축가는 {축가자이름}님께서 준비해 주셨습니다. 큰 박수로 맞아 주시기 바랍니다.',
  ),

  '부모님과 하객분들께 인사': hall(
    '다음은 끝없는 사랑과 정성으로 길러 주고 보살펴 주신 부모님께 감사의 인사를 드리겠습니다.\n\n먼저, 신부측 부모님께 인사 드리겠습니다. (신랑 신부는 자리를 이동해 주시기 바랍니다.) 부모님의 따뜻한 보살핌 속에 어느덧 장성하여 새로운 가정을 이루게 되었습니다. 이제 한 가정의 가장으로, 부모님의 삶처럼 어떠한 순간에도 가족을 먼저 생각하고 보살피겠습니다. 지켜봐 주시고, 격려해 주십시오. 감사합니다. "신랑, 신부 부모님께 인사" 부모님께서도 일어나셔서 신랑, 신부님 따뜻하게 안아 주시면 감사하겠습니다.\n\n이어서 신랑측 부모님께 인사 드리겠습니다. (신랑, 신부님은 자리를 이동해 주시기 바랍니다.) 새로운 가정의 주인이 되어서도 감사의 마음으로 양가 부모님을 극진히 모시겠습니다. "신랑, 신부 부모님께 인사" 부모님께서도 일어나셔서 신랑, 신부님을 따뜻하게 안아 주시면 감사하겠습니다.\n\n다음은 오늘 두 사람을 축복해 주신 내빈 여러분께 인사를 올리겠습니다. 마지막으로 바쁘신 와중에 저희들의 새로운 시작을 축복해 주시기 위해 참석해 주셔서 감사합니다. 앞으로도 행복하고 성실하게 살겠습니다. "신랑신부 내빈께 인사!"',
  ),

  '행진': hall(
    '이제 모든 예식의 순서를 마치고, 신랑신부가 진정한 부부로서의 첫걸음을 내딛는 행진이 있겠습니다. 여러분의 진심 어린 축복 위에 신랑, 신부의 첫걸음이 더욱 빛날 수 있도록 아낌없는 큰 박수 부탁드립니다. "신랑신부 행진!!!"',
  ),

  '폐식사': hall(
    '이것으로 {신랑이름} 군과 신부 {신부이름} 양의 결혼 예식을 모두 마치겠습니다. 신랑신부를 축복하고 끝까지 자리를 빛내 주신 하객 여러분께 양가의 가족을 대신하여 진심으로 감사의 말씀 전합니다. 이제 곧 사진 촬영이 진행될 예정이오니, 양가 가족 및 친척, 지인분들께서는 잠시 자리를 지켜 주시기 바랍니다.',
  ),

  '축사': hall(
    '이어서 두 사람의 결혼을 축하하는 축사가 있겠습니다. 축사는 {축사자이름} 님께서 준비해 주셨습니다.',
  ),

  '주례사': hall(
    '다음은 주례사 순서입니다. 주례께서 신랑 {신랑이름} 군과 신부 {신부이름} 양의 앞날을 축복하는 말씀을 전해 주시겠습니다.',
  ),

  '신랑신부 인사': hall(
    '다음은 신랑신부 인사 순서입니다. 신랑 {신랑이름} 군과 신부 {신부이름} 양께서 오늘 이 자리를 함께해 주신 하객 여러분께 감사의 인사를 드리겠습니다.',
  ),

  '양가 부모님과 내빈께 인사': hall(
    '다음은 끝없는 사랑과 정성으로 길러 주고 보살펴 주신 부모님께 감사의 인사를 드리겠습니다. 먼저, 신부측 부모님께 인사 드리겠습니다. 이어서 신랑측 부모님께 인사 드리겠습니다. 마지막으로 오늘 두 사람을 축복해 주신 내빈 여러분께 인사를 올리겠습니다.',
  ),

  '성혼 선언문': hall(
    '다음은 두 사람의 결혼을 선언하는 성혼선언문 낭독이 있겠습니다. 성혼 선언은 신랑 아버님께서 진행해 주시겠습니다. 큰 박수로 맞이하여 주시기 바랍니다. (성혼선언문 낭독) 신랑 아버님께 다시 한번 큰 박수',
  ),
}

/** 사회자가 성혼선언문을 낭독할 때의 MC 멘트 (기본) */
export const marriageDeclarationMcScripts: MoodScripts = hall(
  '다음은 두 사람의 결혼을 선언하는 성혼선언문 낭독이 있겠습니다. 사회자 {사회자이름}이 성혼선언문을 낭독하겠습니다. 신랑 {신랑이름} 군과 신부 {신부이름} 양 앞에서 두 분이 오늘부터 부부로서 함께할 것을 선언합니다. 조용히 경청해 주시기 바랍니다. (성혼선언문 낭독)',
)

export function isMarriageDeclarationTitle(title: string): boolean {
  const normalizedTitle = TITLE_ALIASES[title] ?? title
  return normalizedTitle === '성혼선언문'
}

export function getMarriageDeclarationScript(
  title: string,
  mood: Mood,
  variant: number,
  reader: MarriageDeclarationReader,
  data?: AppData,
): string {
  if (reader === 'custom') {
    const item = data?.orderItems.find((orderItem) => isMarriageDeclarationTitle(orderItem.title))
    const ctx = data ? buildScriptContext(data) : {}
    if (item?.customScript?.trim()) return applyScriptVars(item.customScript, ctx)
    return '성혼선언문 멘트를 직접 입력해 주세요.'
  }
  const scripts = marriageDeclarationMcScripts
  const moodScripts = scripts[mood]
  const raw = moodScripts[variant % moodScripts.length]
  const ctx = data ? buildScriptContext(data) : {}
  return applyScriptVars(raw, ctx)
}

export function getItemScript(
  title: string,
  mood: Mood,
  variant: number,
  data?: AppData,
): string {
  const normalizedTitle = TITLE_ALIASES[title] ?? title
  const scripts = itemScripts[normalizedTitle]
  if (!scripts) return `${title} 순서가 진행됩니다.`
  const moodScripts = scripts[mood]
  const raw = moodScripts[variant % moodScripts.length]
  const ctx = data ? buildScriptContext(data) : {}
  return applyScriptVars(raw, ctx)
}
