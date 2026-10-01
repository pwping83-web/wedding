import { useState, type FormEvent } from 'react'
import Field from './mobile/Field'
import Btn from './mobile/Btn'
import type { McInquiryPrefill } from '../lib/mcInquiryPrefill'
import { submitMcRequest } from '../lib/submitMcRequest'

type Props = {
  prefill: McInquiryPrefill | null
  onSuccess: () => void
}

const PRIVACY_NOTICE =
  '수집 항목: 연락처, 문의 내용 · 이용 목적: MC 상담 안내 · 보유: 상담 종료 후 1년 이내 파기'

function buildMessageWithPrefill(message: string, prefill: McInquiryPrefill | null): string {
  const body = message.trim()
  if (!prefill) return body

  const lines: string[] = []
  if (prefill.groomName || prefill.brideName) {
    lines.push(`커플: ${[prefill.groomName, prefill.brideName].filter(Boolean).join(' · ')}`)
  }
  if (prefill.date || prefill.time) {
    lines.push(`예식: ${[prefill.date, prefill.time].filter(Boolean).join(' ')}`)
  }
  if (prefill.venue) lines.push(`예식장: ${prefill.venue}`)

  if (lines.length === 0) return body

  const appendix = ['', '[식순에서 불러온 참고 정보]', ...lines].join('\n')
  return body ? `${body}${appendix}` : appendix.trim()
}

export default function McInquiryForm({ prefill, onSuccess }: Props) {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await submitMcRequest({
        phone,
        message: buildMessageWithPrefill(message, prefill),
        privacyAgreed,
        prefill,
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '상담 신청에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <p className="text-[15px] font-semibold text-charcoal">MC 상담 신청</p>

      <div className="space-y-1.5">
        <label className="block text-[13px] font-medium text-charcoal">
          문의 내용<span className="text-danger ml-0.5">*</span>
        </label>
        <textarea
          className="w-full min-h-[120px] px-4 py-3 bg-surface border border-border rounded-xl text-[15px] text-charcoal outline-none placeholder:text-muted-text/50 focus:border-accent focus:ring-2 focus:ring-accent/15 resize-y"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="희망 진행 방식, 궁금한 점 등"
          required
        />
      </div>

      <Field
        label="연락처"
        required
        type="tel"
        inputMode="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="010-0000-0000"
        autoComplete="tel"
      />

      <div className="space-y-2 p-3 rounded-xl border border-border bg-muted-bg/50">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-accent"
            checked={privacyAgreed}
            onChange={(e) => setPrivacyAgreed(e.target.checked)}
            required
          />
          <span className="text-[14px] text-charcoal leading-snug">
            <span className="font-semibold">개인정보 수집·이용 동의</span>
            <span className="text-danger ml-0.5">*</span>
          </span>
        </label>
        <p className="text-[12px] text-muted-text leading-relaxed pl-7">{PRIVACY_NOTICE}</p>
      </div>

      {error && (
        <p className="text-[13px] text-danger text-center" role="alert">
          {error}
        </p>
      )}

      <Btn type="submit" disabled={submitting || !privacyAgreed}>
        {submitting ? '전송 중…' : '상담 신청하기'}
      </Btn>
    </form>
  )
}
