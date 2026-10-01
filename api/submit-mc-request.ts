export const config = {
  runtime: 'edge',
}

import { insertMcRequest, type McRequestInsert } from './lib/mcRequestStore'
import { getResendConfig, sendMcRequestNotificationEmail } from './lib/sendMcRequestEmail'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

type SubmitPayload = {
  groomName?: string
  brideName?: string
  ceremonyDate?: string
  ceremonyTime?: string
  venue?: string
  phone?: string
  email?: string
  message?: string
  wantsPreweddingVideo?: boolean
  privacyAgreed?: boolean
}

function normalizePayload(raw: SubmitPayload): McRequestInsert {
  const groomName = raw.groomName?.trim() ?? ''
  const brideName = raw.brideName?.trim() ?? ''
  const venue = raw.venue?.trim() ?? ''
  const phone = raw.phone?.trim() ?? ''
  const email = raw.email?.trim() ?? ''
  const message = raw.message?.trim() ?? ''
  const ceremonyDate = raw.ceremonyDate?.trim() || null
  const ceremonyTime = raw.ceremonyTime?.trim() ?? ''
  const wantsPreweddingVideo = Boolean(raw.wantsPreweddingVideo)
  const privacyAgreed = Boolean(raw.privacyAgreed)

  if (!phone) throw new Error('연락처를 입력해 주세요.')
  if (!message) throw new Error('문의 내용을 입력해 주세요.')
  if (!privacyAgreed) throw new Error('개인정보 수집·이용에 동의해 주세요.')

  return {
    groomName: groomName || '미입력',
    brideName: brideName || '미입력',
    ceremonyDate,
    ceremonyTime,
    venue: venue || '미입력',
    phone,
    email: email || '미입력',
    message,
    wantsPreweddingVideo,
    privacyAgreed,
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  try {
    const payload = normalizePayload((await request.json()) as SubmitPayload)
    const record = await insertMcRequest(payload)

    const resend = getResendConfig(process.env as Record<string, string | undefined>)
    const notifyTo =
      process.env.OWNER_EMAIL?.trim() || process.env.MC_NOTIFY_EMAIL?.trim() || 'tseizou@naver.com'

    if (resend) {
      try {
        await sendMcRequestNotificationEmail(resend, record, notifyTo)
      } catch (mailError) {
        console.error('mc request notify email failed', mailError)
      }
    }

    return Response.json({ ok: true, id: record.id }, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : '상담 신청에 실패했습니다.'
    const status = message.includes('입력') || message.includes('동의') ? 400 : 500
    return Response.json({ error: message }, { status, headers: corsHeaders })
  }
}
