/** 네이버·검색 수집용 (빌드·메타 공통) — Soft Collaboration / ENX 웨딩 MC */

export const SITE_BRAND = 'ENX 웨딩 · MC'

export const SEO_TITLE = 'AI 자동 식순 큐시트 | ENX 웨딩 MC · 예식 사회자 멘트'

export const SEO_DESCRIPTION =
  '예식 정보·식순·사회자 멘트를 5단계로 입력하면 AI가 큐시트를 만들어 드립니다. 인쇄·이메일 전달 지원. 식순을 만든 MC가 본식 진행·식전영상 제작까지 (수도권).'

export const SEO_KEYWORDS =
  '웨딩 큐시트, 식순표, AI 멘트, 사회자 큐시트, 결혼식 진행, 예식 식순, 큐시트 만들기, ENX 웨딩, 웨딩 MC, 식전영상, 사회자 멘트, 본식 진행'

export const SEO_OG_TITLE = 'AI 자동 식순 큐시트 — ENX 웨딩 · MC'

export const SEO_OG_DESCRIPTION =
  '예식 정보 · 식순 · 멘트까지 한 번에. 사회자에게 바로 전달하는 AI 큐시트 메이커.'

/** 배포 도메인 (Vercel: VITE_SITE_URL 환경 변수 권장) */
export function resolveSiteUrl(env: Record<string, string | undefined> = {}): string {
  const fromEnv = env.VITE_SITE_URL?.trim() || env.SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  if (env.VERCEL_URL?.trim()) return `https://${env.VERCEL_URL.trim().replace(/\/$/, '')}`
  return 'https://wedding-rcxo.vercel.app'
}

export type SitemapEntry = {
  path: string
  changefreq: 'weekly' | 'monthly'
  priority: string
}

/** 네이버 웹마스터에 제출할 공개 URL */
export const SITEMAP_PATHS: SitemapEntry[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/mc', changefreq: 'monthly', priority: '0.85' },
  { path: '/video', changefreq: 'monthly', priority: '0.85' },
]

export function buildRobotsTxt(siteUrl: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    'User-agent: Yeti',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ].join('\n')
}

export function buildSitemapXml(siteUrl: string, lastmod: string): string {
  const urls = SITEMAP_PATHS.map(
    (entry) => `  <url>
    <loc>${siteUrl}${entry.path === '/' ? '/' : entry.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

export function buildWebApplicationJsonLd(siteUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI 자동 식순 큐시트',
    alternateName: `${SITE_BRAND} 예식 큐시트`,
    url: `${siteUrl}/`,
    description: SEO_DESCRIPTION,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    inLanguage: 'ko-KR',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
      description: '큐시트 작성·미리보기·인쇄 무료',
    },
    provider: {
      '@type': 'Organization',
      name: SITE_BRAND,
    },
  }
}
