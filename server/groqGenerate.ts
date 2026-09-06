export type { GenerateScriptInput, GenerateScriptKind } from './generateScriptPrompt'

import {
  buildGeneratePrompt,
  buildGenerateSystemPrompt,
  cleanGeneratedScript,
  maxCompletionTokens,
  type GenerateScriptInput,
} from './generateScriptPrompt'

export async function generateScriptText(
  input: GenerateScriptInput,
  apiKey: string,
): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      temperature: 0.92,
      top_p: 0.9,
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
  return cleanGeneratedScript(input.kind, text)
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T
}
