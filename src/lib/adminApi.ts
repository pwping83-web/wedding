const ADMIN_TOKEN_KEY = 'wcm-admin-token'

function apiUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\//, '')}`.replace(/([^:]\/)\/+/g, '$1')
}

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
}

export type DeliverySummary = {
  id: string
  createdAt: string
  subject: string
  groomName: string
  brideName: string
  weddingDate: string
  weddingTime: string
  venue: string
  mcEmail: string
}

export type DeliveryDetail = DeliverySummary & {
  printHtml: string
}

export type VideoTextSummary = {
  id: string
  createdAt: string
  contactEmail: string
  groomName: string
  brideName: string
}

export type VideoTextDetail = VideoTextSummary & {
  textPayload: Record<string, string>
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken()
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(apiUrl(path), { ...init, headers })
  const raw = await response.text()
  let result: T & { error?: string } = {} as T & { error?: string }

  try {
    result = raw ? (JSON.parse(raw) as T & { error?: string }) : ({} as T & { error?: string })
  } catch {
    throw new Error(response.ok ? '응답을 처리하지 못했습니다.' : `서버 오류 (${response.status})`)
  }

  if (!response.ok) {
    throw new Error(result.error || `요청에 실패했습니다. (${response.status})`)
  }

  return result
}

export async function adminLogin(password: string): Promise<void> {
  const result = await adminFetch<{ ok?: boolean; token?: string }>('api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })

  if (!result.token) {
    throw new Error('로그인 토큰을 받지 못했습니다.')
  }

  setAdminToken(result.token)
}

export async function fetchDeliveries(): Promise<{
  deliveries: DeliverySummary[]
  archiveConfigured: boolean
}> {
  return adminFetch('api/admin/deliveries')
}

export async function fetchDelivery(id: string): Promise<DeliveryDetail> {
  const result = await adminFetch<{ delivery: DeliveryDetail }>(`api/admin/delivery?id=${encodeURIComponent(id)}`)
  return result.delivery
}

export async function deleteDelivery(id: string): Promise<void> {
  await adminFetch(`api/admin/delivery?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function fetchVideoTexts(): Promise<{
  items: VideoTextSummary[]
  archiveConfigured: boolean
}> {
  return adminFetch('api/admin/video-texts')
}

export async function fetchVideoText(id: string): Promise<VideoTextDetail> {
  const result = await adminFetch<{ item: VideoTextDetail }>(
    `api/admin/video-text?id=${encodeURIComponent(id)}`,
  )
  return result.item
}

export function buildDeliveryPreviewDocument(printHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>웨딩 큐시트</title>
  <style>
    @page { size: A4 portrait; margin: 5mm 6mm; }
    html, body { margin: 0; padding: 8px; background: #fff; }
  </style>
</head>
<body>${printHtml}</body>
</html>`
}

export function openDeliveryHtmlWindow(
  printHtml: string,
  options: { printOnLoad?: boolean } = {},
): void {
  const popup = window.open('', '_blank')
  if (!popup) {
    throw new Error('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해 주세요.')
  }

  const printScript = options.printOnLoad
    ? `<script>window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 300); });</script>`
    : ''

  popup.document.open()
  popup.document.write(buildDeliveryPreviewDocument(printHtml).replace('</body>', `${printScript}</body>`))
  popup.document.close()
}

/** @deprecated openDeliveryHtmlWindow 사용 */
export function openDeliveryPrintWindow(printHtml: string): void {
  openDeliveryHtmlWindow(printHtml, { printOnLoad: true })
}

export async function updateDeliveryPrintHtml(
  id: string,
  printHtml: string,
): Promise<DeliveryDetail> {
  const result = await adminFetch<{ delivery: DeliveryDetail }>(
    `api/admin/delivery?id=${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ printHtml }),
    },
  )
  return result.delivery
}
