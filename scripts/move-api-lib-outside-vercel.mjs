import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const sourceDir = path.join(root, 'api', 'lib')
const targetDir = path.join(root, 'server', 'apiLib')
const serverDir = path.join(root, 'server')

fs.mkdirSync(targetDir, { recursive: true })

for (const name of fs.readdirSync(sourceDir)) {
  const sourcePath = path.join(sourceDir, name)
  if (!fs.statSync(sourcePath).isFile()) continue
  fs.copyFileSync(sourcePath, path.join(targetDir, name))
  fs.unlinkSync(sourcePath)
}
fs.rmdirSync(sourceDir)

function updateImports(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      updateImports(fullPath)
      continue
    }
    if (!entry.name.endsWith('.ts')) continue

    let content = fs.readFileSync(fullPath, 'utf8')
    content = content.replace(
      /from '\.\.\/\.\.\/api\/lib\//g,
      "from '../apiLib/",
    )
    content = content.replace(
      /from '\.\.\/api\/lib\//g,
      "from './apiLib/",
    )
    fs.writeFileSync(fullPath, content, 'utf8')
  }
}

updateImports(serverDir)
console.log('Moved API libraries outside api/')
