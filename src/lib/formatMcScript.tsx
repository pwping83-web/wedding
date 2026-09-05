import { Fragment } from 'react'

const EMPHASIS_PATTERN =
  /(배경\s*음악|박\s*수|맞\s*절|박\s*전|환\s*호|음\s*악\s*주세요|큰\s*박\s*수|따뜻한\s*박\s*수)/

function isEmphasisChunk(chunk: string): boolean {
  return EMPHASIS_PATTERN.test(chunk)
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

function formatSegment(segment: string, keyPrefix: string) {
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
        {highlightEmphasis(part, `${keyPrefix}-p-${index}`)}
      </Fragment>
    )
  })
}

interface Props {
  text: string
}

export default function FormatMcScript({ text }: Props) {
  const lines = text.split('\n')

  return (
    <span className="cue-script-body">
      {lines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {formatSegment(line, `l${lineIndex}`)}
        </Fragment>
      ))}
    </span>
  )
}
