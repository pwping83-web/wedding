import {
  adminPasswordConfigured,
  createAdminSessionToken,
  verifyAdminPassword,
} from '../apiLib/adminAuth'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function handleAdminLogin(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  if (!adminPasswordConfigured()) {
    return Response.json(
      { error: '관리자 비�?번호가 ?�버???�정?��? ?�았?�니??' },
      { status: 503, headers: corsHeaders },
    )
  }

  try {
    const body = (await request.json()) as { password?: string }
    const password = body.password?.trim() ?? ''

    if (!verifyAdminPassword(password)) {
      return Response.json({ error: '비�?번호가 ?�바르�? ?�습?�다.' }, { status: 401, headers: corsHeaders })
    }

    const token = await createAdminSessionToken()
    return Response.json({ ok: true, token }, { headers: corsHeaders })
  } catch {
    return Response.json({ error: '로그?�에 ?�패?�습?�다.' }, { status: 500, headers: corsHeaders })
  }
}
