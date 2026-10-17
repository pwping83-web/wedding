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

export async function handleAdminLogin(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  if (!adminPasswordConfigured()) {
    return Response.json(
      { error: 'ê´€ë¦¬ì ë¹„ë?ë²ˆí˜¸ê°€ ?œë²„???¤ì •?˜ì? ?Šì•˜?µë‹ˆ??' },
      { status: 503, headers: corsHeaders },
    )
  }

  try {
    const body = (await request.json()) as { password?: string }
    const password = body.password?.trim() ?? ''

    if (!verifyAdminPassword(password)) {
      return Response.json({ error: 'ë¹„ë?ë²ˆí˜¸ê°€ ?¬ë°”ë¥´ì? ?ŠìŠµ?ˆë‹¤.' }, { status: 401, headers: corsHeaders })
    }

    const token = await createAdminSessionToken()
    return Response.json({ ok: true, token }, { headers: corsHeaders })
  } catch {
    return Response.json({ error: 'ë¡œê·¸?¸ì— ?¤íŒ¨?ˆìŠµ?ˆë‹¤.' }, { status: 500, headers: corsHeaders })
  }
}
