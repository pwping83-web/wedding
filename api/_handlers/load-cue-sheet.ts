import {
  findCueSheetByPhone,
  isValidSavePhone,
  normalizeSavePhone,
  resolveSavedCueSheetFromStore,
} from '../lib/draftStore'

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
        return Response.json({ error: '?¬ë°”ë¥??„í™”ë²ˆí˜¸ë¥??…ë ¥??ì£¼ì„¸??' }, { status: 400, headers: corsHeaders })
      }
      const saved = await findCueSheetByPhone(phone)
      if (!saved) {
        return Response.json({ error: '?€?¥ëœ ?ìˆœ??ì°¾ì? ëª»í–ˆ?µë‹ˆ??' }, { status: 404, headers: corsHeaders })
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
      return Response.json({ error: '?„í™”ë²ˆí˜¸ ?ëŠ” ? ë‘Â·? ë? ?´ë¦„???„ìš”?©ë‹ˆ??' }, { status: 400, headers: corsHeaders })
    }

    const saved = await resolveSavedCueSheetFromStore(groomName, brideName)
    if (!saved) {
      return Response.json({ error: '?€?¥ëœ ?ìˆœ??ì°¾ì? ëª»í–ˆ?µë‹ˆ??' }, { status: 404, headers: corsHeaders })
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
    const message = error instanceof Error ? error.message : '?€?¥ëœ ?ìˆœ??ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
