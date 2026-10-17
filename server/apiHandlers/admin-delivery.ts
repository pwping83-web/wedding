import { getBearerToken, verifyAdminSessionToken } from '../../api/lib/adminAuth'
import {
  deleteDeliveryRecord,
  listDeliveryRecords,
  updateDeliveryPrintHtml,
} from '../../api/lib/deliveryStore'

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
    return Response.json({ error: '로그?�이 ?�요?�니??' }, { status: 401, headers: corsHeaders })
  }

  const id = new URL(request.url).searchParams.get('id')?.trim()
  if (!id) {
    return Response.json({ error: 'id가 ?�요?�니??' }, { status: 400, headers: corsHeaders })
  }

  if (request.method === 'GET') {
    try {
      const deliveries = await listDeliveryRecords()
      const delivery = deliveries.find((item) => item.id === id)
      if (!delivery) {
        return Response.json({ error: '기록??찾을 ???�습?�다.' }, { status: 404, headers: corsHeaders })
      }

      return Response.json({ delivery }, { headers: corsHeaders })
    } catch (error) {
      const message = error instanceof Error ? error.message : '기록??불러?��? 못했?�니??'
      return Response.json({ error: message }, { status: 500, headers: corsHeaders })
    }
  }

  if (request.method === 'PATCH') {
    try {
      const body = (await request.json()) as { printHtml?: string }
      const printHtml = body.printHtml?.trim()
      if (!printHtml) {
        return Response.json({ error: 'printHtml???�요?�니??' }, { status: 400, headers: corsHeaders })
      }

      const delivery = await updateDeliveryPrintHtml(id, printHtml)
      if (!delivery) {
        return Response.json(
          { error: '?�?�소가 ?�정?��? ?�았?�니??' },
          { status: 503, headers: corsHeaders },
        )
      }

      return Response.json({ delivery }, { headers: corsHeaders })
    } catch (error) {
      const message = error instanceof Error ? error.message : '기록???�정?��? 못했?�니??'
      return Response.json({ error: message }, { status: 500, headers: corsHeaders })
    }
  }

  if (request.method === 'DELETE') {
    try {
      const deleted = await deleteDeliveryRecord(id)
      if (!deleted) {
        return Response.json(
          { error: '?�?�소가 ?�정?��? ?�았?�니??' },
          { status: 503, headers: corsHeaders },
        )
      }

      return Response.json({ ok: true }, { headers: corsHeaders })
    } catch (error) {
      const message = error instanceof Error ? error.message : '기록????��?��? 못했?�니??'
      return Response.json({ error: message }, { status: 500, headers: corsHeaders })
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
}
