/**
 * mc-logo.png → src/assets/branding/mcLogoData.ts (Git LFS 없이 배포 가능)
 * pnpm generate:logo-data
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const pngPath = path.join(root, 'src/assets/branding/mc-logo.png')
const outPath = path.join(root, 'src/assets/branding/mcLogoData.ts')

const buf = readFileSync(pngPath)
if (buf[0] !== 0x89 || buf[1] !== 0x50) {
  console.error('mc-logo.png is not a PNG (Git LFS pointer?). Run: git lfs pull')
  process.exit(1)
}

const dataUrl = `data:image/png;base64,${buf.toString('base64')}`
writeFileSync(
  outPath,
  `/** Auto-generated — \`pnpm generate:logo-data\` */\nexport const MC_LOGO_DATA_URL = ${JSON.stringify(dataUrl)}\n`,
)
console.log(`Wrote ${outPath} (${buf.length} bytes PNG)`)
