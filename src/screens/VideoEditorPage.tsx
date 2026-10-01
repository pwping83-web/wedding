import { useEffect, useMemo, useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import Field from '../components/mobile/Field'
import {
  VIDEO_FORM_FIELDS,
  buildDefaultVideoFormValues,
  buildVideoExportPayload,
  clampToMaxChars,
  countChars,
  type VideoFormValues,
} from '../constants/videoFormFields'
import { buildPhotoUploadInstructions } from '../constants/videoOrderInstructions'
import { loadMcInquiryPrefill } from '../lib/mcInquiryPrefill'
import { goToMarketing } from '../lib/marketingRoutes'
import { isVideoAccessUnlocked } from '../lib/videoAccess'
import { loadVideoEditorDraft, saveVideoEditorDraft } from '../lib/videoEditorDraft'
import { downloadVideoMaterialZip } from '../lib/downloadVideoMaterialZip'
import { submitVideoText } from '../lib/submitVideoText'

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export default function VideoEditorPage() {
  const prefill = useMemo(() => loadMcInquiryPrefill(), [])
  const groomDefault = prefill?.groomName ?? ''
  const brideDefault = prefill?.brideName ?? ''

  const [values, setValues] = useState<VideoFormValues>(() => {
    const draft = loadVideoEditorDraft()
    if (draft?.values) {
      return { ...buildDefaultVideoFormValues(groomDefault, brideDefault), ...draft.values }
    }
    return buildDefaultVideoFormValues(groomDefault, brideDefault)
  })
  const [contactEmail, setContactEmail] = useState(() => loadVideoEditorDraft()?.contactEmail ?? '')
  const [emailError, setEmailError] = useState('')
  const [formError, setFormError] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!isVideoAccessUnlocked()) {
      goToMarketing('video')
    }
  }, [])

  function setField(key: string, next: string, max: number) {
    setValues((prev) => ({ ...prev, [key]: clampToMaxChars(next, max) }))
  }

  function requireEmail(): boolean {
    if (!isValidEmail(contactEmail)) {
      setEmailError('완성·샘플 영상을 받을 이메일을 입력해 주세요.')
      return false
    }
    setEmailError('')
    return true
  }

  const groomName = values.P01_groom?.trim() || groomDefault || '신랑'
  const brideName = values.P01_bride?.trim() || brideDefault || '신부'
  const orderNumber = `V${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
  const uploadGuide = buildPhotoUploadInstructions(orderNumber, groomName, brideName, contactEmail.trim())

  async function handleSaveText() {
    setFormError('')
    if (!requireEmail()) return

    setSaving(true)
    try {
      const textPayload = buildVideoExportPayload(values, groomDefault, brideDefault)
      const result = await submitVideoText({
        contactEmail: contactEmail.trim(),
        groomName,
        brideName,
        textPayload,
      })
      saveVideoEditorDraft(values, contactEmail)
      setSavedId(result.id)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '글귀 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDownloadFolder() {
    if (!requireEmail()) return
    setDownloading(true)
    try {
      await downloadVideoMaterialZip({
        groomName,
        brideName,
        contactEmail: contactEmail.trim(),
        orderNumber,
      })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '폴더 받기에 실패했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  function openUploadGuide() {
    if (!requireEmail()) return
    setShowGuide(true)
  }

  return (
    <ScreenLayout
      title="식전영상 제작"
      subtitle="글귀 저장 · 자료 폴더"
      onBack={() => goToMarketing('video')}
      contentClassName="pb-52"
      footer={
        <div className="space-y-3">
          <Btn onClick={() => void handleSaveText()} disabled={saving}>
            {saving ? '저장 중…' : savedId ? '글귀 다시 저장' : '글귀 저장'}
          </Btn>
          <Btn variant="secondary" onClick={() => void handleDownloadFolder()} disabled={downloading}>
            {downloading ? '준비 중…' : '자료 폴더 받기'}
          </Btn>
          <Btn variant="secondary" onClick={openUploadGuide}>
            사진 보내는 방법
          </Btn>
        </div>
      }
    >
      <div className="space-y-8">
        {savedId && (
          <div className="landing-card text-[14px] text-charcoal leading-relaxed">
            <p className="font-semibold text-accent">글귀가 저장되었습니다.</p>
            <p className="text-[13px] text-muted-text mt-1">
              운영자에게 알림이 갔습니다. 「자료 폴더 받기」로 사진을 넣은 뒤 메일로 보내 주세요.
            </p>
          </div>
        )}

        <section className="landing-card space-y-3">
          <h2 className="text-[15px] font-semibold text-charcoal">완성·샘플 영상 받을 이메일</h2>
          <p className="text-[12px] text-muted-text leading-relaxed">
            제작이 끝나면 이 주소로 식전영상을 안내해 드립니다.
          </p>
          <Field
            label="이메일"
            required
            type="email"
            autoComplete="email"
            placeholder="example@email.com"
            value={contactEmail}
            error={emailError}
            onChange={(e) => {
              setContactEmail(e.target.value)
              if (emailError) setEmailError('')
            }}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-[15px] font-semibold text-charcoal">영상 글귀</h2>
          <p className="text-[12px] text-muted-text leading-relaxed">
            수정 후 「글귀 저장」을 눌러 주세요. 사진·영상은 웹에 올리지 않고, 받은 폴더에 넣어 메일로 보냅니다.
          </p>

          {VIDEO_FORM_FIELDS.map((field) => (
            <div key={field.id} className="landing-card space-y-3">
              <p className="text-[13px] font-semibold text-charcoal">
                {field.timeLabel} · {field.label}
              </p>

              {field.kind === 'names' && (
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="신랑"
                    value={values[field.exportKeys[0]] ?? ''}
                    maxLength={field.maxChars}
                    onChange={(e) => setField(field.exportKeys[0], e.target.value, field.maxChars)}
                  />
                  <Field
                    label="신부"
                    value={values[field.exportKeys[1]] ?? ''}
                    maxLength={field.maxChars}
                    onChange={(e) => setField(field.exportKeys[1], e.target.value, field.maxChars)}
                  />
                </div>
              )}

              {field.kind === 'single' && (
                <>
                  <Field
                    value={values[field.exportKeys[0]] ?? ''}
                    maxLength={field.maxChars}
                    onChange={(e) => setField(field.exportKeys[0], e.target.value, field.maxChars)}
                  />
                  <p className="text-[11px] text-muted-text text-right">
                    {countChars(values[field.exportKeys[0]] ?? '')}/{field.maxChars}자
                  </p>
                </>
              )}

              {field.kind === 'dual' && (
                <>
                  {field.exportKeys.map((key, index) => (
                    <Field
                      key={key}
                      label={`${index + 1}줄`}
                      value={values[key] ?? ''}
                      maxLength={field.dualMaxChars ?? field.maxChars}
                      onChange={(e) =>
                        setField(key, e.target.value, field.dualMaxChars ?? field.maxChars)
                      }
                    />
                  ))}
                  <p className="text-[11px] text-muted-text text-right">
                    줄당 최대 {field.dualMaxChars ?? field.maxChars}자
                  </p>
                </>
              )}
            </div>
          ))}
        </section>

        <section className="landing-card space-y-2 text-[13px] text-charcoal leading-relaxed pb-4">
          <p className="font-semibold">사진·영상 보내는 순서</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-text">
            <li>글귀 저장</li>
            <li>자료 폴더 받기 (ZIP)</li>
            <li>폴더에 사진·영상 넣기</li>
            <li>ZIP으로 메일 전송</li>
          </ol>
        </section>

        {formError && (
          <p className="text-[13px] text-danger text-center" role="alert">
            {formError}
          </p>
        )}
      </div>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/40"
            onClick={() => setShowGuide(false)}
            aria-label="닫기"
          />
          <div className="relative w-full max-w-[360px] landing-card max-h-[min(80vh,520px)] overflow-y-auto p-5 space-y-4">
            <h3 className="text-[17px] font-semibold text-charcoal">사진 보내는 방법</h3>
            <pre className="text-[12px] text-charcoal/90 whitespace-pre-wrap leading-relaxed font-sans">
              {uploadGuide}
            </pre>
            <Btn onClick={() => setShowGuide(false)}>확인</Btn>
          </div>
        </div>
      )}
    </ScreenLayout>
  )
}
