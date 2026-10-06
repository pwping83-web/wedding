import { useEffect, useMemo, useRef, useState } from 'react'
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
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    setEditError('')
  }, [delivery, mode])

  const previewDoc = useMemo(() => {
    if (!delivery) return ''
    return buildDeliveryPreviewDocument(delivery.printHtml)
  }, [delivery])

  if (!mode || !delivery) return null

  const title =
    mode === 'view' ? '큐시트 보기' : '큐시트 수정'

  const enableDirectEditing = () => {
    if (mode !== 'edit') return
    const doc = iframeRef.current?.contentDocument
    if (!doc?.body) return

    doc.body.contentEditable = 'true'
    doc.body.spellcheck = true
    doc.body.style.cursor = 'text'
    doc.body.style.outline = 'none'
  }

  const saveDirectEdit = async () => {
    const body = iframeRef.current?.contentDocument?.body
    if (!body) {
      setEditError('편집 내용을 읽지 못했습니다. 창을 닫고 다시 시도해 주세요.')
      return
    }

    const printHtml = body.innerHTML.trim()
    if (!body.innerText.trim() || !printHtml) {
      setEditError('큐시트 내용을 비워 둘 수 없습니다.')
      return
    }

    setEditError('')
    await onSave?.(printHtml)
  }

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
          <p className="shrink-0 px-5 pt-3 text-[12px] leading-relaxed text-muted-text">
            아래 큐시트에서 바꿀 글자를 직접 누르고 수정하세요.
          </p>
        )}

        <div className="flex-1 min-h-0 px-5 py-3">
          <iframe
            ref={iframeRef}
            title="큐시트 미리보기"
            srcDoc={previewDoc}
            onLoad={enableDirectEditing}
            className={`w-full h-[min(58dvh,440px)] rounded-xl border bg-white ${
              mode === 'edit' ? 'border-accent ring-2 ring-accent/10' : 'border-border'
            }`}
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
              {editError && <p className="text-[12px] text-danger">{editError}</p>}
              <Btn
                disabled={saving}
                onClick={() => void saveDirectEdit()}
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
