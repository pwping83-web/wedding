import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const apiDir = path.join(root, 'api')
const handlersDir = path.join(apiDir, '_handlers')

const routes = [
  { src: 'load-cue-sheet.ts', exportName: 'handleLoadCueSheet' },
  { src: 'save-cue-sheet-draft.ts', exportName: 'handleSaveCueSheetDraft' },
  { src: 'notify-site-visit.ts', exportName: 'handleNotifySiteVisit' },
  { src: 'print-cue-sheet.ts', exportName: 'handlePrintCueSheet' },
  { src: 'send-cue-sheet.ts', exportName: 'handleSendCueSheet' },
  { src: 'generate-script.ts', exportName: 'handleGenerateScript' },
  { src: 'submit-mc-request.ts', exportName: 'handleSubmitMcRequest' },
  { src: 'submit-video-text.ts', exportName: 'handleSubmitVideoText' },
  { src: path.join('admin', 'login.ts'), dest: 'admin-login.ts', exportName: 'handleAdminLogin' },
  { src: path.join('admin', 'deliveries.ts'), dest: 'admin-deliveries.ts', exportName: 'handleAdminDeliveries' },
  { src: path.join('admin', 'delivery.ts'), dest: 'admin-delivery.ts', exportName: 'handleAdminDelivery' },
  { src: path.join('admin', 'video-texts.ts'), dest: 'admin-video-texts.ts', exportName: 'handleAdminVideoTexts' },
  { src: path.join('admin', 'video-text.ts'), dest: 'admin-video-text.ts', exportName: 'handleAdminVideoText' },
]

fs.mkdirSync(handlersDir, { recursive: true })

for (const route of routes) {
  const srcPath = path.join(apiDir, route.src)
  let text = fs.readFileSync(srcPath, 'utf8')
  text = text.replace(/^export const config = \{[\s\S]*?\}\n\n/m, '')
  text = text.replace(/from '\.\/lib\//g, "from '../lib/")
  text = text.replace(/from '\.\.\/lib\//g, "from '../lib/")
  text = text.replace(/from '\.\.\/server\//g, "from '../../server/")
  text = text.replace(
    /export default async function handler/g,
    `export async function ${route.exportName}`,
  )
  const destName = route.dest ?? path.basename(route.src)
  fs.writeFileSync(path.join(handlersDir, destName), text)
  fs.unlinkSync(srcPath)
}

const adminDir = path.join(apiDir, 'admin')
if (fs.existsSync(adminDir) && fs.readdirSync(adminDir).length === 0) {
  fs.rmdirSync(adminDir)
}

console.log('Migrated', routes.length, 'handlers to api/_handlers/')
