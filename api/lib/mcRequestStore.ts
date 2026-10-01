type SupabaseConfig = {
  url: string
  serviceRoleKey: string
}

export type McRequestInsert = {
  groomName: string
  brideName: string
  ceremonyDate: string | null
  ceremonyTime: string
  venue: string
  phone: string
  email: string
  message: string
  wantsPreweddingVideo: boolean
  privacyAgreed: boolean
}

export type McRequestRecord = McRequestInsert & {
  id: string
  createdAt: string
  status: string
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

export function mcRequestStoreConfigured(): boolean {
  return getSupabaseConfig() !== null
}

export async function insertMcRequest(input: McRequestInsert): Promise<McRequestRecord> {
  const config = getSupabaseConfig()
  if (!config) {
    throw new Error('Supabase가 설정되지 않았습니다.')
  }

  const body = {
    groom_name: input.groomName,
    bride_name: input.brideName,
    ceremony_date: input.ceremonyDate || null,
    ceremony_time: input.ceremonyTime || null,
    venue: input.venue,
    phone: input.phone,
    email: input.email,
    message: input.message,
    wants_prewedding_video: input.wantsPreweddingVideo,
    privacy_agreed: input.privacyAgreed,
    status: 'new',
  }

  const response = await fetch(`${config.url}/rest/v1/mc_requests`, {
    method: 'POST',
    headers: supabaseHeaders(config),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || '상담 신청 저장에 실패했습니다.')
  }

  const rows = (await response.json()) as Array<{
    id: string
    groom_name: string
    bride_name: string
    ceremony_date: string | null
    ceremony_time: string | null
    venue: string
    phone: string
    email: string
    message: string
    wants_prewedding_video: boolean
    privacy_agreed: boolean
    status: string
    created_at: string
  }>

  const row = rows[0]
  if (!row) throw new Error('저장 결과를 받지 못했습니다.')

  return {
    id: row.id,
    groomName: row.groom_name,
    brideName: row.bride_name,
    ceremonyDate: row.ceremony_date,
    ceremonyTime: row.ceremony_time ?? '',
    venue: row.venue,
    phone: row.phone,
    email: row.email,
    message: row.message,
    wantsPreweddingVideo: row.wants_prewedding_video,
    privacyAgreed: row.privacy_agreed,
    status: row.status,
    createdAt: row.created_at,
  }
}
