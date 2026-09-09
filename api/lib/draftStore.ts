type SupabaseConfig = {
  url: string
  serviceRoleKey: string
}

export type SavedCueSheetDraft = {
  savedAt: string
  appData: unknown
}

type ParsedOrderItem = {
  id: string
  title: string
  duration: number
  scriptVariant: number
  customScript?: string
}

function hasRestorableAppData(appData: unknown): boolean {
  const data = appData as {
    groomName?: string
    brideName?: string
    date?: string
    time?: string
    venue?: string
    orderItems?: unknown[]
  } | null

  return Boolean(
    data?.groomName?.trim() &&
      data?.brideName?.trim() &&
      data?.date?.trim() &&
      data?.time?.trim() &&
      data?.venue?.trim() &&
      Array.isArray(data.orderItems) &&
      data.orderItems.length > 0,
  )
}

function scoreRestorableAppData(appData: unknown): number {
  if (!hasRestorableAppData(appData)) return 0

  const data = appData as {
    orderItems?: Array<{ id?: string; title?: string; customScript?: string }>
    persons?: unknown[]
  }
  const items = Array.isArray(data.orderItems) ? data.orderItems : []
  const customItems = items.filter((item) => {
    const id = item.id ?? ''
    return !/^(1|2|3|4|5|6|7|8|9|10|11|12|13)$/.test(id)
  }).length
  const scriptedItems = items.filter((item) => item.customScript?.trim()).length
  const people = Array.isArray(data.persons) ? data.persons.length : 0

  return 100 + items.length + customItems * 20 + scriptedItems * 5 + people * 2
}

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeLabelToTitle(label: string): string {
  const normalized = label.replace(/\s+/g, ' ').trim()
  switch (normalized) {
    case '신랑입장':
      return '신랑 입장'
    case '신부입장':
      return '신부 입장'
    case '맞절':
      return '신랑신부 맞절'
    case '혼인서약서 낭독':
      return '신랑신부 혼인서약서 낭독'
    default:
      return normalized
  }
}

const defaultTitleIds: Record<string, string> = {
  '안내멘트 (10분전)': '1',
  '안내멘트(10분전)': '1',
  '안내멘트 (5분전)': '2',
  '안내멘트(5분전)': '2',
  개식사: '3',
  '화촉점화 안내': '4',
  '신랑 입장': '5',
  '신부 입장': '6',
  '신랑신부 맞절': '7',
  '신랑신부 혼인서약서 낭독': '8',
  성혼선언문: '9',
  축가: '10',
  '부모님과 하객분들께 인사': '11',
  행진: '12',
  폐식사: '13',
}

function parsePrintHtmlAppData(row: Record<string, unknown>): unknown | null {
  const printHtml = String(row.print_html ?? '')
  if (!printHtml.trim()) return null

  const matches = [...printHtml.matchAll(/<tr class="wcm-cue-row">([\s\S]*?)<\/tr>/g)]
  const orderItems: ParsedOrderItem[] = matches
    .map((match, index) => {
      const cells = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)]
      const label = stripTags(cells[0]?.[1] ?? '')
      const script = stripTags(cells[1]?.[1] ?? '')
      if (!label) return null

      const title = normalizeLabelToTitle(label)
      return {
        id: defaultTitleIds[title] ?? String(Date.now() + index),
        title,
        duration: title === '축가' ? 5 : 2,
        scriptVariant: 0,
        ...(script ? { customScript: script } : {}),
      }
    })
    .filter((item): item is ParsedOrderItem => item !== null)

  if (orderItems.length === 0) return null

  return {
    groomName: String(row.groom_name ?? ''),
    brideName: String(row.bride_name ?? ''),
    date: String(row.wedding_date ?? ''),
    time: String(row.wedding_time ?? ''),
    venue: String(row.venue ?? ''),
    style: 'classic',
    groomMarkers: [],
    brideMarkers: [],
    groomAudio: null,
    brideAudio: null,
    orderItems,
    persons: [],
    mood: 'warm',
    marriageDeclarationReader: 'mc',
    groomEntranceTimingEnabled: false,
    brideEntranceTimingEnabled: false,
    groomEntranceTrackTitle: '',
    brideEntranceTrackTitle: '',
    email: '',
    coupleEmail: '',
  }
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

export function cueSheetDraftStoreConfigured(): boolean {
  return getSupabaseConfig() !== null
}

export async function upsertCueSheetDraft(
  groomName: string,
  brideName: string,
  appData: unknown,
): Promise<SavedCueSheetDraft | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  const groom = groomName.trim()
  const bride = brideName.trim()
  if (!hasRestorableAppData(appData)) return null

  const record = {
    groom_name: groom,
    bride_name: bride,
    app_data: appData,
    updated_at: new Date().toISOString(),
  }

  const response = await fetch(`${config.url}/rest/v1/cue_sheet_drafts?on_conflict=groom_name,bride_name`, {
    method: 'POST',
    headers: {
      ...supabaseHeaders(config),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(record),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || '식순 저장에 실패했습니다.')
  }

  const rows = (await response.json()) as Record<string, unknown>[]
  const row = rows[0] ?? record
  return {
    savedAt: String(row.updated_at ?? record.updated_at),
    appData: row.app_data ?? appData,
  }
}

export async function findCueSheetDraft(
  groomName: string,
  brideName: string,
): Promise<SavedCueSheetDraft | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  const query = new URLSearchParams({
    select: 'updated_at,app_data',
    groom_name: `ilike.${groomName.trim()}`,
    bride_name: `ilike.${brideName.trim()}`,
    limit: '1',
  })

  const response = await fetch(`${config.url}/rest/v1/cue_sheet_drafts?${query}`, {
    headers: supabaseHeaders(config),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || '저장된 식순을 불러오지 못했습니다.')
  }

  const rows = (await response.json()) as Record<string, unknown>[]
  const row = rows[0]
  if (!row?.app_data || !hasRestorableAppData(row.app_data)) return null

  return {
    savedAt: String(row.updated_at ?? ''),
    appData: row.app_data,
  }
}

export async function findLatestDeliveryAppData(
  groomName: string,
  brideName: string,
): Promise<SavedCueSheetDraft | null> {
  const config = getSupabaseConfig()
  if (!config) return null

  const query = new URLSearchParams({
    select: 'created_at,app_data,print_html,groom_name,bride_name,wedding_date,wedding_time,venue',
    groom_name: `ilike.${groomName.trim()}`,
    bride_name: `ilike.${brideName.trim()}`,
    order: 'created_at.desc',
    limit: '20',
  })

  const response = await fetch(`${config.url}/rest/v1/cue_sheet_deliveries?${query}`, {
    headers: supabaseHeaders(config),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || '전송 기록을 불러오지 못했습니다.')
  }

  const rows = (await response.json()) as Record<string, unknown>[]
  const candidates = rows
    .map((item) => ({
      savedAt: String(item.created_at ?? ''),
      appData: hasRestorableAppData(item.app_data) ? item.app_data : parsePrintHtmlAppData(item),
    }))
    .filter((item) => hasRestorableAppData(item.appData))
    .sort((a, b) => {
      const scoreDelta = scoreRestorableAppData(b.appData) - scoreRestorableAppData(a.appData)
      if (scoreDelta !== 0) return scoreDelta
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    })

  const candidate = candidates[0]
  if (!candidate) return null

  const appData = candidate.appData
  if (!appData || !hasRestorableAppData(appData)) return null

  return {
    savedAt: candidate.savedAt,
    appData,
  }
}

export async function resolveSavedCueSheetFromStore(
  groomName: string,
  brideName: string,
): Promise<SavedCueSheetDraft | null> {
  const [draft, delivery] = await Promise.all([
    findCueSheetDraft(groomName, brideName),
    findLatestDeliveryAppData(groomName, brideName),
  ])

  const candidates = [draft, delivery]
    .filter((item): item is SavedCueSheetDraft => item !== null)
    .sort((a, b) => {
      const scoreDelta = scoreRestorableAppData(b.appData) - scoreRestorableAppData(a.appData)
      if (scoreDelta !== 0) return scoreDelta
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    })

  return candidates[0] ?? null
}
