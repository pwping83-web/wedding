import type { AppData, Mood, OrderItem } from '../data'
import { buildScriptContext, getItemScript, getIntroScript, moodLabels } from '../data'

export type GenerateScriptKind = 'order' | 'intro' | 'entrance'

type GeneratePayload = {
  kind: GenerateScriptKind
  mood: Mood
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

function apiUrl() {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}api/generate-script`.replace(/([^:]\/)\/+/g, '$1')
}

export async function requestGeneratedScript(payload: GeneratePayload): Promise<string> {
  const response = await fetch(apiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = (await response.json()) as { script?: string; error?: string }
  if (!response.ok) {
    throw new Error(data.error ?? '멘트 생성에 실패했습니다.')
  }
  if (!data.script?.trim()) {
    throw new Error('생성된 멘트가 비어 있습니다.')
  }
  return data.script.trim()
}

export function buildOrderGeneratePayload(
  data: AppData,
  title: string,
  currentScript?: string,
): GeneratePayload {
  const ctx = buildScriptContext(data)
  return {
    kind: 'order',
    mood: data.mood,
    moodLabel: moodLabels[data.mood],
    title,
    groomName: ctx.groomName,
    brideName: ctx.brideName,
    mcName: ctx.mcName,
    vocalistName: ctx.vocalistName,
    speakerName: ctx.speakerName,
    ceremonyTime: ctx.ceremonyTime,
    venue: ctx.venue,
    currentScript,
  }
}

export function buildIntroGeneratePayload(
  data: AppData,
  relationship: string,
  currentScript?: string,
): GeneratePayload {
  const ctx = buildScriptContext(data)
  return {
    kind: 'intro',
    mood: data.mood,
    moodLabel: moodLabels[data.mood],
    relationship,
    groomName: ctx.groomName,
    brideName: ctx.brideName,
    mcName: ctx.mcName,
    vocalistName: ctx.vocalistName,
    speakerName: ctx.speakerName,
    ceremonyTime: ctx.ceremonyTime,
    venue: ctx.venue,
    currentScript,
  }
}

export function buildEntranceGeneratePayload(
  data: AppData,
  entranceType: 'groom' | 'bride',
  currentScript?: string,
): GeneratePayload {
  const ctx = buildScriptContext(data)
  return {
    kind: 'entrance',
    mood: data.mood,
    moodLabel: moodLabels[data.mood],
    entranceType,
    groomName: ctx.groomName,
    brideName: ctx.brideName,
    mcName: ctx.mcName,
    ceremonyTime: ctx.ceremonyTime,
    venue: ctx.venue,
    currentScript,
  }
}

export function presetOrderScript(data: AppData, title: string, variant: number) {
  return getItemScript(title, data.mood, variant, data)
}

export function presetIntroScript(relationship: string, variant: number) {
  return getIntroScript(relationship, variant)
}
