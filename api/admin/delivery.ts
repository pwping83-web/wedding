export const config = {
  runtime: 'edge',
}

import { getBearerToken, verifyAdminSessionToken } from '../lib/adminAuth'
import { deleteDeliveryRecord, listDeliveryRecords } from '../lib/deliveryStore'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const authorized = await verifyAdminSessionToken(getBearerToken(request))
  if (!authorized) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401, headers: corsHeaders })
  }

  const id = new URL(request.url).searchParams.get('id')?.trim()
  if (!id) {
    return Response.json({ error: 'id가 필요합니다.' }, { status: 400, headers: corsHeaders })
  }

  if (request.method === 'GET') {
    try {
      const deliveries = await listDeliveryRecords()
      const delivery = deliveries.find((item) => item.id === id)
      if (!delivery) {
        return Response.json({ error: '기록을 찾을 수 없습니다.' }, { status: 404, headers: corsHeaders })
      }

      return Response.json({ delivery }, { headers: corsHeaders })
    } catch (error) {
      const message = error instanceof Error ? error.message : '기록을 불러오지 못했습니다.'
      return Response.json({ error: message }, { status: 500, headers: corsHeaders })
    }
  }

  if (request.method === 'DELETE') {
    try {
      const deleted = await deleteDeliveryRecord(id)
      if (!deleted) {
        return Response.json(
          { error: '저장소가 설정되지 않았습니다.' },
          { status: 503, headers: corsHeaders },
        )
      }

      return Response.json({ ok: true }, { headers: corsHeaders })
    } catch (error) {
      const message = error instanceof Error ? error.message : '기록을 삭제하지 못했습니다.'
      return Response.json({ error: message }, { status: 500, headers: corsHeaders })
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
}
