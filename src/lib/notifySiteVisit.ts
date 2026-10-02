const SESSION_KEY = 'wcm-site-visit-notified'
const LOCAL_KEY = 'wcm-site-visit-notified-at'
/** 같은 브라우저에서 재알림 최소 간격 */
const MIN_INTERVAL_MS = 6 * 60 * 60 * 1000

function apiUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\//, '')}`.replace(/([^:]\/)\/+/g, '$1')
}

function shouldSkipNotify(): boolean {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return true
    const last = localStorage.getItem(LOCAL_KEY)
    if (last && Date.now() - Number(last) < MIN_INTERVAL_MS) return true
  } catch {
    return false
  }
  return false
}

function markNotified(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
    localStorage.setItem(LOCAL_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}

/** 랜딩(홈) 최초 진입 시 운영자에게 방문 알림 (실패해도 UI 영향 없음) */
export function notifySiteVisitLanding(): void {
  if (import.meta.env.DEV) return
  if (shouldSkipNotify()) return

  const body = JSON.stringify({
    page: 'landing',
    path: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || '',
  })

  const url = apiUrl('api/notify-site-visit')

  const send = () => {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
      .then(() => markNotified())
      .catch(() => {})
  }

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(send, { timeout: 3000 })
  } else {
    setTimeout(send, 400)
  }
}
