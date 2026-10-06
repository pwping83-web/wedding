import { useEffect, useMemo, useState } from 'react'
import Btn from './mobile/Btn'
import type { DeliveryDetail } from '../lib/adminApi'
import { buildDeliveryPreviewDocument, openDeliveryHtmlWindow } from '../lib/adminApi'

type Mode = 'view' | 'edit'

type Props = {
  mode: Mode | null
  delivery: DeliveryDetail | null
  saving?: boolean
  onClose: () => void
  onSave?: (printHtml: string) => void | Promise<void>
}

export default function AdminDeliveryModal({
  mode,
  delivery,
  saving = false,
  onClose,
  onSave,
}: Props) {
  const [draftHtml, setDraftHtml] = useState('')

  useEffect(() => {
    if (delivery && mode === 'edit') {
      setDraftHtml(delivery.printHtml)
    }
  }, [delivery, mode])

  const previewDoc = useMemo(() => {
    if (!delivery) return ''
    if (mode === 'edit') return buildDeliveryPreviewDocument(draftHtml)
    return buildDeliveryPreviewDocument(delivery.printHtml)
  }, [delivery, mode, draftHtml])

  if (!mode || !delivery) return null

  const title =
    mode === 'view' ? '큐시트 보기' : '큐시트 수정'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-delivery-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40"
        onClick={onClose}
        aria-label="닫기"
      />

      <div className="relative w-full max-w-[420px] max-h-[min(92dvh,720px)] flex flex-col rounded-2xl border border-border bg-white shadow-lg overflow-hidden">
        <div className="shrink-0 px-5 pt-5 pb-3 border-b border-border">
          <h2 id="admin-delivery-modal-title" className="text-[18px] font-semibold text-charcoal">
            {title}
          </h2>
          <p className="text-[14px] text-charcoal mt-1">
            {delivery.groomName || '신랑'} · {delivery.brideName || '신부'}
          </p>
          <p className="text-[12px] text-muted-text mt-1">{delivery.mcEmail}</p>
        </div>

        {mode === 'edit' && (
          <div className="shrink-0 px-5 pt-3">
            <label className="block text-[12px] font-medium text-charcoal mb-1">
              인쇄 HTML (고급)
            </label>
            <textarea
              value={draftHtml}
              onChange={(event) => setDraftHtml(event.target.value)}
              className="w-full h-28 rounded-xl border border-border bg-bg px-3 py-2 text-[11px] font-mono leading-relaxed resize-y"
              spellCheck={false}
            />
          </div>
        )}

        <div className="flex-1 min-h-0 px-5 py-3">
          <iframe
            title="큐시트 미리보기"
            srcDoc={previewDoc}
            className="w-full h-[min(50dvh,360px)] rounded-xl border border-border bg-white"
            sandbox="allow-same-origin"
          />
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-border bg-white space-y-2">
          {mode === 'view' && (
            <div className="grid grid-cols-2 gap-2">
              <Btn
                variant="secondary"
                full={false}
                className="w-full"
                onClick={() => openDeliveryHtmlWindow(delivery.printHtml, { printOnLoad: true })}
              >
                인쇄
              </Btn>
              <Btn variant="secondary" full={false} className="w-full" onClick={onClose}>
                닫기
              </Btn>
            </div>
          )}
          {mode === 'edit' && (
            <>
              <Btn
                disabled={saving || !draftHtml.trim()}
                onClick={() => void onSave?.(draftHtml.trim())}
              >
                {saving ? '저장 중…' : '저장하기'}
              </Btn>
              <Btn variant="ghost" onClick={onClose} disabled={saving}>
                취소
              </Btn>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
