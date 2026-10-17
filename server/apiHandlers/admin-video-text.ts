import { getBearerToken, verifyAdminSessionToken } from '../../api/lib/adminAuth'
import { getVideoTextSubmission } from '../../api/lib/videoTextStore'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function handleAdminVideoText(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  const authorized = await verifyAdminSessionToken(getBearerToken(request))
  if (!authorized) {
    return Response.json({ error: '로그?�이 ?�요?�니??' }, { status: 401, headers: corsHeaders })
  }

  const id = new URL(request.url).searchParams.get('id')
  if (!id) {
    return Response.json({ error: 'id가 ?�요?�니??' }, { status: 400, headers: corsHeaders })
  }

  try {
    const item = await getVideoTextSubmission(id)
    if (!item) {
      return Response.json({ error: '기록??찾을 ???�습?�다.' }, { status: 404, headers: corsHeaders })
    }
    return Response.json({ item }, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : '글귀�?불러?��? 못했?�니??'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
