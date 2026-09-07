export type DeliveryRecord = {
  id: string
  createdAt: string
  subject: string
  groomName: string
  brideName: string
  weddingDate: string
  weddingTime: string
  venue: string
  mcEmail: string
  printHtml: string
}

export type SaveDeliveryInput = {
  subject: string
  groomName: string
  brideName: string
  weddingDate: string
  weddingTime: string
  venue: string
  mcEmail: string
  printHtml: string
}

type SupabaseConfig = {
  url: string
  serviceRoleKey: string
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
  }
}

function mapRow(row: Record<string, unknown>): DeliveryRecord {
  return {
    id: String(row.id ?? ''),
    createdAt: String(row.created_at ?? ''),
    subject: String(row.subject ?? ''),
    groomName: String(row.groom_name ?? ''),
    brideName: String(row.bride_name ?? ''),
    weddingDate: String(row.wedding_date ?? ''),
    weddingTime: String(row.wedding_time ?? ''),
    venue: String(row.venue ?? ''),
    mcEmail: String(row.mc_email ?? ''),
    printHtml: String(row.print_html ?? ''),
  }
}

export function deliveryArchiveConfigured(): boolean {
  return getSupabaseConfig() !== null
}

export async function saveDeliveryRecord(input: SaveDeliveryInput): Promise<DeliveryRecord | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  const record = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    subject: input.subject,
    groom_name: input.groomName,
    bride_name: input.brideName,
    wedding_date: input.weddingDate,
    wedding_time: input.weddingTime,
    venue: input.venue,
    mc_email: input.mcEmail,
    print_html: input.printHtml,
  }

  const response = await fetch(`${config.url}/rest/v1/cue_sheet_deliveries`, {
    method: 'POST',
    headers: {
      ...supabaseHeaders(config),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(record),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || '전송 기록 저장에 실패했습니다.')
  }

  const rows = (await response.json()) as Record<string, unknown>[]
  return mapRow(rows[0] ?? record)
}

export async function listDeliveryRecords(): Promise<DeliveryRecord[]> {
  const config = getSupabaseConfig()
  if (!config) return []

  const query = new URLSearchParams({
    select: '*',
    order: 'created_at.desc',
    limit: '100',
  })

  const response = await fetch(`${config.url}/rest/v1/cue_sheet_deliveries?${query}`, {
    headers: supabaseHeaders(config),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || '전송 기록을 불러오지 못했습니다.')
  }

  const rows = (await response.json()) as Record<string, unknown>[]
  return rows.map(mapRow)
}
