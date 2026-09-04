import { useState } from 'react'
import type { AppData, SetData } from '../data'
import { getOrderItemScript, moodLabels, roleLabels } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

function addMinutes(base: string, mins: number) {
  if (!base) return '--:--'
  const [h, m] = base.split(':').map(Number)
  const total = h * 60 + m + mins
  const dh = Math.floor(total / 60) % 24
  const dm = total % 60
  return `${dh.toString().padStart(2, '0')}:${dm.toString().padStart(2, '0')}`
}

export default function FinalOutput({ data, onBack }: Props) {
  const [email, setEmail] = useState(data.email || '')
  const [emailSent, setEmailSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [printing, setPrinting] = useState(false)

  const dateStr = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
    : '예식 날짜'

  const handlePrint = () => {
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setTimeout(() => setPrinting(false), 2000)
    }, 150)
  }

  const handleEmail = () => {
    if (!email.trim()) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 3000)
    }, 1400)
  }

  let cumulative = 0
  const items = data.orderItems.map((item) => {
    const start = cumulative
    cumulative += item.duration
    return { ...item, startMin: start }
  })

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-bg/95 backdrop-blur-sm border-b border-border no-print">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={onBack}
            className="text-muted-text hover:text-charcoal transition-colors text-sm"
          >
            ← 이전
          </button>
          <span className="font-semibold text-charcoal text-sm mx-auto">최종 큐시트</span>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 no-print">
          <button
            onClick={handlePrint}
            disabled={printing}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[13px] font-bold text-base transition-all ${
              printing
                ? 'bg-sage text-white cursor-wait'
                : 'bg-lavender text-white hover:bg-lavender-light hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            <span className="text-xl">{printing ? '✓' : '🖨️'}</span>
            {printing ? '인쇄 시작됨' : '인쇄하기'}
          </button>

          <div className="flex-1 flex gap-2">
            <input
              type="email"
              placeholder="사회자 이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmail()}
              className="flex-1 min-w-0 px-4 py-4 bg-surface border border-border rounded-[13px] text-sm text-charcoal outline-none focus:ring-2 focus:ring-lavender/25 focus:border-lavender transition-all"
            />
            <button
              onClick={handleEmail}
              disabled={!email.trim() || sending}
              className={`px-4 py-4 rounded-[13px] font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 ${
                emailSent
                  ? 'bg-sage text-white'
                  : 'bg-rose-pale text-rose border border-rose/20 hover:bg-rose hover:text-white hover:shadow-md'
              }`}
            >
              {emailSent ? '✓ 전송됨' : sending ? '전송 중...' : '이메일\n보내기'}
            </button>
          </div>
        </div>

        {/* Document shadow container */}
        <div className="bg-surface rounded-[16px] border border-border shadow-xl overflow-hidden">
          {/* Document header */}
          <div className="bg-gradient-to-br from-lavender-pale to-lavender-muted px-8 py-8 text-center border-b border-lavender/20">
            <div className="inline-block mb-3">
              <span className="text-2xl">💒</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-charcoal mb-1">
              {data.groomName || '신랑'} · {data.brideName || '신부'} 결혼 예식
            </h1>
            <p className="text-muted-text text-sm">{dateStr}</p>
            {data.time && (
              <p className="text-muted-text text-sm">
                {data.time} · {data.venue || '예식장'}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="px-3 py-1 bg-white/70 rounded-full text-lavender text-xs font-semibold border border-lavender/20">
                사회자 큐시트
              </span>
              <span className="px-3 py-1 bg-white/70 rounded-full text-muted-text text-xs font-semibold border border-border">
                {moodLabels[data.mood]}
              </span>
            </div>
          </div>

          {/* Persons summary */}
          {data.persons.length > 0 && (
            <div className="px-8 py-4 bg-muted-bg border-b border-border">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {data.persons.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5">
                    <span className="text-muted-text text-xs">{roleLabels[p.role]}</span>
                    <span className="text-charcoal text-sm font-semibold">{p.name}</span>
                    <span className="text-muted-text/60 text-xs">({p.relationship})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order items */}
          <div className="px-8 py-6">
            <div className="space-y-0">
              {items.map((item, index) => {
                const script = getOrderItemScript(item, data.mood, data)
                const person = data.persons.find((p) => {
                  if (item.title === '축가') return p.role === 'vocalist'
                  if (item.title === '축사') return p.role === 'speaker'
                  if (item.title === '주례사') return p.role === 'officiant'
                  return false
                })
                return (
                  <div key={item.id}>
                    <div className="py-5 relative pl-16">
                      {/* Time column */}
                      <div className="absolute left-0 top-5">
                        <span className="text-lavender font-bold text-sm tabular-nums">
                          {addMinutes(data.time, item.startMin)}
                        </span>
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-[10px] text-muted-text font-bold tracking-widest tabular-nums">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <h3 className="font-display font-bold text-charcoal text-base">
                            {item.title}
                          </h3>
                          <span className="text-muted-text text-xs tabular-nums">
                            ({item.duration}분)
                          </span>
                          {person && (
                            <>
                              <span className="text-muted-text/40 text-xs">·</span>
                              <span className="text-sage text-sm font-semibold">
                                {person.name}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="bg-muted-bg rounded-[10px] px-4 py-3">
                          <p className="text-charcoal text-sm leading-relaxed">{script}</p>
                        </div>
                      </div>
                    </div>
                    {index < items.length - 1 && (
                      <div className="border-b border-border ml-16" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="font-display text-charcoal/80 text-sm italic mb-1">
                두 분의 행복한 결혼을 진심으로 축하드립니다
              </p>
              <p className="text-muted-text/50 text-xs">웨딩 큐시트 메이커로 제작</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg/95 backdrop-blur-sm border-t border-border px-4 py-4 no-print">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-lavender text-white rounded-[12px] font-bold text-sm hover:bg-lavender-light transition-all hover:shadow-md"
          >
            <span>🖨️</span> 인쇄하기
          </button>
          <button
            onClick={handleEmail}
            disabled={!email.trim() || sending || emailSent}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[12px] font-bold text-sm transition-all ${
              emailSent
                ? 'bg-sage text-white'
                : 'bg-surface border border-border text-charcoal hover:border-lavender hover:text-lavender disabled:opacity-40'
            }`}
          >
            <span>✉️</span>
            {emailSent ? '전송 완료!' : sending ? '전송 중...' : '이메일 보내기'}
          </button>
        </div>
      </div>
    </div>
  )
}
