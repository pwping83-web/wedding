import Btn from './Btn'
import { MC_EMAIL } from '../../lib/deliverCueSheet'

interface Props {
  open: boolean
  onClose: () => void
  groomName: string
  brideName: string
}

export default function DeliverySuccessModal({ open, onClose, groomName, brideName }: Props) {
  if (!open) return null

  const coupleLabel = [groomName, brideName].filter(Boolean).join(' · ') || '예식'

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-success-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-[3px]"
        onClick={onClose}
        aria-label="닫기"
      />

      <div className="delivery-success-modal relative w-full max-w-[320px] text-center">
        <div className="landing-card px-6 py-7">
          <div className="delivery-success-modal__icon mx-auto mb-4" aria-hidden="true">
            ✓
          </div>

          <p className="text-[12px] font-medium text-rose-gold tracking-[0.14em] uppercase mb-2">
            ENX Wedding · MC
          </p>

          <h2
            id="delivery-success-title"
            className="text-[22px] font-semibold text-charcoal leading-snug mb-2"
          >
            전송 완료
          </h2>

          <p className="text-[15px] text-charcoal/90 leading-relaxed mb-1">
            <strong className="font-semibold">{coupleLabel}</strong> 큐시트가
            <br />
            사회자 메일로 전송되었습니다.
          </p>

          <p className="text-[13px] text-muted-text mb-6">{MC_EMAIL}</p>

          <Btn onClick={onClose}>확인</Btn>
        </div>
      </div>
    </div>
  )
}
