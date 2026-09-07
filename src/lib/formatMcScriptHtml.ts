const EMPHASIS_PATTERN =
  /(배경\s*음악|박\s*수|맞\s*절|박\s*전|환\s*호|음\s*악\s*주세요|큰\s*박\s*수|따뜻한\s*박\s*수|입장해\s*주|일어나\s*주|맞이해\s*주|박수로\s*맞이|박수\s*부탁)/

const CUE_PATTERN = /(\([^)]*\)|\[[^\]]*\])/g

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function span(className: string, inner: string): string {
  if (className === 'cue-script-cue') {
    return `<span style="color:#C45C5C;font-weight:700;">${inner}</span>`
  }
  return `<span style="color:#1F5FA8;font-weight:700;">${inner}</span>`
}

function highlightEmphasisHtml(text: string): string {
  const chunks = text.split(EMPHASIS_PATTERN).filter(Boolean)
  return chunks
    .map((chunk) =>
      EMPHASIS_PATTERN.test(chunk) ? span('cue-script-emphasis', chunk) : escapeHtml(chunk),
    )
    .join('')
}

function highlightNamesHtml(text: string, names: string[]): string {
  const filtered = names.map((name) => name.trim()).filter(Boolean)
  if (filtered.length === 0) return highlightEmphasisHtml(text)

  const pattern = new RegExp(`(${filtered.map(escapeRegExp).join('|')})`, 'g')
  const chunks = text.split(pattern).filter((part) => part.length > 0)

  return chunks
    .map((chunk) =>
      filtered.includes(chunk)
        ? span('cue-script-name', escapeHtml(chunk))
        : highlightEmphasisHtml(chunk),
    )
    .join('')
}

function formatSegmentHtml(segment: string, names: string[]): string {
  const parts = segment.split(CUE_PATTERN).filter((part) => part.length > 0)

  return parts
    .map((part) => {
      if (/^\([^)]*\)$/.test(part) || /^\[[^\]]*\]$/.test(part)) {
        return span('cue-script-cue', escapeHtml(part))
      }
      return highlightNamesHtml(part, names)
    })
    .join('')
}

/** FormatMcScript 컴포넌트와 동일한 하이라이트 규칙 */
export function formatMcScriptHtml(
  text: string,
  groomName = '',
  brideName = '',
): string {
  const names = [...new Set([groomName.trim(), brideName.trim()].filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  )

  return text
    .split('\n')
    .map((line) => formatSegmentHtml(line, names))
    .join('<br/>')
}
