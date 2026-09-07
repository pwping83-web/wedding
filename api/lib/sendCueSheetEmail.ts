import {
  encodePrintHtmlToken,
  MAX_PRINT_TOKEN_CHARS,
} from './printToken'
import { injectEmailPrintButton } from './emailPrintButtonHtml'

export type SendCueSheetPayload = {
  mcEmail: string
  subject: string
  cueSheet: string
  printHtml: string
}

type EmailConfig = {
  publicKey: string
  privateKey: string
  serviceId: string
  templateId: string
}

const EMAILJS_MAX_PARAMS_BYTES = 50 * 1024
const PARAMS_HEADROOM_BYTES = 4 * 1024

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

function trimCueSheetForEmail(text: string, maxBytes: number): string {
  if (byteLength(text) <= maxBytes) return text

  let trimmed = text
  const suffix = '\n\n...(큐시트가 길어 이메일 본문은 일부만 포함됩니다. 인쇄본을 참고해 주세요.)'

  while (trimmed.length > 0 && byteLength(trimmed + suffix) > maxBytes) {
    trimmed = trimmed.slice(0, Math.floor(trimmed.length * 0.92))
  }

  return trimmed.trimEnd() + suffix
}

function buildTemplateParams(
  payload: SendCueSheetPayload,
  cueSheetHtml: string,
): Record<string, string> {
  const otherFields: Record<string, string> = {
    to_email: payload.mcEmail,
    subject: payload.subject,
  }

  const otherBytes = byteLength(JSON.stringify(otherFields))
  const cueSheetBudget = EMAILJS_MAX_PARAMS_BYTES - PARAMS_HEADROOM_BYTES - otherBytes
  const mcCueSheet = trimCueSheetForEmail(cueSheetHtml, Math.max(8 * 1024, cueSheetBudget))

  return {
    ...otherFields,
    mc_cue_sheet: mcCueSheet,
  }
}

function getSiteOrigin(request?: Request): string {
  if (request) {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    if (host) return `${proto}://${host}`
  }
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return 'https://wedding-rcxo.vercel.app'
}

export async function prepareCueSheetEmailHtml(
  payload: SendCueSheetPayload,
  request?: Request,
): Promise<string> {
  let printUrl = ''
  const printHtml = payload.printHtml?.trim()

  if (printHtml) {
    const token = await encodePrintHtmlToken(printHtml)
    if (token.length <= MAX_PRINT_TOKEN_CHARS) {
      const origin = getSiteOrigin(request)
      printUrl = `${origin}/api/print-cue-sheet?t=${encodeURIComponent(token)}`
    }
  }

  return injectEmailPrintButton(payload.cueSheet, printUrl)
}

export function getEmailConfig(env: Record<string, string | undefined>): EmailConfig {
  const publicKey = env.EMAILJS_PUBLIC_KEY ?? env.VITE_EMAILJS_PUBLIC_KEY
  const privateKey = env.EMAILJS_PRIVATE_KEY
  const serviceId = env.EMAILJS_SERVICE_ID ?? env.VITE_EMAILJS_SERVICE_ID
  const templateId = env.EMAILJS_TEMPLATE_ID ?? env.VITE_EMAILJS_TEMPLATE_ID

  if (!publicKey || !templateId) {
    throw new Error('EmailJS 설정(EMAILJS_PUBLIC_KEY, EMAILJS_TEMPLATE_ID)이 필요합니다.')
  }

  if (!privateKey) {
    throw new Error('EmailJS Private Key(EMAILJS_PRIVATE_KEY)가 필요합니다.')
  }

  if (!serviceId) {
    throw new Error(
      'EmailJS 서비스 ID(EMAILJS_SERVICE_ID)가 필요합니다. EmailJS 대시보드 → Email Services에서 확인하세요.',
    )
  }

  return { publicKey, privateKey, serviceId, templateId }
}

export async function sendCueSheetEmail(
  config: EmailConfig,
  payload: SendCueSheetPayload,
  request?: Request,
): Promise<void> {
  const cueSheetHtml = await prepareCueSheetEmailHtml(payload, request)
  const templateParams = buildTemplateParams(payload, cueSheetHtml)

  if (byteLength(JSON.stringify(templateParams)) > EMAILJS_MAX_PARAMS_BYTES) {
    throw new Error('큐시트 내용이 너무 깁니다. 식순을 줄이거나 인쇄 기능을 이용해 주세요.')
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lib_version: '4.4.1',
      user_id: config.publicKey,
      accessToken: config.privateKey,
      service_id: config.serviceId,
      template_id: config.templateId,
      template_params: templateParams,
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(parseEmailJsError(detail))
  }
}

function parseEmailJsError(detail: string): string {
  try {
    const parsed = JSON.parse(detail) as { message?: string; error?: string }
    return parsed.message || parsed.error || detail || '이메일 전송에 실패했습니다.'
  } catch {
    return detail || '이메일 전송에 실패했습니다.'
  }
}
