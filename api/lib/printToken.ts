const TOKEN_VERSION = '1'

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(token: string): Uint8Array {
  const padded = token.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = (4 - (padded.length % 4)) % 4
  const base64 = padded + '='.repeat(padLen)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function gzipBytes(input: Uint8Array): Promise<Uint8Array> {
  const stream = new CompressionStream('gzip')
  const writer = stream.writable.getWriter()
  await writer.write(input)
  await writer.close()
  return new Uint8Array(await new Response(stream.readable).arrayBuffer())
}

async function gunzipBytes(input: Uint8Array): Promise<Uint8Array> {
  const stream = new DecompressionStream('gzip')
  const writer = stream.writable.getWriter()
  await writer.write(input)
  await writer.close()
  return new Uint8Array(await new Response(stream.readable).arrayBuffer())
}

/** 큐시트 HTML → URL 토큰 (이메일 인쇄 버튼 링크용) */
export async function encodePrintHtmlToken(html: string): Promise<string> {
  const payload = new TextEncoder().encode(`${TOKEN_VERSION}\n${html}`)
  const compressed = await gzipBytes(payload)
  return base64UrlEncode(compressed)
}

export async function decodePrintHtmlToken(token: string): Promise<string> {
  const compressed = base64UrlDecode(token.trim())
  const payload = await gunzipBytes(compressed)
  const text = new TextDecoder().decode(payload)
  const newline = text.indexOf('\n')
  if (newline === -1) {
    throw new Error('Invalid print token')
  }
  const version = text.slice(0, newline)
  if (version !== TOKEN_VERSION) {
    throw new Error('Unsupported print token')
  }
  return text.slice(newline + 1)
}

/** 이메일·URL 길이 한도 — 초과 시 토큰 대신 앱 인쇄 안내 */
export const MAX_PRINT_TOKEN_CHARS = 6000
