import type { VideoFormValues } from '../constants/videoFormFields'

const DRAFT_KEY = 'wedding-video-editor-draft'

export type VideoEditorDraft = {
  values: VideoFormValues
  savedAt: string
}

export function saveVideoEditorDraft(values: VideoFormValues) {
  try {
    const payload: VideoEditorDraft = { values, savedAt: new Date().toISOString() }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
  } catch {
    /* ignore quota */
  }
}

export function loadVideoEditorDraft(): VideoFormValues | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as VideoEditorDraft
    return parsed.values ?? null
  } catch {
    return null
  }
}
