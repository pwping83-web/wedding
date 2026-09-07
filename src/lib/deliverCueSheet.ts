import type { AppData } from '../data'
import { buildCueSheetEmailHtml, buildCueSheetEmailSubject } from './buildCueSheetEmailHtml'
import { buildCueSheetPrintHtml } from './buildCueSheetDocumentHtml'

export const MC_EMAIL = 'tseizou@naver.com'

function apiUrl() {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}api/send-cue-sheet`.replace(/([^:]\/)\/+/g, '$1')
}

type DeliveryPayload = {
  data: AppData
}

export async function deliverCueSheetToMc({ data }: DeliveryPayload): Promise<void> {
  const cueSheet = buildCueSheetEmailHtml(data)
  const printHtml = buildCueSheetPrintHtml(data)
  const subject = buildCueSheetEmailSubject(data)

  const response = await fetch(apiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mcEmail: MC_EMAIL,
      subject,
      cueSheet,
      printHtml,
    }),
  })

  const raw = await response.text()
  let result: { error?: string; ok?: boolean } = {}
  try {
    result = raw ? (JSON.parse(raw) as { error?: string; ok?: boolean }) : {}
  } catch {
    throw new Error(
      response.ok
        ? '서버 응답을 처리하지 못했습니다.'
        : `서버 오류(${response.status}). Vercel 배포·EmailJS 설정을 확인해 주세요.`,
    )
  }

  if (!response.ok) {
    throw new Error(result.error || `이메일 전송에 실패했습니다. (${response.status})`)
  }
}
