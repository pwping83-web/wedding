import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateScriptText, type GenerateScriptInput } from './groqGenerate'

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured' })
  }

  try {
    const input = req.body as GenerateScriptInput
    const script = await generateScriptText(input, apiKey)
    return res.status(200).json({ script })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Script generation failed'
    return res.status(500).json({ error: message })
  }
}
