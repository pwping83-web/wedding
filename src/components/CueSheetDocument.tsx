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
      })
    : ''

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-6 border-b border-border text-center">
        <p className="text-[11px] font-medium text-accent mb-1">
          {variant === 'mc' ? '사회자 큐시트' : '신랑·신부용'}
        </p>
        <h1 className="text-[18px] font-semibold text-charcoal">
          {data.groomName || '신랑'} · {data.brideName || '신부'}
        </h1>
        {dateStr && <p className="text-[13px] text-muted-text mt-1">{dateStr}</p>}
        {data.time && (
          <p className="text-[13px] text-muted-text">
            {data.time} · {data.venue || '예식장'}
          </p>
        )}
        <p className="text-[11px] text-muted-text mt-2">{moodLabels[data.mood]}</p>
      </div>

      {variant === 'mc' && (groomMeta || brideMeta) && (
        <div className="px-5 py-4 bg-muted-bg border-b border-border space-y-2">
          <p className="text-[12px] font-semibold text-charcoal">입장 음원 · 타이밍</p>
          {groomMeta && (
            <p className="text-[13px]">
              신랑 · {groomMeta.audioTitle ?? '음원 없음'} ·{' '}
              <span className="font-semibold text-success">{groomMeta.timingLabel}</span>
            </p>
          )}
          {brideMeta && (
            <p className="text-[13px]">
              신부 · {brideMeta.audioTitle ?? '음원 없음'} ·{' '}
              <span className="font-semibold text-success">{brideMeta.timingLabel}</span>
            </p>
          )}
        </div>
      )}

      <div className="px-5 py-4 space-y-4">
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
            <div key={item.id} className="pb-4 border-b border-border last:border-0">
              <div className="flex justify-between gap-2 mb-1">
                <p className="text-[14px] font-semibold">
                  {index + 1}. {item.title}
                </p>
                <span className="text-[12px] text-muted-text tabular-nums shrink-0">
                  {addMinutesLabel(data.time, item.startMin)}
                </span>
              </div>

              {entranceMeta && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {entranceMeta.audioTitle && (
                    <span className="text-[11px] bg-accent-soft text-accent px-2 py-0.5 rounded-full">
                      {entranceMeta.audioTitle}
                    </span>
                  )}
                  <span className="text-[11px] bg-success-soft text-success px-2 py-0.5 rounded-full font-medium">
                    {entranceMeta.timingLabel}
                  </span>
                </div>
              )}

              {person && variant === 'mc' && (
                <p className="text-[12px] text-muted-text mb-1">
                  {roleLabels[person.role]} {person.name} — {getPersonIntroScript(person)}
                </p>
              )}

              <p className="text-[13px] leading-relaxed text-charcoal whitespace-pre-wrap">
                {script}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
