export const config = {
  runtime: 'edge',
}

import {
  findCueSheetByPhone,
  isValidSavePhone,
  normalizeSavePhone,
  resolveSavedCueSheetFromStore,
} from './lib/draftStore'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  const url = new URL(request.url)
  const phoneRaw = url.searchParams.get('phone')?.trim() ?? ''
  const groomName = url.searchParams.get('groomName')?.trim() ?? ''
  const brideName = url.searchParams.get('brideName')?.trim() ?? ''

  try {
    const phone = normalizeSavePhone(phoneRaw)
    if (phoneRaw) {
      if (!isValidSavePhone(phone)) {
        return Response.json({ error: '올바른 전화번호를 입력해 주세요.' }, { status: 400, headers: corsHeaders })
      }
      const saved = await findCueSheetByPhone(phone)
      if (!saved) {
        return Response.json({ error: '저장된 식순을 찾지 못했습니다.' }, { status: 404, headers: corsHeaders })
      }
      return Response.json(
        {
          savedAt: saved.savedAt,
          data: saved.appData,
          flowScreen: saved.flowScreen,
        },
        { headers: corsHeaders },
      )
    }

    if (!groomName || !brideName) {
      return Response.json({ error: '전화번호 또는 신랑·신부 이름이 필요합니다.' }, { status: 400, headers: corsHeaders })
    }

    const saved = await resolveSavedCueSheetFromStore(groomName, brideName)
    if (!saved) {
      return Response.json({ error: '저장된 식순을 찾지 못했습니다.' }, { status: 404, headers: corsHeaders })
    }

    return Response.json(
      {
        savedAt: saved.savedAt,
        data: saved.appData,
        flowScreen: saved.flowScreen,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : '저장된 식순을 불러오지 못했습니다.'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
