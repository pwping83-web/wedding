import Btn from './mobile/Btn'

type Props = {
  open: boolean
  onClose: () => void
}

export default function McInquirySuccessModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mc-inquiry-success-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-[3px]"
        onClick={onClose}
        aria-label="닫기"
      />

      <div className="relative w-full max-w-[320px] text-center">
        <div className="landing-card px-6 py-7">
          <div className="delivery-success-modal__icon mx-auto mb-4" aria-hidden="true">
            ✓
          </div>

          <h2
            id="mc-inquiry-success-title"
            className="text-[22px] font-semibold text-charcoal leading-snug mb-2"
          >
            상담 신청 완료
          </h2>

          <p className="text-[15px] text-charcoal/90 leading-relaxed mb-2">
            입력하신 문의 내용과 연락처만 전송했습니다.
          </p>
          <p className="text-[14px] text-muted-text leading-relaxed mb-5">24시간 안에 연락드릴게요.</p>

          <Btn onClick={onClose}>확인</Btn>
        </div>
      </div>
    </div>
  )
}
