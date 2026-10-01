export type McRequestFormPayload = {
  groomName: string
  brideName: string
  ceremonyDate: string
  ceremonyTime: string
  venue: string
  phone: string
  email: string
  message: string
  wantsPreweddingVideo: boolean
  privacyAgreed: boolean
}

function apiUrl() {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}api/submit-mc-request`.replace(/([^:]\/)\/+/g, '$1')
}

export async function submitMcRequest(payload: McRequestFormPayload): Promise<{ id: string }> {
  const response = await fetch(apiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = (await response.json()) as { ok?: boolean; id?: string; error?: string }
  if (!response.ok) {
    throw new Error(data.error || '상담 신청에 실패했습니다.')
  }
  if (!data.id) throw new Error('접수 확인에 실패했습니다.')
  return { id: data.id }
}
