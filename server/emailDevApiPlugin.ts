import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import { getEmailConfig, sendCueSheetEmail, type SendCueSheetPayload } from './sendCueSheetEmail'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function emailDevApiPlugin(): Plugin {
  return {
    name: 'email-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/api/send-cue-sheet') return next()

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

        try {
          const raw = await readBody(req)
          const payload = JSON.parse(raw) as SendCueSheetPayload
          if (!payload.mcEmail?.trim()) {
            response.statusCode = 400
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ error: '사회자 이메일을 입력해 주세요.' }))
            return
          }

          const emailConfig = getEmailConfig(env)
          await sendCueSheetEmail(emailConfig, payload)
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ ok: true }))
        } catch (error) {
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : '이메일 전송에 실패했습니다.',
            }),
          )
        }
      })
    },
  }
}
