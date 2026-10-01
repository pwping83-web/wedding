import Btn from './mobile/Btn'
import { goToMarketing } from '../lib/marketingRoutes'

type Props = {
  wantsPreweddingVideo: boolean
}

export default function McInquirySuccess({ wantsPreweddingVideo }: Props) {
  return (
    <div className="landing-card space-y-4 text-center py-6">
      <p className="text-[17px] font-semibold text-charcoal">상담 신청이 접수되었습니다.</p>
      <p className="text-[14px] text-muted-text leading-relaxed">24시간 안에 연락드릴게요.</p>
      {wantsPreweddingVideo && (
        <Btn onClick={() => goToMarketing('video')}>식전영상 신청 계속하기</Btn>
      )}
      <Btn variant="secondary" onClick={() => goToMarketing('home')}>
        식순 만들기로 돌아가기
      </Btn>
    </div>
  )
}
