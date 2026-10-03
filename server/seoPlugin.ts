import type { Plugin } from 'vite'
import {
  buildRobotsTxt,
  buildSitemapXml,
  resolveSiteUrl,
} from '../src/config/siteSeo.ts'

export function seoPlugin(): Plugin {
  let siteUrl = resolveSiteUrl()
  let robotsTxt = buildRobotsTxt(siteUrl)
  let sitemapXml = buildSitemapXml(siteUrl, new Date().toISOString().slice(0, 10))

  return {
    name: 'wedding-seo',
    config(_config, { mode }) {
      const env = { ...process.env, NODE_ENV: mode }
      siteUrl = resolveSiteUrl(env)
      const lastmod = new Date().toISOString().slice(0, 10)
      robotsTxt = buildRobotsTxt(siteUrl)
      sitemapXml = buildSitemapXml(siteUrl, lastmod)
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(robotsTxt)
          return
        }
        if (path === '/sitemap.xml') {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8')
          res.end(sitemapXml)
          return
        }
        next()
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml })
    },
  }
}
