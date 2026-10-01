import { useEffect, useMemo, useRef, useState } from 'react'
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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

const POINT_PHOTO_HINTS: Record<string, string> = {
  P01: '두 사람이 함께 나온 대표 사진',
  P02: '태그 문구 장면',
  P03: '얼굴이 작게 나와도 되는 장면',
  P04: 'P04 장면',
  P05: 'P05 장면',
  P06: 'P06 장면',
  P07: '3초 정지 — 가장 좋아하는 사진',
  P08: '큰 글자가 덮는 장면',
  P09: 'P09 장면',
  P10: 'P10 장면',
  P11: '마지막 4초 — 가장 좋아하는 사진',
}

type PointPhoto = {
  id: string
  file: File | null
  previewUrl: string | null
}

function initialPointPhotos(): PointPhoto[] {
  return Object.keys(POINT_PHOTO_HINTS).map((id) => ({ id, file: null, previewUrl: null }))
}

export default function VideoEditorPage() {
  const prefill = useMemo(() => loadMcInquiryPrefill(), [])
  const groomDefault = prefill?.groomName ?? ''
  const brideDefault = prefill?.brideName ?? ''

  const flowInputRef = useRef<HTMLInputElement>(null)

  const [values, setValues] = useState<VideoFormValues>(() => {
    const draft = loadVideoEditorDraft()
    if (draft?.values) {
      return { ...buildDefaultVideoFormValues(groomDefault, brideDefault), ...draft.values }
    }
    return buildDefaultVideoFormValues(groomDefault, brideDefault)
  })
  const [contactEmail, setContactEmail] = useState(() => loadVideoEditorDraft()?.contactEmail ?? '')
  const [emailError, setEmailError] = useState('')
  const [pointPhotos, setPointPhotos] = useState<PointPhoto[]>(initialPointPhotos)
  const [flowFiles, setFlowFiles] = useState<File[]>([])
  const [showGuide, setShowGuide] = useState(false)
  const [savedHint, setSavedHint] = useState('')

  useEffect(() => {
    if (!isVideoAccessUnlocked()) {
      goToMarketing('video')
    }
  }, [])

  useEffect(() => {
    return () => {
      pointPhotos.forEach((slot) => {
        if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl)
      })
    }
  }, [pointPhotos])

  function setField(key: string, next: string, max: number) {
    setValues((prev) => ({ ...prev, [key]: clampToMaxChars(next, max) }))
  }

  function handlePointPhoto(id: string, file: File | null) {
    setPointPhotos((prev) =>
      prev.map((slot) => {
        if (slot.id !== id) return slot
        if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl)
        if (!file) return { ...slot, file: null, previewUrl: null }
        return { ...slot, file, previewUrl: URL.createObjectURL(file) }
      }),
    )
  }

  function handleSaveDraft() {
    saveVideoEditorDraft(values, contactEmail)
    setSavedHint('글귀·이메일을 이 기기에 임시 저장했습니다.')
    window.setTimeout(() => setSavedHint(''), 2500)
  }

  function openUploadGuide() {
    if (!isValidEmail(contactEmail)) {
      setEmailError('완성·샘플 영상을 받을 이메일을 입력해 주세요.')
      return
    }
    setEmailError('')
    saveVideoEditorDraft(values, contactEmail)
    setShowGuide(true)
  }

  function handleDownloadJson() {
    const payload = buildVideoExportPayload(values, groomDefault, brideDefault)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `video-text-${values.P01_groom || 'groom'}-${values.P01_bride || 'bride'}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const groomName = values.P01_groom?.trim() || groomDefault || '신랑'
  const brideName = values.P01_bride?.trim() || brideDefault || '신부'
  const orderNumber = `V${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
  const uploadGuide = buildPhotoUploadInstructions(orderNumber, groomName, brideName)

  const pointCount = pointPhotos.filter((s) => s.file).length
  const flowCount = flowFiles.length

  return (
    <ScreenLayout
      title="식전영상 제작"
      subtitle="글귀 수정 · 사진 선택"
      onBack={() => goToMarketing('video')}
      contentClassName="pb-52"
      footer={
        <div className="space-y-3">
          <Btn onClick={openUploadGuide}>사진 보내는 방법</Btn>
          <Btn variant="secondary" onClick={handleSaveDraft}>
            글귀 임시 저장
          </Btn>
        </div>
      }
    >
      <div className="space-y-8">
        <section className="landing-card space-y-3">
          <h2 className="text-[15px] font-semibold text-charcoal">완성·샘플 영상 받을 이메일</h2>
          <p className="text-[12px] text-muted-text leading-relaxed">
            제작이 끝나면 이 주소로 식전영상 샘플·완성본 안내를 보내 드립니다.
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
            샘플 영상 타임라인에 맞춰 문구를 수정해 주세요. 비우면 기본 문구가 사용됩니다.
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

          <Btn variant="secondary" onClick={handleDownloadJson}>
            글귀 JSON 내려받기
          </Btn>
          {savedHint && <p className="text-[12px] text-accent text-center">{savedHint}</p>}
        </section>

        <section className="space-y-4">
          <h2 className="text-[15px] font-semibold text-charcoal">포인트 사진 (P01~P11)</h2>
          <p className="text-[12px] text-muted-text leading-relaxed">
            화면에 길게 멈추는 11장입니다. 가로 사진을 권장합니다.
          </p>

          {pointPhotos.map((slot) => (
            <div key={slot.id} className="landing-card space-y-2">
              <p className="text-[13px] font-medium text-charcoal">
                {slot.id} · {POINT_PHOTO_HINTS[slot.id]}
              </p>
              {slot.previewUrl && (
                <img
                  src={slot.previewUrl}
                  alt=""
                  className="w-full max-h-40 object-cover rounded-lg border border-border"
                />
              )}
              <label className="block">
                <span className="sr-only">{slot.id} 사진 선택</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="block w-full text-[13px] text-muted-text file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-muted-bg file:text-charcoal"
                  onChange={(e) => handlePointPhoto(slot.id, e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          ))}
          <p className="text-[12px] text-muted-text text-center">선택됨 {pointCount}/11</p>
        </section>

        <section className="space-y-3 pb-6">
          <h2 className="text-[15px] font-semibold text-charcoal">흐름 사진 (F01~F49)</h2>
          <p className="text-[12px] text-muted-text leading-relaxed">
            지나가는 사진을 시간 순서대로 골라 주세요. 49장보다 적으면 앞에서부터 반복됩니다.
          </p>
          <div className="landing-card space-y-3">
            <input
              ref={flowInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="sr-only"
              onChange={(e) => setFlowFiles(Array.from(e.target.files ?? []))}
            />
            <Btn variant="secondary" type="button" onClick={() => flowInputRef.current?.click()}>
              흐름 사진 여러 장 선택
            </Btn>
            {flowCount > 0 && (
              <p className="text-[13px] text-charcoal text-center">{flowCount}개 파일 선택됨</p>
            )}
          </div>
        </section>
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
            <p className="text-[13px] text-charcoal">
              <span className="font-medium">수신 이메일:</span> {contactEmail.trim()}
            </p>
            <pre className="text-[12px] text-charcoal/90 whitespace-pre-wrap leading-relaxed font-sans">
              {uploadGuide}
            </pre>
            <p className="text-[12px] text-muted-text">
              이 페이지에서 고른 사진은 기기에만 남습니다. 안내에 따라 사진을 보내 주시면 위 이메일로
              영상을 안내해 드립니다.
            </p>
            <Btn onClick={() => setShowGuide(false)}>확인</Btn>
          </div>
        </div>
      )}
    </ScreenLayout>
  )
}
