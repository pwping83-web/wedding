import { generateScriptText, readJsonBody, type GenerateScriptInput } from '../server/groqGenerate'

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
    const input = await readJsonBody<GenerateScriptInput>(request)
    const script = await generateScriptText(input, apiKey)
    return Response.json({ script }, { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Script generation failed'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
