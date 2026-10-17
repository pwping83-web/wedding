export const config = {
  runtime: 'edge',
}

import { handleAdminDeliveries } from '../server/apiHandlers/admin-deliveries'
import { handleAdminDelivery } from '../server/apiHandlers/admin-delivery'
import { handleAdminLogin } from '../server/apiHandlers/admin-login'
import { handleAdminVideoText } from '../server/apiHandlers/admin-video-text'
import { handleAdminVideoTexts } from '../server/apiHandlers/admin-video-texts'
import { handleGenerateScript } from '../server/apiHandlers/generate-script'
import { handleLoadCueSheet } from '../server/apiHandlers/load-cue-sheet'
import { handleNotifySiteVisit } from '../server/apiHandlers/notify-site-visit'
import { handlePrintCueSheet } from '../server/apiHandlers/print-cue-sheet'
import { handleSaveCueSheetDraft } from '../server/apiHandlers/save-cue-sheet-draft'
import { handleSendCueSheet } from '../server/apiHandlers/send-cue-sheet'
import { handleSubmitMcRequest } from '../server/apiHandlers/submit-mc-request'
import { handleSubmitVideoText } from '../server/apiHandlers/submit-video-text'

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
