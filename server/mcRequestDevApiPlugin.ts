import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import { insertMcRequest, type McRequestInsert } from '../api/lib/mcRequestStore'
import { getResendConfig, sendMcRequestNotificationEmail } from '../api/lib/sendMcRequestEmail'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function normalizePayload(raw: Record<string, unknown>): McRequestInsert {
  const groomName = String(raw.groomName ?? '').trim()
  const brideName = String(raw.brideName ?? '').trim()
  const venue = String(raw.venue ?? '').trim()
  const phone = String(raw.phone ?? '').trim()
  const email = String(raw.email ?? '').trim()
  const message = String(raw.message ?? '').trim()
  const ceremonyDate = String(raw.ceremonyDate ?? '').trim() || null
  const ceremonyTime = String(raw.ceremonyTime ?? '').trim()
  const wantsPreweddingVideo = Boolean(raw.wantsPreweddingVideo)
  const privacyAgreed = Boolean(raw.privacyAgreed)

  if (!phone) throw new Error('연락처를 입력해 주세요.')
  if (!message) throw new Error('문의 내용을 입력해 주세요.')
  if (!privacyAgreed) throw new Error('개인정보 수집·이용에 동의해 주세요.')

  return {
    groomName: groomName || '미입력',
    brideName: brideName || '미입력',
    ceremonyDate,
    ceremonyTime,
    venue: venue || '미입력',
    phone,
    email: email || '미입력',
    message,
    wantsPreweddingVideo,
    privacyAgreed,
  }
}

export function mcRequestDevApiPlugin(): Plugin {
  return {
    name: 'mc-request-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/api/submit-mc-request') return next()

        const response = res as ServerResponse

        if (req.method === 'OPTIONS') {
          response.statusCode = 204
          response.setHeader('Access-Control-Allow-Origin', '*')
          response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          response.end()
          return
        }

        if (req.method !== 'POST') {
          response.statusCode = 405
          response.end('Method not allowed')
          return
        }

        const env = loadEnv(server.config.mode, server.config.root, '')
        Object.assign(process.env, env)

        try {
          const raw = JSON.parse(await readBody(req)) as Record<string, unknown>
          const payload = normalizePayload(raw)
          const record = await insertMcRequest(payload)

          const resend = getResendConfig(env)
          const notifyTo = env.OWNER_EMAIL?.trim() || env.MC_NOTIFY_EMAIL?.trim() || 'tseizou@naver.com'
          if (resend) {
            try {
              await sendMcRequestNotificationEmail(resend, record, notifyTo)
            } catch (mailError) {
              console.error('mc request notify email failed', mailError)
            }
          }

          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ ok: true, id: record.id }))
        } catch (error) {
          const message = error instanceof Error ? error.message : '상담 신청에 실패했습니다.'
          const status =
            message.includes('입력') || message.includes('동의') ? 400 : 500
          response.statusCode = status
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}
