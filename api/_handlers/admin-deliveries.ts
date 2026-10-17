import { getBearerToken, verifyAdminSessionToken } from '../lib/adminAuth'
import { deliveryArchiveConfigured, listDeliveryRecords } from '../lib/deliveryStore'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function handleAdminDeliveries(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  const authorized = await verifyAdminSessionToken(getBearerToken(request))
  if (!authorized) {
    return Response.json({ error: 'Î°úÍ∑∏?∏Ïù¥ ?ÑÏöî?©Îãà??' }, { status: 401, headers: corsHeaders })
  }

  try {
    const deliveries = await listDeliveryRecords()
    return Response.json(
      {
        deliveries: deliveries.map(({ printHtml: _printHtml, ...summary }) => summary),
        archiveConfigured: deliveryArchiveConfigured(),
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : '?ÑÏÜ° Í∏∞Î°ù??Î∂àÎü¨?§Ï? Î™ªÌñà?µÎãà??'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
