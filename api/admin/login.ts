export const config = {
  runtime: 'edge',
}

import {
  adminPasswordConfigured,
  createAdminSessionToken,
  verifyAdminPassword,
} from '../lib/adminAuth'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  if (!adminPasswordConfigured()) {
    return Response.json(
      { error: '관리자 비밀번호가 서버에 설정되지 않았습니다.' },
      { status: 503, headers: corsHeaders },
    )
  }

  try {
    const body = (await request.json()) as { password?: string }
    const password = body.password?.trim() ?? ''

    if (!verifyAdminPassword(password)) {
      return Response.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401, headers: corsHeaders })
    }

    const token = await createAdminSessionToken()
    return Response.json({ ok: true, token }, { headers: corsHeaders })
  } catch {
    return Response.json({ error: '로그인에 실패했습니다.' }, { status: 500, headers: corsHeaders })
  }
}
