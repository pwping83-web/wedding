import { useState, type FormEvent } from 'react'
import Field from './mobile/Field'
import Btn from './mobile/Btn'
import type { McInquiryPrefill } from '../lib/mcInquiryPrefill'
import { submitMcRequest } from '../lib/submitMcRequest'

type Props = {
  prefill: McInquiryPrefill | null
  onSuccess: (result: { wantsPreweddingVideo: boolean }) => void
}

const PRIVACY_NOTICE =
  '수집 항목: 이름, 예식 일시·장소, 연락처, 이메일, 문의 내용 · 이용 목적: MC 상담 및 식전영상 안내 · 보유: 상담 종료 후 1년 이내 파기'

export default function McInquiryForm({ prefill, onSuccess }: Props) {
  const [groomName, setGroomName] = useState(prefill?.groomName ?? '')
  const [brideName, setBrideName] = useState(prefill?.brideName ?? '')
  const [ceremonyDate, setCeremonyDate] = useState(prefill?.date ?? '')
  const [ceremonyTime, setCeremonyTime] = useState(prefill?.time ?? '')
  const [venue, setVenue] = useState(prefill?.venue ?? '')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [wantsPreweddingVideo, setWantsPreweddingVideo] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await submitMcRequest({
        groomName,
        brideName,
        ceremonyDate,
        ceremonyTime,
        venue,
        phone,
        email,
        message,
        wantsPreweddingVideo,
        privacyAgreed,
      })
      onSuccess({ wantsPreweddingVideo })
    } catch (err) {
      setError(err instanceof Error ? err.message : '상담 신청에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <p className="text-[15px] font-semibold text-charcoal">MC 상담 신청</p>

      <Field
        label="신랑 이름"
        required
        value={groomName}
        onChange={(e) => setGroomName(e.target.value)}
        autoComplete="name"
      />
      <Field
        label="신부 이름"
        required
        value={brideName}
        onChange={(e) => setBrideName(e.target.value)}
        autoComplete="name"
      />
      <Field
        label="예식 날짜"
        type="date"
        value={ceremonyDate}
        onChange={(e) => setCeremonyDate(e.target.value)}
      />
      <Field
        label="예식 시간"
        type="time"
        value={ceremonyTime}
        onChange={(e) => setCeremonyTime(e.target.value)}
      />
      <Field
        label="예식장"
        required
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="예식장 이름"
      />
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
      <Field
        label="이메일"
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      <div className="space-y-1.5">
        <label className="block text-[13px] font-medium text-charcoal">문의 내용</label>
        <textarea
          className="w-full min-h-[100px] px-4 py-3 bg-surface border border-border rounded-xl text-[15px] text-charcoal outline-none placeholder:text-muted-text/50 focus:border-accent focus:ring-2 focus:ring-accent/15 resize-y"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="희망 진행 방식, 궁금한 점 등"
        />
      </div>

      <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-surface cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-accent"
          checked={wantsPreweddingVideo}
          onChange={(e) => setWantsPreweddingVideo(e.target.checked)}
        />
        <span className="text-[14px] text-charcoal leading-snug">식전영상 무료 제작도 함께 신청합니다</span>
      </label>

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
        {submitting ? '접수 중…' : '상담 신청하기'}
      </Btn>
    </form>
  )
}
