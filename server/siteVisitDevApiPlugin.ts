import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import { sendSiteVisitNotification } from '../api/lib/sendSiteVisitEmail'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function siteVisitDevApiPlugin(): Plugin {
  return {
    name: 'site-visit-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/api/notify-site-visit') return next()

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
          const raw = JSON.parse(await readBody(req)) as {
            page?: string
            path?: string
            referrer?: string
          }
          const page = raw.page?.trim() || 'landing'

          if (page === 'landing') {
            const info = {
              page,
              path: raw.path?.trim().slice(0, 500) || '/',
              referrer: raw.referrer?.trim().slice(0, 500) || '',
              userAgent: (req.headers['user-agent'] || '').slice(0, 500),
              at: new Date().toISOString(),
              ipHint: String(req.socket.remoteAddress || ''),
            }

            try {
              await sendSiteVisitNotification(env, info)
            } catch (mailError) {
              console.error('site visit notify email failed', mailError)
            }
          }

          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ ok: true }))
        } catch (error) {
          console.error('notify-site-visit dev', error)
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ ok: true }))
        }
      })
    },
  }
}
