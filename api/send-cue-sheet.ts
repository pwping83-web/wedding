export const config = {
  runtime: 'edge',
}

import {
  getEmailConfig,
  sendCueSheetEmail,
  type SendCueSheetPayload,
} from './lib/sendCueSheetEmail'

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

  try {
    const payload = (await request.json()) as SendCueSheetPayload
    if (!payload.mcEmail?.trim()) {
      return Response.json(
        { error: '사회자 이메일이 설정되지 않았습니다.' },
        { status: 400, headers: corsHeaders },
      )
    }

    if (!payload.cueSheet?.trim()) {
      return Response.json(
        { error: '큐시트 내용이 비어 있습니다.' },
        { status: 400, headers: corsHeaders },
      )
    }

    const emailConfig = getEmailConfig(process.env as Record<string, string | undefined>)
    await sendCueSheetEmail(emailConfig, payload)

    return Response.json({ ok: true }, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : '이메일 전송에 실패했습니다.'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
