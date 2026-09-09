const BASE = 'https://wedding-rcxo.vercel.app'
const DELIVERY_ID = '19eeab71-494c-4a6d-93b3-bf6b20c17cf7'
const ADMIN_PASSWORD = 'kkus2011!!'

function getRowLabel(row) {
  const match = row.match(/<tr class="wcm-cue-row">[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/)
  return match ? match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : ''
}

function normalizeRowBorders(row, isLast) {
  let next = row.replace(/border-bottom:[^;"]+;?/g, '')
  if (!isLast) return next

  next = next.replace(
    /(<td style="padding:4px 2px;border-top:1px dotted #444;)(border-right:1px dotted #444;)/,
    '$1border-bottom:1px dotted #444;$2',
  )
  next = next.replace(
    /(<td style="padding:4px 5px;border-top:1px dotted #444;)(vertical-align:top;)/,
    '$1border-bottom:1px dotted #444;$2',
  )
  return next
}

export function reorderAfterTitle(html, anchorTitle, movingTitle) {
  const tbodyMatch = html.match(/(<tbody>\s*)([\s\S]*?)(\s*<\/tbody>)/)
  if (!tbodyMatch) throw new Error('tbody not found')

  const rowRegex = /<tr class="wcm-cue-row">[\s\S]*?<\/tr>/g
  const rows = [...tbodyMatch[2].matchAll(rowRegex)].map((match) => match[0])
  const anchorIdx = rows.findIndex((row) => getRowLabel(row).includes(anchorTitle))
  const movingIdx = rows.findIndex((row) => getRowLabel(row).includes(movingTitle))

  if (anchorIdx < 0) throw new Error(`"${anchorTitle}" 항목을 찾지 못했습니다.`)
  if (movingIdx < 0) throw new Error(`"${movingTitle}" 항목을 찾지 못했습니다.`)

  const [movingRow] = rows.splice(movingIdx, 1)
  const insertAt = movingIdx < anchorIdx ? anchorIdx : anchorIdx + 1
  rows.splice(insertAt, 0, movingRow)

  const normalizedRows = rows.map((row, index) => normalizeRowBorders(row, index === rows.length - 1))
  const nextTbody = `${tbodyMatch[1]}${normalizedRows.join('\n        ')}${tbodyMatch[3]}`
  return html.replace(tbodyMatch[0], nextTbody)
}

async function main() {
  const login = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  })
  const { token, error: loginError } = await login.json()
  if (!login.ok || !token) throw new Error(loginError || 'admin login failed')

  const getRes = await fetch(`${BASE}/api/admin/delivery?id=${DELIVERY_ID}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const getJson = await getRes.json()
  if (!getRes.ok) throw new Error(getJson.error || 'delivery fetch failed')

  const before = getJson.delivery.printHtml
  const after = reorderAfterTitle(before, '성혼선언문', '덕담')

  const patchRes = await fetch(`${BASE}/api/admin/delivery?id=${DELIVERY_ID}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ printHtml: after }),
  })
  const patchJson = await patchRes.json()
  if (!patchRes.ok) throw new Error(patchJson.error || 'delivery patch failed')

  console.log('updated', DELIVERY_ID, patchJson.delivery.groomName, patchJson.delivery.brideName)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
