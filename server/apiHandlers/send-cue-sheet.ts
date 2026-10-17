import {
  getEmailConfig,
  sendCueSheetEmail,
  type SendCueSheetPayload,
} from '../apiLib/sendCueSheetEmail'
import { saveDeliveryRecord } from '../apiLib/deliveryStore'
import { upsertCueSheetDraft } from '../apiLib/draftStore'

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
        { error: '?�회???�메?�이 ?�정?��? ?�았?�니??' },
        { status: 400, headers: corsHeaders },
      )
    }

    if (!payload.cueSheet?.trim()) {
      return Response.json(
        { error: '?�시???�용??비어 ?�습?�다.' },
        { status: 400, headers: corsHeaders },
      )
    }

    if (!payload.printHtml?.trim()) {
      return Response.json(
        { error: '?�쇄???�시?��? 비어 ?�습?�다.' },
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
    const message = error instanceof Error ? error.message : '?�메???�송???�패?�습?�다.'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
