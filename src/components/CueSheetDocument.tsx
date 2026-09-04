import type { AppData } from '../data'
import {
  getEntranceCueMeta,
  entranceTypeForTitle,
  getItemScriptForCueSheet,
  addMinutesLabel,
  buildOrderItemsWithTime,
  type CueSheetVariant,
} from '../lib/cueSheetUtils'
import { getPersonIntroScript, moodLabels, roleLabels } from '../data'

interface Props {
  data: AppData
  variant: CueSheetVariant
}

export default function CueSheetDocument({ data, variant }: Props) {
  const items = buildOrderItemsWithTime(data)
  const groomMeta = getEntranceCueMeta(data, 'groom')
  const brideMeta = getEntranceCueMeta(data, 'bride')

  const dateStr = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
    : '예식 날짜'

  const badgeLabel = variant === 'mc' ? '사회자 전달용' : '본인 출력용'

  return (
    <div className="bg-surface rounded-[16px] border border-border shadow-xl overflow-hidden print:shadow-none print:border-0">
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
        <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              variant === 'mc'
                ? 'bg-white/70 text-lavender border-lavender/20'
                : 'bg-white/70 text-rose border-rose/20'
            }`}
          >
            {badgeLabel}
          </span>
          <span className="px-3 py-1 bg-white/70 rounded-full text-muted-text text-xs font-semibold border border-border">
            {moodLabels[data.mood]}
          </span>
        </div>
      </div>

      {variant === 'mc' && (groomMeta || brideMeta) && (
        <div className="px-8 py-5 bg-lavender-pale/40 border-b border-lavender/15">
          <h2 className="text-xs font-bold text-lavender uppercase tracking-wider mb-3">
            입장 음원 · 타이밍
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {groomMeta && (
              <div className="bg-surface rounded-[10px] border border-border p-4">
                <p className="text-xs font-semibold text-charcoal mb-2">💒 신랑 입장</p>
                {groomMeta.audioTitle ? (
                  <p className="text-sm text-lavender font-medium mb-1 truncate">
                    🎵 {groomMeta.audioTitle}
                  </p>
                ) : (
                  <p className="text-sm text-muted-text mb-1">음원 미첨부</p>
                )}
                <p className="text-sm font-bold text-sage">{groomMeta.timingLabel}</p>
              </div>
            )}
            {brideMeta && (
              <div className="bg-surface rounded-[10px] border border-border p-4">
                <p className="text-xs font-semibold text-charcoal mb-2">👰 신부 입장</p>
                {brideMeta.audioTitle ? (
                  <p className="text-sm text-lavender font-medium mb-1 truncate">
                    🎵 {brideMeta.audioTitle}
                  </p>
                ) : (
                  <p className="text-sm text-muted-text mb-1">음원 미첨부</p>
                )}
                <p className="text-sm font-bold text-sage">{brideMeta.timingLabel}</p>
              </div>
            )}
          </div>
        </div>
      )}

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

      <div className="px-8 py-6">
        <div className="space-y-0">
          {items.map((item, index) => {
            const script = getItemScriptForCueSheet(item, data)
            const entranceType = entranceTypeForTitle(item.title)
            const entranceMeta = entranceType ? getEntranceCueMeta(data, entranceType) : null
            const person = data.persons.find((p) => {
              if (item.title === '축가') return p.role === 'vocalist'
              if (item.title === '축사') return p.role === 'speaker'
              return false
            })

            return (
              <div key={item.id}>
                <div className="py-5 relative pl-16">
                  <div className="absolute left-0 top-5">
                    <span className="text-lavender font-bold text-sm tabular-nums">
                      {addMinutesLabel(data.time, item.startMin)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-2 flex-wrap">
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
                          <span className="text-sage text-sm font-semibold">{person.name}</span>
                        </>
                      )}
                    </div>

                    {entranceMeta && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {entranceMeta.audioTitle && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-lavender-pale text-lavender px-2.5 py-1 rounded-full border border-lavender/20">
                            🎵 {entranceMeta.audioTitle}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-sage-pale text-sage px-2.5 py-1 rounded-full border border-sage/20">
                          ⏱ {entranceMeta.timingLabel}
                        </span>
                      </div>
                    )}

                    {variant === 'mc' && person && (
                      <p className="text-xs text-muted-text mb-2 leading-relaxed">
                        소개: {getPersonIntroScript(person)}
                      </p>
                    )}

                    <div className="bg-muted-bg rounded-[10px] px-4 py-3">
                      <p className="text-charcoal text-sm leading-relaxed whitespace-pre-wrap">
                        {script}
                      </p>
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

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="font-display text-charcoal/80 text-sm italic mb-1">
            두 분의 행복한 결혼을 진심으로 축하드립니다
          </p>
          <p className="text-muted-text/50 text-xs">웨딩 큐시트 메이커로 제작</p>
        </div>
      </div>
    </div>
  )
}
