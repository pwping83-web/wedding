import { getStoredVideoAccessCode } from './videoAccess'

export type SubmitVideoTextPayload = {
  contactEmail: string
  groomName: string
  brideName: string
  textPayload: Record<string, string>
}

function apiUrl() {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}api/submit-video-text`.replace(/([^:]\/)\/+/g, '$1')
}

export async function submitVideoText(payload: SubmitVideoTextPayload): Promise<{ id: string }> {
  const accessCode = getStoredVideoAccessCode()
  if (!accessCode) {
    throw new Error('무료제작 코드 인증이 필요합니다. /video에서 다시 입장해 주세요.')
  }

  const response = await fetch(apiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, accessCode }),
  })

  const data = (await response.json()) as { ok?: boolean; id?: string; error?: string }
  if (!response.ok) {
    throw new Error(data.error || '글귀 저장에 실패했습니다.')
  }
  if (!data.id) throw new Error('저장 확인에 실패했습니다.')
  return { id: data.id }
}
