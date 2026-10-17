export const config = {
  runtime: 'edge',
}

import {
  isValidSavePhone,
  normalizeSavePhone,
  upsertCueSheetByPhone,
  upsertCueSheetDraft,
} from './lib/draftStore'

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
    const body = (await request.json()) as { data?: unknown; flowScreen?: string }
    const data = body.data as { groomName?: string; brideName?: string; cueSavePhone?: string } | undefined
    const groomName = data?.groomName?.trim() ?? ''
    const brideName = data?.brideName?.trim() ?? ''
    const flowScreen = body.flowScreen?.trim() || 'basic'

    if (!body.data) {
      return Response.json({ error: '저장할 식순 정보가 올바르지 않습니다.' }, { status: 400, headers: corsHeaders })
    }

    const phone = normalizeSavePhone(data?.cueSavePhone ?? '')
    if (isValidSavePhone(phone)) {
      const saved = await upsertCueSheetByPhone(phone, body.data, flowScreen)
      if (!saved) {
        return Response.json({ error: '저장소가 설정되지 않았습니다.' }, { status: 503, headers: corsHeaders })
      }
      return Response.json(
        { ok: true, savedAt: saved.savedAt, flowScreen: saved.flowScreen },
        { headers: corsHeaders },
      )
    }

    if (!groomName || !brideName) {
      return Response.json(
        { error: 'QCT 저장용 전화번호 또는 신랑·신부 이름이 필요합니다.' },
        { status: 400, headers: corsHeaders },
      )
    }

    const saved = await upsertCueSheetDraft(groomName, brideName, body.data)
    if (!saved) {
      return Response.json({ error: '저장소가 설정되지 않았습니다.' }, { status: 503, headers: corsHeaders })
    }

    return Response.json({ ok: true, savedAt: saved.savedAt }, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : '식순 저장에 실패했습니다.'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
