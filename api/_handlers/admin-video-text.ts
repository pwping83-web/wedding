import { getBearerToken, verifyAdminSessionToken } from '../lib/adminAuth'
import { getVideoTextSubmission } from '../lib/videoTextStore'

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
    return Response.json({ error: 'ë¡œê·¸?¸ì´ ?„ìš”?©ë‹ˆ??' }, { status: 401, headers: corsHeaders })
  }

  const id = new URL(request.url).searchParams.get('id')
  if (!id) {
    return Response.json({ error: 'idê°€ ?„ìš”?©ë‹ˆ??' }, { status: 400, headers: corsHeaders })
  }

  try {
    const item = await getVideoTextSubmission(id)
    if (!item) {
      return Response.json({ error: 'ê¸°ë¡??ì°¾ì„ ???†ìŠµ?ˆë‹¤.' }, { status: 404, headers: corsHeaders })
    }
    return Response.json({ item }, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ê¸€ê·€ë¥?ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
