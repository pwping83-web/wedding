import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import { getBearerToken, verifyAdminSessionToken } from '../api/lib/adminAuth'
import { isValidVideoAccessCode } from '../api/lib/videoAccessCodes'
import { sendVideoTextSavedNotification } from '../api/lib/sendVideoTextEmail'
import {
  getVideoTextSubmission,
  insertVideoTextSubmission,
  listVideoTextSubmissions,
  videoTextStoreConfigured,
} from '../api/lib/videoTextStore'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function jsonResponse(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.end(JSON.stringify(body))
}

function corsPreflight(response: ServerResponse) {
  response.statusCode = 204
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.end()
}

export function videoTextDevApiPlugin(): Plugin {
  return {
    name: 'video-text-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        const response = res as ServerResponse
        const env = loadEnv(server.config.mode, server.config.root, '')
        Object.assign(process.env, env)

        if (url === '/api/submit-video-text') {
          if (req.method === 'OPTIONS') {
            corsPreflight(response)
            return
          }
          if (req.method !== 'POST') {
            jsonResponse(response, 405, { error: 'Method not allowed' })
            return
          }
          try {
            const raw = JSON.parse(await readBody(req)) as {
              accessCode?: string
              contactEmail?: string
              groomName?: string
              brideName?: string
              textPayload?: Record<string, string>
            }
            if (!isValidVideoAccessCode(raw.accessCode ?? '', env)) {
              jsonResponse(response, 403, { error: '무료제작 코드를 확인해 주세요.' })
              return
            }
            const record = await insertVideoTextSubmission({
              contactEmail: raw.contactEmail?.trim() ?? '',
              groomName: raw.groomName?.trim() || '신랑',
              brideName: raw.brideName?.trim() || '신부',
              textPayload: raw.textPayload ?? {},
            })
            try {
              await sendVideoTextSavedNotification(env, record)
            } catch (mailError) {
              console.error('video text notify email failed', mailError)
            }
            jsonResponse(response, 200, { ok: true, id: record.id })
          } catch (error) {
            jsonResponse(response, 500, {
              error: error instanceof Error ? error.message : '글귀 저장에 실패했습니다.',
            })
          }
          return
        }

        if (url === '/api/admin/video-texts') {
          if (req.method === 'OPTIONS') {
            corsPreflight(response)
            return
          }
          if (req.method !== 'GET') {
            jsonResponse(response, 405, { error: 'Method not allowed' })
            return
          }
          if (!(await verifyAdminSessionToken(getAuthToken(req)))) {
            jsonResponse(response, 401, { error: '로그인이 필요합니다.' })
            return
          }
          try {
            const items = await listVideoTextSubmissions()
            jsonResponse(response, 200, {
              items: items.map(({ textPayload: _p, ...summary }) => summary),
              archiveConfigured: videoTextStoreConfigured(),
            })
          } catch (error) {
            jsonResponse(response, 500, {
              error: error instanceof Error ? error.message : '글귀 목록을 불러오지 못했습니다.',
            })
          }
          return
        }

        if (url === '/api/admin/video-text') {
          if (req.method === 'OPTIONS') {
            corsPreflight(response)
            return
          }
          if (req.method !== 'GET') {
            jsonResponse(response, 405, { error: 'Method not allowed' })
            return
          }
          if (!(await verifyAdminSessionToken(getAuthToken(req)))) {
            jsonResponse(response, 401, { error: '로그인이 필요합니다.' })
            return
          }
          const id = new URL(req.url || '', `http://${req.headers.host}`).searchParams.get('id')
          if (!id) {
            jsonResponse(response, 400, { error: 'id가 필요합니다.' })
            return
          }
          try {
            const item = await getVideoTextSubmission(id)
            if (!item) {
              jsonResponse(response, 404, { error: '기록을 찾을 수 없습니다.' })
              return
            }
            jsonResponse(response, 200, { item })
          } catch (error) {
            jsonResponse(response, 500, {
              error: error instanceof Error ? error.message : '글귀를 불러오지 못했습니다.',
            })
          }
          return
        }

        next()
      })
    },
  }
}

function getAuthToken(req: IncomingMessage): string | null {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length).trim() || null
}
