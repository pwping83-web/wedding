import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const sourceDir = path.join(root, 'api', '_handlers')
const targetDir = path.join(root, 'server', 'apiHandlers')

fs.mkdirSync(targetDir, { recursive: true })

for (const name of fs.readdirSync(sourceDir)) {
  if (!name.endsWith('.ts')) continue

  const sourcePath = path.join(sourceDir, name)
  let content = fs.readFileSync(sourcePath, 'utf8')

  content = content.replace(/from '\.\.\/lib\//g, "from '../../api/lib/")
  content = content.replace(
    /from '\.\.\/\.\.\/server\/generateScriptPrompt'/g,
    "from '../generateScriptPrompt'",
  )

  fs.writeFileSync(path.join(targetDir, name), content, 'utf8')
  fs.unlinkSync(sourcePath)
}

fs.rmdirSync(sourceDir)
console.log('Moved API handlers outside api/')
