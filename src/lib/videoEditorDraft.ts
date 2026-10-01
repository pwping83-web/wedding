import type { VideoFormValues } from '../constants/videoFormFields'

const DRAFT_KEY = 'wedding-video-editor-draft'

export type VideoEditorDraft = {
  values: VideoFormValues
  contactEmail?: string
  savedAt: string
}

export function saveVideoEditorDraft(values: VideoFormValues, contactEmail = '') {
  try {
    const payload: VideoEditorDraft = {
      values,
      contactEmail: contactEmail.trim(),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
  } catch {
    /* ignore quota */
  }
}

export function loadVideoEditorDraft(): VideoEditorDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as VideoEditorDraft
  } catch {
    return null
  }
}

export function loadVideoEditorFormValues(): VideoFormValues | null {
  return loadVideoEditorDraft()?.values ?? null
}
