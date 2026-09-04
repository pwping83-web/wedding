import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  required?: boolean
}

export default function Field({ label, error, required, className = '', ...props }: Props) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[13px] font-medium text-charcoal">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <input
        className={`w-full h-12 px-4 bg-surface border rounded-xl text-[15px] text-charcoal outline-none placeholder:text-muted-text/50 focus:border-accent focus:ring-2 focus:ring-accent/15 ${error ? 'border-danger' : 'border-border'} ${className}`}
        {...props}
      />
      {error && <p className="text-[12px] text-danger">{error}</p>}
    </div>
  )
}
