import { Fragment, useMemo } from 'react'

const EMPHASIS_PATTERN =
  /(배경\s*음악|박\s*수|맞\s*절|박\s*전|환\s*호|음\s*악\s*주세요|큰\s*박\s*수|따뜻한\s*박\s*수|입장해\s*주|일어나\s*주|맞이해\s*주|박수로\s*맞이|박수\s*부탁)/


function isEmphasisChunk(chunk: string): boolean {
  return EMPHASIS_PATTERN.test(chunk)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightEmphasis(text: string, keyPrefix: string) {
  const chunks = text.split(EMPHASIS_PATTERN).filter(Boolean)
  return chunks.map((chunk, index) =>
    isEmphasisChunk(chunk) ? (
      <span key={`${keyPrefix}-e-${index}`} className="cue-script-emphasis">
        {chunk}
      </span>
    ) : (
      <Fragment key={`${keyPrefix}-t-${index}`}>{chunk}</Fragment>
    ),
  )
}

function highlightNames(text: string, names: string[], keyPrefix: string) {
  const filtered = names.map((name) => name.trim()).filter(Boolean)
  if (filtered.length === 0) {
    return highlightEmphasis(text, keyPrefix)
  }

  const pattern = new RegExp(`(${filtered.map(escapeRegExp).join('|')})`, 'g')
  const chunks = text.split(pattern).filter((part) => part.length > 0)

  return chunks.map((chunk, index) =>
    filtered.includes(chunk) ? (
      <span key={`${keyPrefix}-n-${index}`} className="cue-script-name">
        {chunk}
      </span>
    ) : (
      <Fragment key={`${keyPrefix}-p-${index}`}>
        {highlightEmphasis(chunk, `${keyPrefix}-p-${index}`)}
      </Fragment>
    ),
  )
}

function formatSegment(segment: string, names: string[], keyPrefix: string) {
  const parts = segment.split(/(\([^)]*\)|\[[^\]]*\])/g).filter((part) => part.length > 0)

  return parts.map((part, index) => {
    if (/^\([^)]*\)$/.test(part) || /^\[[^\]]*\]$/.test(part)) {
      return (
        <span key={`${keyPrefix}-c-${index}`} className="cue-script-cue">
          {part}
        </span>
      )
    }
    return (
      <Fragment key={`${keyPrefix}-p-${index}`}>
        {highlightNames(part, names, `${keyPrefix}-p-${index}`)}
      </Fragment>
    )
  })
}

interface Props {
  text: string
  groomName?: string
  brideName?: string
}

export default function FormatMcScript({ text, groomName = '', brideName = '' }: Props) {
  const names = useMemo(() => {
    const list = [groomName.trim(), brideName.trim()].filter(Boolean)
    return [...new Set(list)].sort((a, b) => b.length - a.length)
  }, [groomName, brideName])

  const lines = text.split('\n')

  return (
    <span className="cue-script-body">
      {lines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {formatSegment(line, names, `l${lineIndex}`)}
        </Fragment>
      ))}
    </span>
  )
}
