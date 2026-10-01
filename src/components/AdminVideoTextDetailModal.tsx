import Btn from './mobile/Btn'
import { VIDEO_FORM_FIELDS } from '../constants/videoFormFields'
import type { VideoTextDetail } from '../lib/adminApi'

type Props = {
  item: VideoTextDetail | null
  onClose: () => void
}

function formatSavedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminVideoTextDetailModal({ item, onClose }: Props) {
  if (!item) return null

  const rawJson = JSON.stringify(item.textPayload, null, 2)

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(rawJson)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-video-text-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40"
        onClick={onClose}
        aria-label="닫기"
      />

      <div className="relative w-full max-w-[420px] max-h-[min(90dvh,640px)] flex flex-col rounded-2xl border border-border bg-white shadow-lg overflow-hidden">
        <div className="shrink-0 px-5 pt-5 pb-3 border-b border-border">
          <h2 id="admin-video-text-title" className="text-[18px] font-semibold text-charcoal">
            식전영상 글귀
          </h2>
          <p className="text-[14px] text-charcoal mt-1">
            {item.groomName || '신랑'} · {item.brideName || '신부'}
          </p>
          <p className="text-[13px] text-muted-text mt-0.5">{item.contactEmail}</p>
          <p className="text-[12px] text-muted-text mt-1">저장 {formatSavedAt(item.createdAt)}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {VIDEO_FORM_FIELDS.map((field) => (
            <div key={field.id} className="rounded-xl border border-border bg-bg/50 p-3 space-y-2">
              <p className="text-[13px] font-semibold text-charcoal">
                {field.timeLabel} · {field.label}
              </p>

              {field.kind === 'names' && (
                <div className="grid grid-cols-2 gap-2 text-[14px] text-charcoal">
                  <div>
                    <span className="text-[11px] text-muted-text block">신랑 ({field.exportKeys[0]})</span>
                    {item.textPayload[field.exportKeys[0]] ?? ''}
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-text block">신부 ({field.exportKeys[1]})</span>
                    {item.textPayload[field.exportKeys[1]] ?? ''}
                  </div>
                </div>
              )}

              {field.kind === 'single' && (
                <p className="text-[14px] text-charcoal whitespace-pre-wrap break-words">
                  <span className="text-[11px] text-muted-text block mb-1">{field.exportKeys[0]}</span>
                  {item.textPayload[field.exportKeys[0]] ?? ''}
                </p>
              )}

              {field.kind === 'dual' &&
                field.exportKeys.map((key, index) => (
                  <p key={key} className="text-[14px] text-charcoal whitespace-pre-wrap break-words">
                    <span className="text-[11px] text-muted-text block mb-1">
                      {index + 1}줄 ({key})
                    </span>
                    {item.textPayload[key] ?? ''}
                  </p>
                ))}
            </div>
          ))}

          <div className="rounded-xl border border-border p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-charcoal">JSON 원본</p>
              <button
                type="button"
                onClick={() => void copyJson()}
                className="text-[12px] text-accent underline-offset-2 hover:underline"
              >
                복사
              </button>
            </div>
            <pre className="text-[11px] text-charcoal/90 whitespace-pre-wrap break-all font-mono leading-relaxed max-h-48 overflow-y-auto bg-muted-bg/60 rounded-lg p-3">
              {rawJson}
            </pre>
          </div>
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-border bg-white">
          <Btn onClick={onClose}>닫기</Btn>
        </div>
      </div>
    </div>
  )
}
