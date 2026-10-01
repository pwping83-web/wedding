export const config = {
  runtime: 'edge',
}

import { getBearerToken, verifyAdminSessionToken } from '../lib/adminAuth'
import { getVideoTextSubmission } from '../lib/videoTextStore'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  const authorized = await verifyAdminSessionToken(getBearerToken(request))
  if (!authorized) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401, headers: corsHeaders })
  }

  const id = new URL(request.url).searchParams.get('id')
  if (!id) {
    return Response.json({ error: 'id가 필요합니다.' }, { status: 400, headers: corsHeaders })
  }

  try {
    const item = await getVideoTextSubmission(id)
    if (!item) {
      return Response.json({ error: '기록을 찾을 수 없습니다.' }, { status: 404, headers: corsHeaders })
    }
    return Response.json({ item }, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : '글귀를 불러오지 못했습니다.'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
