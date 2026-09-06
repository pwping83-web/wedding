import { useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, MarriageDeclarationReader, OrderItem, SetData } from '../data'
import { isMarriageDeclarationTitle, marriageDeclarationReaderLabels } from '../data'
import { flowStep } from '../config/features'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

export default function OrderEditor({ data, setData, onNext, onBack }: Props) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!dragId || dragId === targetId) return
    setData((prev) => {
      const items = [...prev.orderItems]
      const fromIdx = items.findIndex((i) => i.id === dragId)
      const toIdx = items.findIndex((i) => i.id === targetId)
      const [removed] = items.splice(fromIdx, 1)
      items.splice(toIdx, 0, removed)
      return { ...prev, orderItems: items }
    })
    setDragId(null)
  }

  const addItem = () => {
    if (!newTitle.trim()) return
    const item: OrderItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      duration: 3,
      scriptVariant: 0,
    }
    setData((prev) => ({ ...prev, orderItems: [...prev.orderItems, item] }))
    setNewTitle('')
  }

  const total = data.orderItems.reduce((s, i) => s + i.duration, 0)
  const hasMarriageDeclaration = data.orderItems.some((item) => isMarriageDeclarationTitle(item.title))
  const readerOptions: MarriageDeclarationReader[] = ['mc', 'couple', 'custom']
  const marriageDeclarationItem = data.orderItems.find((item) =>
    isMarriageDeclarationTitle(item.title),
  )

  return (
    <ScreenLayout
      step={flowStep('order')}
      stepLabel="식순"
      title="식순 편집"
      subtitle={`주례 없는 기본 13단계 · 총 ${total}분`}
      onBack={onBack}
      footer={<Btn onClick={onNext}>다음</Btn>}
    >
      <div className="space-y-2 mb-4">
        {data.orderItems.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={() => setDragId(null)}
            className={`flex items-center gap-3 p-3.5 bg-surface rounded-xl border ${
              dragId === item.id ? 'opacity-50 border-accent' : 'border-border'
            }`}
          >
            <span className="text-[12px] text-muted-text w-5 tabular-nums">{index + 1}</span>
            <span className="flex-1 text-[14px] font-medium text-charcoal truncate">
              {item.title}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min={1}
                max={60}
                value={item.duration}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    orderItems: prev.orderItems.map((i) =>
                      i.id === item.id
                        ? { ...i, duration: Math.max(1, parseInt(e.target.value) || 1) }
                        : i,
                    ),
                  }))
                }
                className="w-10 h-8 text-center bg-muted-bg rounded-lg text-[13px] outline-none"
              />
              <span className="text-[12px] text-muted-text">분</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setData((prev) => ({
                  ...prev,
                  orderItems: prev.orderItems.filter((i) => i.id !== item.id),
                }))
              }
              className="text-muted-text text-sm px-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {hasMarriageDeclaration && (
        <Card className="p-4 mb-4 space-y-3">
          <div>
            <p className="text-[14px] font-semibold text-charcoal">성혼선언문 낭독</p>
            <p className="text-[12px] text-muted-text mt-0.5">누가 성혼선언문을 낭독할지 선택하세요</p>
          </div>
          <div className="space-y-2">
            {readerOptions.map((reader) => (
              <label
                key={reader}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                  data.marriageDeclarationReader === reader
                    ? 'border-accent bg-accent-soft'
                    : 'border-border bg-surface'
                }`}
              >
                <input
                  type="radio"
                  name="marriageDeclarationReader"
                  value={reader}
                  checked={data.marriageDeclarationReader === reader}
                  onChange={() =>
                    setData((prev) => ({ ...prev, marriageDeclarationReader: reader }))
                  }
                  className="accent-accent w-4 h-4 shrink-0"
                />
                <span className="text-[14px] font-medium text-charcoal">
                  {marriageDeclarationReaderLabels[reader]}
                </span>
              </label>
            ))}
          </div>
          {data.marriageDeclarationReader === 'custom' && marriageDeclarationItem && (
            <div className="pt-1">
              <label className="block text-[13px] font-medium text-charcoal mb-1.5">
                성혼선언문 멘트
              </label>
              <textarea
                value={marriageDeclarationItem.customScript ?? ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    orderItems: prev.orderItems.map((item) =>
                      item.id === marriageDeclarationItem.id
                        ? { ...item, customScript: e.target.value }
                        : item,
                    ),
                  }))
                }
                rows={5}
                placeholder="성혼선언문 멘트를 직접 입력하세요"
                className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-[14px] text-charcoal leading-relaxed resize-y min-h-[120px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
              <p className="text-[11px] text-muted-text mt-1.5">
                입력한 내용은 미리보기·인쇄·사회자 전송 큐시트에 그대로 반영됩니다
              </p>
            </div>
          )}
        </Card>
      )}

      <Card className="p-3 flex gap-2">
        <input
          type="text"
          placeholder="항목 추가"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          className="flex-1 h-10 px-3 bg-transparent text-[14px] outline-none"
        />
        <Btn full={false} variant="secondary" onClick={addItem} disabled={!newTitle.trim()}>
          추가
        </Btn>
      </Card>
    </ScreenLayout>
  )
}
