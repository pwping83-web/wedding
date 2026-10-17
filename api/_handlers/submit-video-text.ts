import { isValidVideoAccessCode } from '../lib/videoAccessCodes'
import { sendVideoTextSavedNotification } from '../lib/sendVideoTextEmail'
import { insertVideoTextSubmission } from '../lib/videoTextStore'

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
    const groomName = raw.groomName?.trim() || '? ë‘'
    const brideName = raw.brideName?.trim() || '? ë?'
    const textPayload = raw.textPayload ?? {}

    if (!isValidVideoAccessCode(accessCode, env)) {
      return Response.json({ error: 'ë¬´ë£Œ?œì‘ ì½”ë“œë¥??•ì¸??ì£¼ì„¸??' }, { status: 403, headers: corsHeaders })
    }
    if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return Response.json({ error: '?´ë©”?¼ì„ ?…ë ¥??ì£¼ì„¸??' }, { status: 400, headers: corsHeaders })
    }
    if (Object.keys(textPayload).length === 0) {
      return Response.json({ error: '?€?¥í•  ê¸€ê·€ê°€ ?†ìŠµ?ˆë‹¤.' }, { status: 400, headers: corsHeaders })
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
    const message = error instanceof Error ? error.message : 'ê¸€ê·€ ?€?¥ì— ?¤íŒ¨?ˆìŠµ?ˆë‹¤.'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
