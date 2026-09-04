import type { ReactNode } from 'react'
import Field from './Field'

interface Props {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  customValue?: string
  onCustomChange?: (value: string) => void
  customPlaceholder?: string
  hint?: ReactNode
}

export default function ChipSelectWithCustom({
  label,
  options,
  value,
  onChange,
  customValue = '',
  onCustomChange,
  customPlaceholder = '직접 입력',
  hint,
}: Props) {
  const isCustom = value === '__custom__'

  return (
    <div>
      <p className="text-[13px] font-medium text-charcoal mb-2">{label}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-full text-[12px] border ${
              value === opt
                ? 'bg-accent-soft text-accent border-accent/30'
                : 'bg-surface text-muted-text border-border'
            }`}
          >
            {opt}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange('__custom__')}
          className={`px-3 py-1.5 rounded-full text-[12px] border ${
            isCustom
              ? 'bg-charcoal text-white border-charcoal'
              : 'bg-surface text-muted-text border-border'
          }`}
        >
          직접 입력
        </button>
      </div>
      {isCustom && onCustomChange && (
        <Field
          placeholder={customPlaceholder}
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
        />
      )}
      {hint && <p className="text-[12px] text-muted-text mt-1">{hint}</p>}
    </div>
  )
}

export function resolveChipValue(preset: string, custom: string): string {
  if (preset === '__custom__') return custom.trim()
  return preset
}

export function isChipValueValid(preset: string, custom: string): boolean {
  if (preset === '__custom__') return custom.trim().length > 0
  return preset.trim().length > 0
}
