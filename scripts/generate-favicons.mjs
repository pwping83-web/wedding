/**
 * MC 로고(src/assets/branding/mc-logo.png)로 public 파비콘 생성
 * pnpm generate:favicons
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import toIco from 'to-ico'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = path.join(root, 'src/assets/branding/mc-logo.png')
const outDir = path.join(root, 'public')

async function iconPng(size, paddingRatio = 0.14) {
  const padding = Math.max(1, Math.round(size * paddingRatio))
  const inner = size - padding * 2
  const logo = await sharp(source)
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer()

  return sharp(logo)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer()
}

mkdirSync(outDir, { recursive: true })

const png16 = await iconPng(16)
const png32 = await iconPng(32)
const png180 = await iconPng(180, 0.12)

writeFileSync(path.join(outDir, 'favicon-16x16.png'), png16)
writeFileSync(path.join(outDir, 'favicon-32x32.png'), png32)
writeFileSync(path.join(outDir, 'apple-touch-icon.png'), png180)
writeFileSync(path.join(outDir, 'favicon.ico'), await toIco([png16, png32]))

console.log('Generated public/favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png')
