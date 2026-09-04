import { useState } from 'react'
import StepIndicator from '../components/StepIndicator'
import type { AppData, SetData } from '../data'
import { getOrderItemScript, roleLabels } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
  onGoOutput: () => void
}

type Tab = 'card' | 'timeline'

function addMinutes(base: string, mins: number) {
  if (!base) return '--:--'
  const [h, m] = base.split(':').map(Number)
  const total = h * 60 + m + mins
  const dh = Math.floor(total / 60) % 24
  const dm = total % 60
  return `${dh.toString().padStart(2, '0')}:${dm.toString().padStart(2, '0')}`
}

export default function Preview({ data, onBack, onGoOutput }: Props) {
  const [tab, setTab] = useState<Tab>('card')

  const dateStr = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
    : ''

  let cumulative = 0
  const items = data.orderItems.map((item) => {
    const start = cumulative
    cumulative += item.duration
    return { ...item, startMin: start }
  })

  return (
    <div className="min-h-screen bg-bg">
      <StepIndicator currentStep={6} onBack={onBack} />

      <div className="max-w-lg mx-auto px-4 py-8 pb-24">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-charcoal mb-1">전체 미리보기</h1>
          <p className="text-muted-text text-sm">완성된 식순과 큐시트를 확인하세요</p>
        </div>

        {/* Header card */}
        <div className="bg-lavender-pale rounded-[14px] border border-lavender/20 p-5 mb-5 text-center">
          <h2 className="font-display text-xl font-bold text-charcoal mb-1">
            {data.groomName || '신랑'} ♡ {data.brideName || '신부'}
          </h2>
          {dateStr && <p className="text-muted-text text-sm">{dateStr}</p>}
          {data.time && data.venue && (
            <p className="text-muted-text text-sm">
              {data.time} · {data.venue}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="text-xs text-lavender font-medium">
              총 {cumulative}분 예식
            </span>
            <span className="text-muted-text/30">·</span>
            <span className="text-xs text-lavender font-medium">
              {data.orderItems.length}개 순서
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted-bg rounded-[12px] p-1 mb-5">
          {([['card', '식순 카드'], ['timeline', '타임라인']] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-[10px] text-sm font-semibold transition-all ${
                tab === t
                  ? 'bg-surface text-charcoal shadow-sm'
                  : 'text-muted-text hover:text-charcoal'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Card View */}
        {tab === 'card' && (
          <div className="space-y-3">
            {items.map((item, index) => {
              const script = getOrderItemScript(item, data.mood, data)
              const person = data.persons.find((p) => {
                if (item.title === '축가') return p.role === 'vocalist'
                if (item.title === '축사') return p.role === 'speaker'
                if (item.title === '주례사') return p.role === 'officiant'
                return false
              })
              return (
                <div
                  key={item.id}
                  className="bg-surface rounded-[13px] border border-border p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-lavender rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[11px] font-bold tabular-nums">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-charcoal text-sm">{item.title}</h3>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lavender text-sm font-semibold tabular-nums">
                            {addMinutes(data.time, item.startMin)}
                          </span>
                          <span className="text-muted-text text-xs bg-muted-bg px-2 py-0.5 rounded-full tabular-nums">
                            {item.duration}분
                          </span>
                        </div>
                      </div>
                      {person && (
                        <p className="text-sage text-xs mb-1.5 font-medium">
                          {person.name}{' '}
                          <span className="text-sage/70 font-normal">({person.relationship})</span>
                        </p>
                      )}
                      <p className="text-muted-text text-sm leading-relaxed">{script}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Timeline View */}
        {tab === 'timeline' && (
          <div className="relative pl-4">
            <div className="absolute left-[68px] top-2 bottom-2 w-px bg-border" />
            <div className="space-y-1">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-start gap-0">
                  {/* Time */}
                  <div className="w-[60px] flex-shrink-0 pt-3 text-right pr-3">
                    <span className="text-lavender font-semibold text-xs tabular-nums">
                      {addMinutes(data.time, item.startMin)}
                    </span>
                  </div>
                  {/* Dot */}
                  <div className="flex-shrink-0 pt-[14px] relative z-10">
                    <div className="w-3 h-3 bg-lavender rounded-full border-2 border-bg shadow-sm" />
                  </div>
                  {/* Card */}
                  <div className="flex-1 pl-3 pb-3">
                    <div className="bg-surface rounded-[10px] border border-border p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-charcoal text-sm">{item.title}</span>
                        <span className="text-muted-text text-xs tabular-nums">{item.duration}분</span>
                      </div>
                      <p className="text-muted-text text-xs leading-relaxed mt-1">
                        {getOrderItemScript(item, data.mood, data)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* End */}
              <div className="flex items-center gap-0">
                <div className="w-[60px] flex-shrink-0 text-right pr-3">
                  <span className="text-sage font-semibold text-xs tabular-nums">
                    {addMinutes(data.time, cumulative)}
                  </span>
                </div>
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-3 h-3 bg-sage rounded-full border-2 border-bg shadow-sm" />
                </div>
                <div className="pl-3">
                  <span className="text-sage text-sm font-semibold">예식 종료</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg/95 backdrop-blur-sm border-t border-border px-4 py-4 no-print">
        <div className="max-w-lg mx-auto">
          <button
            onClick={onGoOutput}
            className="w-full py-4 bg-lavender text-white rounded-[13px] font-bold text-base hover:bg-lavender-light transition-all hover:shadow-md"
          >
            최종 큐시트 출력 →
          </button>
        </div>
      </div>
    </div>
  )
}
