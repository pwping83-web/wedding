import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import {
  adminPasswordConfigured,
  createAdminSessionToken,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from '../api/lib/adminAuth'
import type { SaveDeliveryInput } from '../api/lib/deliveryStore'
import { getEmailConfig, sendCueSheetEmail, type SendCueSheetPayload } from './sendCueSheetEmail'
import {
  deleteLocalDeliveryRecord,
  getLocalDeliveryRecord,
  listLocalDeliveryRecords,
  saveLocalDeliveryRecord,
} from './deliveryStoreLocal'

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
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.end()
}

function getAuthToken(req: IncomingMessage): string | null {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length).trim() || null
}

async function saveDeliveryFromPayload(payload: SendCueSheetPayload): Promise<void> {
  const meta = payload.meta
  if (!meta) return

  await saveLocalDeliveryRecord({
    subject: payload.subject,
    groomName: meta.groomName,
    brideName: meta.brideName,
    weddingDate: meta.weddingDate,
    weddingTime: meta.weddingTime,
    venue: meta.venue,
    mcEmail: payload.mcEmail,
    printHtml: payload.printHtml,
  })
}

export function adminDevApiPlugin(): Plugin {
  return {
    name: 'admin-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        const response = res as ServerResponse
        const env = loadEnv(server.config.mode, server.config.root, '')

        Object.assign(process.env, env)

        if (url === '/api/send-cue-sheet') {
          if (req.method === 'OPTIONS') {
            corsPreflight(response)
            return
          }

          if (req.method !== 'POST') {
            jsonResponse(response, 405, { error: 'Method not allowed' })
            return
          }

          try {
            const raw = await readBody(req)
            const payload = JSON.parse(raw) as SendCueSheetPayload

            if (!payload.mcEmail?.trim() || !payload.cueSheet?.trim() || !payload.printHtml?.trim()) {
              jsonResponse(response, 400, { error: '전송 정보가 올바르지 않습니다.' })
              return
            }

            const host = req.headers.host || 'localhost:8443'
            const fakeRequest = new Request(`http://${host}/`)
            const emailConfig = getEmailConfig(env)
            await sendCueSheetEmail(emailConfig, payload, fakeRequest)
            await saveDeliveryFromPayload(payload)
            jsonResponse(response, 200, { ok: true })
          } catch (error) {
            jsonResponse(response, 500, {
              error: error instanceof Error ? error.message : '이메일 전송에 실패했습니다.',
            })
          }
          return
        }

        if (url === '/api/admin/login') {
          if (req.method === 'OPTIONS') {
            corsPreflight(response)
            return
          }

          if (req.method !== 'POST') {
            jsonResponse(response, 405, { error: 'Method not allowed' })
            return
          }

          if (!adminPasswordConfigured()) {
            jsonResponse(response, 503, { error: '관리자 비밀번호가 서버에 설정되지 않았습니다.' })
            return
          }

          try {
            const raw = await readBody(req)
            const body = JSON.parse(raw) as { password?: string }
            if (!verifyAdminPassword(body.password?.trim() ?? '')) {
              jsonResponse(response, 401, { error: '비밀번호가 올바르지 않습니다.' })
              return
            }

            const token = await createAdminSessionToken()
            jsonResponse(response, 200, { ok: true, token })
          } catch {
            jsonResponse(response, 500, { error: '로그인에 실패했습니다.' })
          }
          return
        }

        if (url === '/api/admin/deliveries') {
          if (req.method === 'OPTIONS') {
            corsPreflight(response)
            return
          }

          if (req.method !== 'GET') {
            jsonResponse(response, 405, { error: 'Method not allowed' })
            return
          }

          const token = getAuthToken(req)
          if (!(await verifyAdminSessionToken(token))) {
            jsonResponse(response, 401, { error: '로그인이 필요합니다.' })
            return
          }

          try {
            const deliveries = await listLocalDeliveryRecords()
            jsonResponse(response, 200, {
              deliveries: deliveries.map(({ printHtml: _printHtml, ...summary }) => summary),
              archiveConfigured: true,
            })
          } catch (error) {
            jsonResponse(response, 500, {
              error: error instanceof Error ? error.message : '전송 기록을 불러오지 못했습니다.',
            })
          }
          return
        }

        if (url === '/api/admin/delivery') {
          if (req.method === 'OPTIONS') {
            corsPreflight(response)
            return
          }

          const token = getAuthToken(req)
          if (!(await verifyAdminSessionToken(token))) {
            jsonResponse(response, 401, { error: '로그인이 필요합니다.' })
            return
          }

          const id = new URL(req.url || '', `http://${req.headers.host}`).searchParams.get('id')
          if (!id) {
            jsonResponse(response, 400, { error: 'id가 필요합니다.' })
            return
          }

          if (req.method === 'GET') {
            try {
              const delivery = await getLocalDeliveryRecord(id)
              if (!delivery) {
                jsonResponse(response, 404, { error: '기록을 찾을 수 없습니다.' })
                return
              }
              jsonResponse(response, 200, { delivery })
            } catch (error) {
              jsonResponse(response, 500, {
                error: error instanceof Error ? error.message : '기록을 불러오지 못했습니다.',
              })
            }
            return
          }

          if (req.method === 'DELETE') {
            try {
              const deleted = await deleteLocalDeliveryRecord(id)
              if (!deleted) {
                jsonResponse(response, 404, { error: '기록을 찾을 수 없습니다.' })
                return
              }
              jsonResponse(response, 200, { ok: true })
            } catch (error) {
              jsonResponse(response, 500, {
                error: error instanceof Error ? error.message : '기록을 삭제하지 못했습니다.',
              })
            }
            return
          }

          jsonResponse(response, 405, { error: 'Method not allowed' })
          return
        }

        next()
      })
    },
  }
}

export type { SaveDeliveryInput }
