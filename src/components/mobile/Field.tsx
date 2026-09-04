import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  required?: boolean
}

function closeNativePicker(input: HTMLInputElement) {
  requestAnimationFrame(() => input.blur())
}

export default function Field({
  label,
  error,
  required,
  className = '',
  type,
  onChange,
  onInput,
  ...props
}: Props) {
  const autoClose = type === 'time' || type === 'date'

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[13px] font-medium text-charcoal">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`w-full h-12 px-4 bg-surface border rounded-xl text-[15px] text-charcoal outline-none placeholder:text-muted-text/50 focus:border-accent focus:ring-2 focus:ring-accent/15 ${error ? 'border-danger' : 'border-border'} ${className}`}
        onChange={(e) => {
          onChange?.(e)
          if (autoClose) closeNativePicker(e.currentTarget)
        }}
        onInput={(e) => {
          onInput?.(e)
          if (autoClose) closeNativePicker(e.currentTarget)
        }}
        {...props}
      />
      {error && <p className="text-[12px] text-danger">{error}</p>}
    </div>
  )
}
