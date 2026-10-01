export type MarketingRoute = 'mc' | 'video' | 'video-edit'

export function normalizeAppPathname(pathname: string): string {
  let path = pathname
  const base = import.meta.env.BASE_URL || '/'
  if (base !== '/') {
    const prefix = base.endsWith('/') ? base.slice(0, -1) : base
    if (path.startsWith(prefix)) {
      path = path.slice(prefix.length) || '/'
    }
  }
  if (!path.startsWith('/')) path = `/${path}`
  return path.replace(/\/+$/, '') || '/'
}

export function readMarketingRoute(): MarketingRoute | null {
  const path = normalizeAppPathname(window.location.pathname)
  if (path === '/mc') return 'mc'
  if (path === '/video/edit') return 'video-edit'
  if (path === '/video') return 'video'
  return null
}

export function marketingHref(segment: MarketingRoute | 'home'): string {
  const base = import.meta.env.BASE_URL || '/'
  if (segment === 'home') return base
  if (segment === 'video-edit') {
    return `${base}video/edit`.replace(/([^:]\/)\/+/g, '$1')
  }
  return `${base}${segment}`.replace(/([^:]\/)\/+/g, '$1')
}

export function goToMarketing(segment: MarketingRoute | 'home') {
  window.location.href = marketingHref(segment)
}
