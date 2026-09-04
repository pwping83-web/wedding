export const config = {
  runtime: 'edge',
}

import { getEmailConfig, sendCueSheetEmail, type SendCueSheetPayload } from '../server/sendCueSheetEmail'

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload = (await request.json()) as SendCueSheetPayload
    if (!payload.mcEmail?.trim()) {
      return Response.json({ error: '사회자 이메일을 입력해 주세요.' }, { status: 400 })
    }

    const emailConfig = getEmailConfig(process.env as Record<string, string | undefined>)
    await sendCueSheetEmail(emailConfig, payload)

    return Response.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : '이메일 전송에 실패했습니다.'
    return Response.json({ error: message }, { status: 500 })
  }
}
