interface Props {
  step?: number
  total?: number
  label?: string
  onBack?: () => void
}

export default function StepBar({ step, total = 6, label, onBack }: Props) {
  const pct = step ? Math.round((step / total) * 100) : 0

  return (
    <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-md border-b border-border no-print">
      <div className="flex items-center h-12 px-4 gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 -ml-1 flex items-center justify-center text-charcoal text-lg"
            aria-label="이전"
          >
            ←
          </button>
        ) : (
          <div className="w-9" />
        )}
        <div className="flex-1 min-w-0">
          {label && (
            <p className="text-[13px] font-medium text-charcoal truncate text-center">{label}</p>
          )}
        </div>
        {step ? (
          <span className="text-[11px] text-muted-text tabular-nums w-9 text-right">
            {step}/{total}
          </span>
        ) : (
          <div className="w-9" />
        )}
      </div>
      {step && (
        <div className="h-0.5 bg-border mx-4 mb-0">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </header>
  )
}
