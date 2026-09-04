import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, SetData } from '../data'
import { roleLabels } from '../data'
import {
  getEntranceCueMeta,
  entranceTypeForTitle,
  getItemScriptForCueSheet,
  addMinutesLabel,
  buildOrderItemsWithTime,
} from '../lib/cueSheetUtils'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
  onGoOutput: () => void
}

export default function Preview({ data, onBack, onGoOutput }: Props) {
  const items = buildOrderItemsWithTime(data)
  const total = data.orderItems.reduce((s, i) => s + i.duration, 0)

  return (
    <ScreenLayout
      step={6}
      stepLabel="미리보기"
      title="식순 미리보기"
      subtitle={`${data.orderItems.length}단계 · ${total}분`}
      onBack={onBack}
      footer={<Btn onClick={onGoOutput}>최종 큐시트</Btn>}
    >
      <div className="space-y-3">
        {items.map((item, index) => {
          const entranceType = entranceTypeForTitle(item.title)
          const entranceMeta = entranceType ? getEntranceCueMeta(data, entranceType) : null
          const person = data.persons.find((p) => {
            if (item.title === '축가') return p.role === 'vocalist'
            if (item.title === '축사') return p.role === 'speaker'
            return false
          })

          return (
            <Card key={item.id} className="p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-[12px] text-muted-text tabular-nums">
                    {index + 1} · {addMinutesLabel(data.time, item.startMin)}
                  </p>
                  <p className="text-[15px] font-semibold text-charcoal">{item.title}</p>
                </div>
                <span className="text-[12px] text-muted-text shrink-0">{item.duration}분</span>
              </div>

              {entranceMeta && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {entranceMeta.audioTitle && (
                    <span className="text-[11px] bg-accent-soft text-accent px-2 py-0.5 rounded-full truncate max-w-full">
                      {entranceMeta.audioTitle}
                    </span>
                  )}
                  <span className="text-[11px] bg-success-soft text-success px-2 py-0.5 rounded-full font-medium">
                    {entranceMeta.timingLabel}
                  </span>
                </div>
              )}

              {person && (
                <p className="text-[12px] text-muted-text mb-1">
                  {roleLabels[person.role]} {person.name}
                </p>
              )}

              <p className="text-[13px] text-charcoal leading-relaxed line-clamp-4">
                {getItemScriptForCueSheet(item, data)}
              </p>
            </Card>
          )
        })}
      </div>
    </ScreenLayout>
  )
}
