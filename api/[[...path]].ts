export const config = {
  runtime: 'edge',
}

import { handleAdminDeliveries } from './_handlers/admin-deliveries'
import { handleAdminDelivery } from './_handlers/admin-delivery'
import { handleAdminLogin } from './_handlers/admin-login'
import { handleAdminVideoText } from './_handlers/admin-video-text'
import { handleAdminVideoTexts } from './_handlers/admin-video-texts'
import { handleGenerateScript } from './_handlers/generate-script'
import { handleLoadCueSheet } from './_handlers/load-cue-sheet'
import { handleNotifySiteVisit } from './_handlers/notify-site-visit'
import { handlePrintCueSheet } from './_handlers/print-cue-sheet'
import { handleSaveCueSheetDraft } from './_handlers/save-cue-sheet-draft'
import { handleSendCueSheet } from './_handlers/send-cue-sheet'
import { handleSubmitMcRequest } from './_handlers/submit-mc-request'
import { handleSubmitVideoText } from './_handlers/submit-video-text'

type RouteHandler = (request: Request) => Promise<Response>

const ROUTES: Record<string, RouteHandler> = {
  'load-cue-sheet': handleLoadCueSheet,
  'save-cue-sheet-draft': handleSaveCueSheetDraft,
  'notify-site-visit': handleNotifySiteVisit,
  'print-cue-sheet': handlePrintCueSheet,
  'send-cue-sheet': handleSendCueSheet,
  'generate-script': handleGenerateScript,
  'submit-mc-request': handleSubmitMcRequest,
  'submit-video-text': handleSubmitVideoText,
  'admin/login': handleAdminLogin,
  'admin/deliveries': handleAdminDeliveries,
  'admin/delivery': handleAdminDelivery,
  'admin/video-texts': handleAdminVideoTexts,
  'admin/video-text': handleAdminVideoText,
}

function routeKeyFromRequest(request: Request): string {
  const url = new URL(request.url)
  return decodeURIComponent(url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, ''))
}

export default async function handler(request: Request): Promise<Response> {
  const key = routeKeyFromRequest(request)
  const route = ROUTES[key]
  if (!route) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  return route(request)
}
