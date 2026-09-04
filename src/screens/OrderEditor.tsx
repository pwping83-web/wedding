import { useState } from 'react'
import StepIndicator from '../components/StepIndicator'
import type { AppData, OrderItem, SetData } from '../data'

interface Props {
  data: AppData
  setData: SetData
  onNext: () => void
  onBack: () => void
}

function DragHandle() {
  return (
    <svg
      width="10"
      height="16"
      viewBox="0 0 10 16"
      fill="currentColor"
      className="text-muted-text/40 group-hover:text-muted-text/70 transition-colors flex-shrink-0"
    >
      <circle cx="2.5" cy="2.5" r="1.5" />
      <circle cx="7.5" cy="2.5" r="1.5" />
      <circle cx="2.5" cy="8" r="1.5" />
      <circle cx="7.5" cy="8" r="1.5" />
      <circle cx="2.5" cy="13.5" r="1.5" />
      <circle cx="7.5" cy="13.5" r="1.5" />
    </svg>
  )
}

export default function OrderEditor({ data, setData, onNext, onBack }: Props) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDuration, setNewDuration] = useState('5')

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(id)
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
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    setDragId(null)
    setDragOverId(null)
  }

  const addItem = () => {
    if (!newTitle.trim()) return
    const item: OrderItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      duration: Math.max(1, parseInt(newDuration) || 5),
      scriptVariant: 0,
    }
    setData((prev) => ({ ...prev, orderItems: [...prev.orderItems, item] }))
    setNewTitle('')
    setNewDuration('5')
  }

  const removeItem = (id: string) => {
    setData((prev) => ({ ...prev, orderItems: prev.orderItems.filter((i) => i.id !== id) }))
  }

  const updateDuration = (id: string, duration: number) => {
    setData((prev) => ({
      ...prev,
      orderItems: prev.orderItems.map((i) => (i.id === id ? { ...i, duration: Math.max(1, duration) } : i)),
    }))
  }

  const total = data.orderItems.reduce((s, i) => s + i.duration, 0)

  return (
    <div className="min-h-screen bg-bg">
      <StepIndicator currentStep={3} onBack={onBack} />

      <div className="max-w-lg mx-auto px-4 py-8 pb-20">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-charcoal mb-1">식순 편집</h1>
            <p className="text-muted-text text-sm">드래그해서 순서를 변경하세요</p>
          </div>
          <div className="px-3 py-1.5 bg-sage-pale rounded-full border border-sage/20">
            <span className="text-sage text-sm font-bold tabular-nums">총 {total}분</span>
          </div>
        </div>

        {/* Order list */}
        <div className="space-y-2 mb-4">
          {data.orderItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
              className={`bg-surface rounded-[13px] border p-4 flex items-center gap-3 transition-all cursor-grab active:cursor-grabbing group ${
                dragId === item.id
                  ? 'opacity-40 scale-[0.98] shadow-none'
                  : dragOverId === item.id && dragId !== item.id
                  ? 'border-lavender bg-lavender-pale shadow-md -translate-y-0.5'
                  : 'border-border hover:border-lavender/30 hover:shadow-sm'
              }`}
            >
              {/* Index badge */}
              <div className="w-7 h-7 rounded-full bg-lavender-pale flex items-center justify-center flex-shrink-0">
                <span className="text-lavender text-[11px] font-bold tabular-nums">{index + 1}</span>
              </div>

              <DragHandle />

              {/* Title */}
              <span className="flex-1 text-charcoal font-semibold text-sm">{item.title}</span>

              {/* Duration input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={item.duration}
                  onChange={(e) => updateDuration(item.id, parseInt(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-11 text-center bg-muted-bg rounded-[6px] text-muted-text text-sm py-1 outline-none focus:ring-1 focus:ring-lavender tabular-nums"
                />
                <span className="text-muted-text text-xs">분</span>
              </div>

              {/* Delete */}
              <button
                onClick={() => removeItem(item.id)}
                className="text-muted-text/30 hover:text-rose transition-colors text-xs ml-1 opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add item */}
        <div className="bg-surface rounded-[13px] border-2 border-dashed border-border p-4 hover:border-lavender/40 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-muted-text/50 text-sm flex-shrink-0">+</span>
            <input
              type="text"
              placeholder="새 항목 입력 (예: 포토타임, 축사)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              className="flex-1 bg-transparent text-sm text-charcoal outline-none placeholder:text-muted-text/50"
            />
            <input
              type="number"
              min="1"
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              className="w-12 text-center bg-muted-bg rounded-[6px] text-muted-text text-sm py-1.5 outline-none tabular-nums"
              title="소요 시간(분)"
            />
            <span className="text-muted-text text-xs flex-shrink-0">분</span>
            <button
              onClick={addItem}
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 bg-lavender text-white rounded-[8px] text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-lavender-light transition-colors flex-shrink-0"
            >
              추가
            </button>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={onNext}
            className="w-full py-4 bg-lavender text-white rounded-[13px] font-bold text-base hover:bg-lavender-light transition-all hover:shadow-md"
          >
            다음 단계 →
          </button>
        </div>
      </div>
    </div>
  )
}
