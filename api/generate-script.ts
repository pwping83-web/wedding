export const config = {
  runtime: 'edge',
}

import {
  buildGeneratePrompt,
  buildGenerateSystemPrompt,
  maxCompletionTokens,
  type GenerateScriptInput,
} from '../server/generateScriptPrompt'

async function generateScriptText(input: GenerateScriptInput, apiKey: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      temperature: 0.85,
      max_completion_tokens: maxCompletionTokens(input.kind),
      messages: [
        {
          role: 'system',
          content: buildGenerateSystemPrompt(input.kind),
        },
        { role: 'user', content: buildGeneratePrompt(input) },
      ],
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Groq API error (${response.status}): ${detail}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = payload.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('Groq returned empty script')
  return text
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500, headers: corsHeaders })
  }

  try {
    const input = (await request.json()) as GenerateScriptInput
    const script = await generateScriptText(input, apiKey)
    return Response.json({ script }, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Script generation failed'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
