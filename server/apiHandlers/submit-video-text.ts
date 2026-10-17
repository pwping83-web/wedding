import { isValidVideoAccessCode } from '../../api/lib/videoAccessCodes'
import { sendVideoTextSavedNotification } from '../../api/lib/sendVideoTextEmail'
import { insertVideoTextSubmission } from '../../api/lib/videoTextStore'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

type SubmitPayload = {
  accessCode?: string
  contactEmail?: string
  groomName?: string
  brideName?: string
  textPayload?: Record<string, string>
}

export async function handleSubmitVideoText(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  const env = process.env as Record<string, string | undefined>

  try {
    const raw = (await request.json()) as SubmitPayload
    const accessCode = raw.accessCode?.trim() ?? ''
    const contactEmail = raw.contactEmail?.trim() ?? ''
    const groomName = raw.groomName?.trim() || '?�랑'
    const brideName = raw.brideName?.trim() || '?��?'
    const textPayload = raw.textPayload ?? {}

    if (!isValidVideoAccessCode(accessCode, env)) {
      return Response.json({ error: '무료?�작 코드�??�인??주세??' }, { status: 403, headers: corsHeaders })
    }
    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return Response.json({ error: '?�메?�을 ?�력??주세??' }, { status: 400, headers: corsHeaders })
    }
    if (Object.keys(textPayload).length === 0) {
      return Response.json({ error: '?�?�할 글귀가 ?�습?�다.' }, { status: 400, headers: corsHeaders })
    }

    const record = await insertVideoTextSubmission({
      contactEmail,
      groomName,
      brideName,
      textPayload,
    })

    try {
      await sendVideoTextSavedNotification(env, record)
    } catch (mailError) {
      console.error('video text notify email failed', mailError)
    }

    return Response.json({ ok: true, id: record.id }, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : '글귀 ?�?�에 ?�패?�습?�다.'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
