import {
  getEmailConfig,
  sendCueSheetEmail,
  type SendCueSheetPayload,
} from '../lib/sendCueSheetEmail'
import { saveDeliveryRecord } from '../lib/deliveryStore'
import { upsertCueSheetDraft } from '../lib/draftStore'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function handleSendCueSheet(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  try {
    const payload = (await request.json()) as SendCueSheetPayload
    if (!payload.mcEmail?.trim()) {
      return Response.json(
        { error: '?¬íšŒ???´ë©”?¼ì´ ?¤ì •?˜ì? ?Šì•˜?µë‹ˆ??' },
        { status: 400, headers: corsHeaders },
      )
    }

    if (!payload.cueSheet?.trim()) {
      return Response.json(
        { error: '?ì‹œ???´ìš©??ë¹„ì–´ ?ˆìŠµ?ˆë‹¤.' },
        { status: 400, headers: corsHeaders },
      )
    }

    if (!payload.printHtml?.trim()) {
      return Response.json(
        { error: '?¸ì‡„???ì‹œ?¸ê? ë¹„ì–´ ?ˆìŠµ?ˆë‹¤.' },
        { status: 400, headers: corsHeaders },
      )
    }

    const emailConfig = getEmailConfig(process.env as Record<string, string | undefined>)
    await sendCueSheetEmail(emailConfig, payload, request)

    if (payload.meta) {
      try {
        if (payload.appData) {
          await upsertCueSheetDraft(
            payload.meta.groomName,
            payload.meta.brideName,
            payload.appData,
          )
        }

        await saveDeliveryRecord({
          subject: payload.subject,
          groomName: payload.meta.groomName,
          brideName: payload.meta.brideName,
          weddingDate: payload.meta.weddingDate,
          weddingTime: payload.meta.weddingTime,
          venue: payload.meta.venue,
          mcEmail: payload.mcEmail,
          printHtml: payload.printHtml,
          appData: payload.appData,
        })
      } catch (archiveError) {
        console.error('cue sheet archive failed', archiveError)
      }
    }

    return Response.json({ ok: true }, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : '?´ë©”???„ì†¡???¤íŒ¨?ˆìŠµ?ˆë‹¤.'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
