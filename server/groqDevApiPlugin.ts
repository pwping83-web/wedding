import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import { generateScriptText, type GenerateScriptInput } from './groqGenerate'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function groqDevApiPlugin(): Plugin {
  return {
    name: 'groq-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/api/generate-script') return next()

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
        const apiKey = env.GROQ_API_KEY
        if (!apiKey) {
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: 'GROQ_API_KEY is not configured' }))
          return
        }

        try {
          const raw = await readBody(req)
          const input = JSON.parse(raw) as GenerateScriptInput
          const script = await generateScriptText(input, apiKey)
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ script }))
        } catch (error) {
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Script generation failed',
            }),
          )
        }
      })
    },
  }
}
