import { getBearerToken, verifyAdminSessionToken } from '../lib/adminAuth'
import {
  deleteDeliveryRecord,
  listDeliveryRecords,
  updateDeliveryPrintHtml,
} from '../lib/deliveryStore'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function handleAdminDelivery(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const authorized = await verifyAdminSessionToken(getBearerToken(request))
  if (!authorized) {
    return Response.json({ error: 'ë¡œê·¸?¸ì´ ?„ìš”?©ë‹ˆ??' }, { status: 401, headers: corsHeaders })
  }

  const id = new URL(request.url).searchParams.get('id')?.trim()
  if (!id) {
    return Response.json({ error: 'idê°€ ?„ìš”?©ë‹ˆ??' }, { status: 400, headers: corsHeaders })
  }

  if (request.method === 'GET') {
    try {
      const deliveries = await listDeliveryRecords()
      const delivery = deliveries.find((item) => item.id === id)
      if (!delivery) {
        return Response.json({ error: 'ê¸°ë¡??ì°¾ì„ ???†ìŠµ?ˆë‹¤.' }, { status: 404, headers: corsHeaders })
      }

      return Response.json({ delivery }, { headers: corsHeaders })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ê¸°ë¡??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??'
      return Response.json({ error: message }, { status: 500, headers: corsHeaders })
    }
  }

  if (request.method === 'PATCH') {
    try {
      const body = (await request.json()) as { printHtml?: string }
      const printHtml = body.printHtml?.trim()
      if (!printHtml) {
        return Response.json({ error: 'printHtml???„ìš”?©ë‹ˆ??' }, { status: 400, headers: corsHeaders })
      }

      const delivery = await updateDeliveryPrintHtml(id, printHtml)
      if (!delivery) {
        return Response.json(
          { error: '?€?¥ì†Œê°€ ?¤ì •?˜ì? ?Šì•˜?µë‹ˆ??' },
          { status: 503, headers: corsHeaders },
        )
      }

      return Response.json({ delivery }, { headers: corsHeaders })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ê¸°ë¡???˜ì •?˜ì? ëª»í–ˆ?µë‹ˆ??'
      return Response.json({ error: message }, { status: 500, headers: corsHeaders })
    }
  }

  if (request.method === 'DELETE') {
    try {
      const deleted = await deleteDeliveryRecord(id)
      if (!deleted) {
        return Response.json(
          { error: '?€?¥ì†Œê°€ ?¤ì •?˜ì? ?Šì•˜?µë‹ˆ??' },
          { status: 503, headers: corsHeaders },
        )
      }

      return Response.json({ ok: true }, { headers: corsHeaders })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ê¸°ë¡???? œ?˜ì? ëª»í–ˆ?µë‹ˆ??'
      return Response.json({ error: message }, { status: 500, headers: corsHeaders })
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
}
