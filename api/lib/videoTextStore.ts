type SupabaseConfig = {
  url: string
  serviceRoleKey: string
}

export type VideoTextInsert = {
  contactEmail: string
  groomName: string
  brideName: string
  textPayload: Record<string, string>
}

export type VideoTextRecord = VideoTextInsert & {
  id: string
  createdAt: string
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceRoleKey) return null
  return { url, serviceRoleKey }
}

function supabaseHeaders(config: SupabaseConfig): HeadersInit {
  return {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
}

export function videoTextStoreConfigured(): boolean {
  return getSupabaseConfig() !== null
}

export async function insertVideoTextSubmission(input: VideoTextInsert): Promise<VideoTextRecord> {
  const config = getSupabaseConfig()
  if (!config) {
    throw new Error('Supabase가 설정되지 않았습니다.')
  }

  const body = {
    contact_email: input.contactEmail,
    groom_name: input.groomName,
    bride_name: input.brideName,
    text_payload: input.textPayload,
  }

  const response = await fetch(`${config.url}/rest/v1/video_text_submissions`, {
    method: 'POST',
    headers: supabaseHeaders(config),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    if (text.includes('video_text_submissions') || text.includes('PGRST205')) {
      throw new Error(
        'Supabase에 video_text_submissions 테이블이 없습니다. supabase/video_text_submissions.sql을 실행해 주세요.',
      )
    }
    throw new Error(text || '글귀 저장에 실패했습니다.')
  }

  const rows = (await response.json()) as Array<{
    id: string
    contact_email: string
    groom_name: string
    bride_name: string
    text_payload: Record<string, string>
    created_at: string
  }>

  const row = rows[0]
  if (!row) throw new Error('저장 결과를 받지 못했습니다.')

  return {
    id: row.id,
    contactEmail: row.contact_email,
    groomName: row.groom_name,
    brideName: row.bride_name,
    textPayload: row.text_payload,
    createdAt: row.created_at,
  }
}

export async function listVideoTextSubmissions(): Promise<VideoTextRecord[]> {
  const config = getSupabaseConfig()
  if (!config) return []

  const response = await fetch(
    `${config.url}/rest/v1/video_text_submissions?select=id,contact_email,groom_name,bride_name,text_payload,created_at&order=created_at.desc`,
    { headers: supabaseHeaders(config) },
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || '글귀 목록을 불러오지 못했습니다.')
  }

  const rows = (await response.json()) as Array<{
    id: string
    contact_email: string
    groom_name: string
    bride_name: string
    text_payload: Record<string, string>
    created_at: string
  }>

  return rows.map((row) => ({
    id: row.id,
    contactEmail: row.contact_email,
    groomName: row.groom_name,
    brideName: row.bride_name,
    textPayload: row.text_payload,
    createdAt: row.created_at,
  }))
}

export async function getVideoTextSubmission(id: string): Promise<VideoTextRecord | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  const response = await fetch(
    `${config.url}/rest/v1/video_text_submissions?id=eq.${encodeURIComponent(id)}&select=id,contact_email,groom_name,bride_name,text_payload,created_at`,
    { headers: supabaseHeaders(config) },
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || '글귀를 불러오지 못했습니다.')
  }

  const rows = (await response.json()) as Array<{
    id: string
    contact_email: string
    groom_name: string
    bride_name: string
    text_payload: Record<string, string>
    created_at: string
  }>

  const row = rows[0]
  if (!row) return null

  return {
    id: row.id,
    contactEmail: row.contact_email,
    groomName: row.groom_name,
    brideName: row.bride_name,
    textPayload: row.text_payload,
    createdAt: row.created_at,
  }
}
