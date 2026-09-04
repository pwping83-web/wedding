import { useState } from 'react'
import ScreenLayout from '../components/mobile/ScreenLayout'
import Btn from '../components/mobile/Btn'
import { Card } from '../components/mobile/PageHeader'
import type { AppData, OrderItem, SetData } from '../data'

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

  return (
    <ScreenLayout
      step={3}
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
