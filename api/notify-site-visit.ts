export const config = {
  runtime: 'edge',
}

import { isSiteVisitNotifyEnabled, sendSiteVisitNotification } from './lib/sendSiteVisitEmail'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

type VisitPayload = {
  page?: string
  path?: string
  referrer?: string
}

function clientIpHint(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    ''
  )
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  const env = process.env as Record<string, string | undefined>

  if (!isSiteVisitNotifyEnabled(env)) {
    return Response.json({ ok: true, skipped: true }, { headers: corsHeaders })
  }

  try {
    const raw = (await request.json()) as VisitPayload
    const page = raw.page?.trim() || 'landing'
    if (page !== 'landing') {
      return Response.json({ ok: true, skipped: true }, { headers: corsHeaders })
    }

    const info = {
      page,
      path: raw.path?.trim().slice(0, 500) || '/',
      referrer: raw.referrer?.trim().slice(0, 500) || '',
      userAgent: (request.headers.get('user-agent') || '').slice(0, 500),
      at: new Date().toISOString(),
      ipHint: clientIpHint(request),
    }

    try {
      await sendSiteVisitNotification(env, info)
    } catch (mailError) {
      console.error('site visit notify email failed', mailError)
    }

    return Response.json({ ok: true }, { headers: corsHeaders })
  } catch (error) {
    console.error('notify-site-visit', error)
    return Response.json({ ok: true }, { headers: corsHeaders })
  }
}
