import { useState, type FormEvent } from 'react'
import Field from './mobile/Field'
import Btn from './mobile/Btn'
import { isValidVideoAccessCode, unlockVideoAccess } from '../lib/videoAccess'
import { goToMarketing } from '../lib/marketingRoutes'

export default function VideoAccessGate() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!isValidVideoAccessCode(code)) {
      setError('무료제작 코드를 확인해 주세요. (연락처 뒤 4자리)')
      return
    }
    unlockVideoAccess(code)
    goToMarketing('video-edit')
  }

  return (
    <form className="landing-card space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <p className="text-[15px] font-semibold text-charcoal">무료제작 코드</p>
        <p className="text-[12px] text-muted-text leading-relaxed">
          MC 신청 후 안내받은 연락처 뒤 4자리를 입력해 주세요.
        </p>
      </div>
      <Field
        label="코드"
        required
        inputMode="numeric"
        maxLength={4}
        autoComplete="one-time-code"
        placeholder="0000"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
        error={error}
      />
      <Btn type="submit" disabled={code.length < 4}>
        글귀·사진 입력하기
      </Btn>
    </form>
  )
}
