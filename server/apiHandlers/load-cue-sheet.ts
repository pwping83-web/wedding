import {
  findCueSheetByPhone,
  isValidSavePhone,
  normalizeSavePhone,
  resolveSavedCueSheetFromStore,
} from '../../api/lib/draftStore'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function handleLoadCueSheet(request: Request): Promise<Response> {
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
        return Response.json({ error: '?�바�??�화번호�??�력??주세??' }, { status: 400, headers: corsHeaders })
      }
      const saved = await findCueSheetByPhone(phone)
      if (!saved) {
        return Response.json({ error: '?�?�된 ?�순??찾�? 못했?�니??' }, { status: 404, headers: corsHeaders })
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
      return Response.json({ error: '?�화번호 ?�는 ?�랑·?��? ?�름???�요?�니??' }, { status: 400, headers: corsHeaders })
    }

    const saved = await resolveSavedCueSheetFromStore(groomName, brideName)
    if (!saved) {
      return Response.json({ error: '?�?�된 ?�순??찾�? 못했?�니??' }, { status: 404, headers: corsHeaders })
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
    const message = error instanceof Error ? error.message : '?�?�된 ?�순??불러?��? 못했?�니??'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
