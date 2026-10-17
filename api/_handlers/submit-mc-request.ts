import { insertMcRequest, type McRequestInsert } from '../lib/mcRequestStore'
import { sendMcRequestNotification } from '../lib/sendMcRequestEmail'

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

  if (!phone) throw new Error('???? ??? ???.')
  if (!message) throw new Error('?? ??? ??? ???.')
  if (!privacyAgreed) throw new Error('???? ?????? ??? ???.')

  return {
    groomName: groomName || '???',
    brideName: brideName || '???',
    ceremonyDate,
    ceremonyTime,
    venue: venue || '???',
    phone,
    email: email || '???',
    message,
    wantsPreweddingVideo,
    privacyAgreed,
  }
}

export async function handleSubmitMcRequest(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  try {
    const payload = normalizePayload((await request.json()) as SubmitPayload)
    const record = await insertMcRequest(payload)

    try {
      await sendMcRequestNotification(process.env as Record<string, string | undefined>, record)
    } catch (mailError) {
      console.error('mc request notify email failed', mailError)
    }

    return Response.json({ ok: true, id: record.id }, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : '?? ??? ??????.'
    const status = message.includes('??') || message.includes('??') ? 400 : 500
    return Response.json({ error: message }, { status, headers: corsHeaders })
  }
}
